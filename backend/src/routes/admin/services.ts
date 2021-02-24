import * as moment from "moment"
import { getAllServices, getServiceByName, updateCreateService, IService, removeServiceById, getServiceById } from "../../database/services/service";
import config from "../../utils/config";
import { confirm } from "../../utils/dialog";

interface IInputProblem { inputid: string, msg: string, inputValue: string }

interface ServiceCallBack {(err: boolean, data: {
    createSucesss: boolean,
    problemMessage?: string,
    problemWithInput?: IInputProblem
}): void}


async function checkAndSaveService (userid: number, service: IService, inputPrefix: string, call: ServiceCallBack) {

    service.name = service.name.replace(/[^a-zA-Z0-9_ ]/g, "");

    if (config.get("runmode") !== "development") {

        if (!service.homepage.startsWith("https://")) return call(false, {
            createSucesss: false,
            problemWithInput: {
                inputid: inputPrefix + "homepage",
                inputValue: service.homepage,
                msg: "Webseite muss mit https:// beginnen"
            }
        }); 
        if (!service.returnto.startsWith("https://")) return call(false, {
            createSucesss: false,
            problemWithInput: {
                inputid: inputPrefix + "returnto",
                inputValue: service.returnto,
                msg: "CallBack URL muss mit https:// beginnen"
            }
        });

    }

    const success = await updateCreateService(userid, service);

    if (success) return call(false, {
        createSucesss: true
    })
    
    call(false, {
        createSucesss: false,
        problemMessage: "Fehler beim speichern"
    });

    
}


export default (socket: any, slog: {(msg: string): void}) => {

    // socket.user.role

    socket
    
    .on("/admin/services/getall", async (call: {(err: boolean, allServices?: IService[]): void}) => {
        
        slog("API /admin/services/getall");

        if (!socket.user || socket.user.role !== "admin") return call(true);

        const services = await getAllServices();

        call(false, services.map((service: IService) => {
            return {
                id: service.id,
                name: service.name,
                secret: service.secret,
                homepage: service.homepage,
                returnto: service.returnto,
                serviceID: service.serviceID,
                createdAt: moment(new Date(service.createdAt).getTime()).format("DD.MM.YYYY HH:mm")
            }
        }));

    })

    .on("/admin/services/create", async (newService: IService, call: ServiceCallBack) => {

        slog("API /admin/services/create");

        if (!socket.user || socket.user.role !== "admin") return call(true, {
            createSucesss: false,
            problemMessage: "Keine ausreichenden Rechte"
        });

        const isService = await getServiceByName(newService.name);

        if (isService) return call(false, {
            createSucesss: false,
            problemWithInput: {
                inputid: "name",
                inputValue: newService.name,
                msg: "Service schon vorhanden"
            }
        });

        checkAndSaveService(socket.user.id, newService, "", call);

    })

    .on("/admin/services/update", async (service: IService, call: ServiceCallBack) => {

        slog("API /admin/services/update");

        if (!socket.user || socket.user.role !== "admin") return call(true, {
            createSucesss: false,
            problemMessage: "Keine ausreichenden Rechte"
        });

        checkAndSaveService(socket.user.id, service, "edit-", call);

    })

    .on("/admin/services/delete", async (serviceid: number, call: {(err: boolean): void}) => {

        slog("API /admin/services/delete");

        if (!socket.user || socket.user.role !== "admin") return call(true);

        const service = await getServiceById(serviceid);
        if (!service) return call(true);

        confirm(socket, {
            title: 'Service löschen?',
            text: `Der Service "${service.name}" wird unwiederruflich gelöscht.`,
            onSuccess: async () => {
                call(!await removeServiceById(serviceid));
            }
        })

    })

}