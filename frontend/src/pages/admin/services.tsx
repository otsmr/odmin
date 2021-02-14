import React, { useState, useEffect } from 'react';
import Toast from '../../components/toast';
import { emptyInputProblem, Input, IInputProblem } from '../../components/input';
import Table from '../../components/table';
import socket from '../../utils/socket';

interface Service {
    id: number,
    serviceID: string,
    name: string,
    secret: string,
    createdAt: string,
    homepage: string,
    returnto: string
}

const emptyService = {
    id: -1,
    name: "",
    homepage: "https://",
    returnto: "https://"
}

export default function (props: {
    
}) {

    const [problemWithInput, setProblemWithInput] = useState(emptyInputProblem);
    const [toasts, setToasts] = useState([<div key="-1"></div>]);

    const [allServices, setAllServices] = useState(([] as Service[])); 
    const [newService, setNewService] = useState(emptyService);
    const [editService, setEditService] = useState(emptyService);


    function deleteService (serviceid: number) {

        socket.emit("/admin/services/delete", serviceid, (err: boolean) => {
            if (err) return console.error("delete service");
            updateData();
        })

    }

    function updateService () {

        socket.emit("/admin/services/update", editService, (err: boolean, data: {
            createSucesss: boolean,
            problemMessage?: string,
            problemWithInput?: IInputProblem
        }) => {
            if (err && !data.problemMessage) return console.error("update service");

            if (data.problemWithInput) return setProblemWithInput(data.problemWithInput);

            if (data.createSucesss) {
                setToasts(toasts.concat((
                    <Toast icon="check" key={Math.random()}>
                        <p>Der Service "{editService.name}" wurde aktualisiert</p>
                    </Toast>
                )))
                setEditService(emptyService);
                updateData();
            } else {
                setToasts(toasts.concat((
                    <Toast icon="warning" key={Math.random()}>
                        <p>{data.problemMessage}</p>
                    </Toast>
                )))
            }

        })

    }

    function createService () {

        socket.emit("/admin/services/create", newService, (err: boolean, data: {
            createSucesss: boolean,
            problemMessage?: string,
            problemWithInput?: IInputProblem
        }) => {
            if (err && !data.problemMessage) return console.error("create invitetoken");

            if (data.problemWithInput) return setProblemWithInput(data.problemWithInput);

            if (data.createSucesss) {
                setToasts(toasts.concat((
                    <Toast icon="check" key={Math.random()}>
                        <p>Der Service "{newService.name}" wurde erstellt</p>
                    </Toast>
                )))
                setNewService(emptyService);
                updateData();
            } else {
                setToasts(toasts.concat((
                    <Toast icon="warning" key={Math.random()}>
                        <p>{data.problemMessage}</p>
                    </Toast>
                )))
            }

        })

    }

    function updateData () {

        socket.emit("/admin/services/getall", (err: boolean, allServices?: Service[]) => {
            if (err) return console.log("load services");

            console.log(allServices);

            setAllServices(allServices || []);

        })

    }

    useEffect(()=>{
        updateData();
    }, [])
    

    return (

        <div className="content">

            {toasts}

            <h1>Services</h1>
            <h2 className="subtitle">Services, die sich mit Odmin anmelden können</h2>

            <div className="collection">

                <div className="cart padding" >
                    <h3>neuer Service</h3>

                    <p className="title">Name</p>
                    <div className="input-flex">
                        <Input inputid="name" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                            <input className="input" type="text" placeholder="Servicename" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value.replace(/[^a-zA-Z0-9_ ]/g, "")})} />
                        </Input>
                        {(newService.name.length > 0) ? (
                            <button className="btn" onClick={createService}>Hinzufügen</button>
                        ) : null}
                    </div>
                        
                    <br />
                    {(newService.name.length > 0) ? (
                        <>
                        <p className="title">Homepage</p>
                        <Input inputid="homepage" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                            <input className="input big" type="text" placeholder="https://" value={newService.homepage} onChange={e => setNewService({...newService, homepage: e.target.value })} />
                        </Input>
                        
                        <br />
                        <p className="title">CallBack URL</p>
                        <Input inputid="returnto" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                            <input className="input big" type="text" placeholder="https://" value={newService.returnto} onChange={e => setNewService({...newService, returnto: e.target.value })} />
                        </Input>

                        <br />
                        </>
                    ) : null}

                </div>

                {(editService.id !== -1) ? (

                    <div className="cart padding" >
                        <h3>Service bearbeiten</h3>

                        <p className="title">Name</p>
                        <div className="input-flex">
                            <Input inputid="edit-name" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                                <input className="input" type="text" value={editService.name} onChange={e => setEditService({...editService, name: e.target.value.replace(/[^a-zA-Z0-9_ ]/g, "")})} />
                            </Input>
                            <button className="btn" onClick={updateService}>Speichern</button>
                        </div>

                        <br />
                        <p className="title">Homepage</p>
                        <Input inputid="edit-homepage" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                            <input className="input big" type="text" placeholder="https://" value={editService.homepage} onChange={e => setEditService({...editService, homepage: e.target.value })} />
                        </Input>
                        
                        <br />
                        <p className="title">CallBack URL</p>
                        <Input inputid="edit-returnto" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                            <input className="input big" type="text" placeholder="https://" value={editService.returnto} onChange={e => setEditService({...editService, returnto: e.target.value })} />
                        </Input>

                        <br />

                    </div>
                ) : null}

            </div>

            {(allServices.length > 0) ? (
                <div className="cart bigsize padding">
                    <h3>alle Services</h3>
                    <br />

                    <Table
                        className="small-padding"
                        header={["Name", "ServiceID", "Secret", "CallBack URL", "Erstellt am", ""]}
                        data={allServices.map(service => [service.name, service.serviceID, service.secret, service.returnto, service.createdAt,  (
                        <div className="td-actions">
                            <button className="btn" onClick={e => setEditService(service)}><i className="fas fa-edit"></i></button>
                            <button className="btn warn" onClick={e => deleteService(service.id)}><i className="fas fa-trash-alt"></i></button>
                        </div>
                        )])}
                        
                        />

                </div>
            ) : null}

        </div>
    )

}