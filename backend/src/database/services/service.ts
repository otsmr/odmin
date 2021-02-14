import { Service } from '../initdb';
import * as url from 'url';
import * as crypto from 'crypto';
import log from "../../utils/logs"
import { getRandomStringID } from '../../utils/utils';

export interface IService {
    id: number,
    serviceID: string,
    name: string,
    secret: string,
    createdAt: string,
    homepage: string,
    returnto: string
}

export const getServiceByName =  async (name: string): Promise<IService | null> => {

    const services = await Service.findAll({ where: { name } });

    if (services && services.length > 0) return services[0];
    return null;

}
export const getServiceBySecret =  async (secret: string): Promise<IService | null> => {

    const services = await Service.findAll({ where: { secret } });

    if (services && services.length > 0) return services[0];
    return null;

}
export const getServiceByServiceId =  async (serviceid: string): Promise<IService | null> => {

    const services = await Service.findAll({ where: { serviceID: serviceid } });

    if (services && services.length > 0) return services[0];
    return null;

}

export const getServiceById =  async (serviceid: number): Promise<IService | null> => {

    const services = await Service.findAll({
        where: {
            id: serviceid
        }
    });

    if (services && services.length > 0) return services[0];
    return null;

}

export const getAllServices =  async (): Promise<IService[]> => {

    return await Service.findAll();

}

export const removeServiceById = async (serviceid: number): Promise<boolean> => {

    try {
        
        const service = await Service.findAll({ where: {
            id: serviceid
        }});

       if (service) await service[0].destroy();
       return true;

    } catch (e) {
        log.error("database", `removeServiceById: ${e.toString()}` );
    }

    return false

}

export const updateCreateService =  async (userid: number, service: IService): Promise<boolean> => {

    try {

        let services = null;

        if (service.id === -1) {
            services = await getServiceByName(service.name);
        } else {
            services = await Service.findAll({
                where: {
                    id: service.id
                }
            }); 
        }

        if (services && services.length > 0) {
            await services[0].update({
                homepage: service.homepage,
                name: service.name,
                returnto: service.returnto
            });
        } else {
            
            await Service.create({
                serviceID: getRandomStringID(),
                secret: crypto.randomBytes(30).toString('hex'),
                homepage: service.homepage,
                returnto: service.returnto,
                name: service.name,
                user_id: userid
            })
        }

        return true;

    } catch (error) {
        log.error("database", `updateCreateService: ${error.toString()}` );
    }
    return false;

}

export const checkContinueLocation = (checkContinue: string): string => {

    const whitelist = [ "localhost" ];

    const domain = url.parse(checkContinue);

    if (whitelist.indexOf(domain.hostname) > -1) return checkContinue;

    return "/";

}