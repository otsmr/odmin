import React, { useState, useEffect } from 'react';
import Toast from '../../../components/toast';
import { emptyInputProblem, Input, IInputProblem } from '../../../components/input';
import Table from '../../../components/table';
import Select from '../../../components/select';
import socket from '../../../../socket';
import { Link, Redirect } from 'react-router-dom';
import { TableSessions, ISession } from '../../security';

interface IUser {
    id: number,
    name: string,
    role: string,
    enabled: boolean,
    createdAt: string
}

interface IUserAll extends IUser {
    isTwoFAEnabled: boolean,
    isWebAuthnInUse: boolean,
    lastLogin: string,
    updatedAt: string,
    sessions: ISession[],
    chanels: {
        email: string,
        matrixid: string,
        telegramid: string
    }
}

const roles = [
    { title: "Standard", value: "viewer"},
    { title: "Mitarbeiter", value: "editor"},
    { title: "Administrator", value: "admin"}
]

export default function (props: any) {
    console.log(props);
    const userid = props.match.params.userid;
    if (!userid) return (
        <Redirect to="/admin/users"></Redirect>
    )

    const [toasts, setToasts] = useState([<div key="-1"></div>]);
    const [problemWithInput, setProblemWithInput] = useState(emptyInputProblem);

    const [selectedUser, setSelectedUser] = useState((null as IUserAll | null));

    function updateData () {

        socket.emit("/admin/users/getuser", userid, (err: boolean, userData: IUserAll | null = null) => {
    
            if (err) return console.error("get user");
        
            userData?.sessions.reverse();

            setSelectedUser(userData);
    
        })

    }

    function deleteUser (userid: number) {

    }

    useEffect(()=>{
        updateData();
    }, [])

    if (!selectedUser) return null;

    return (
        <div className="content">
            {toasts}

            <h1>Benutzer: {selectedUser?.name}</h1>
            <h2 className="subtitle">Alle registrierten Benutzer</h2>

            <div className="cart padding bigsize">
                <h3>Einstellungen</h3>

                <div className="input-flex">
                    <button className="btn">{(selectedUser.enabled) ? "Deaktivieren" : "Aktivieren"}</button>
                    <button className="btn warn" onClick={e => deleteUser(selectedUser.id)}>Löschen</button>
                </div>
            </div>

            <div className="cart bigsize">
                <div className="body">
                    <h3>Sessions</h3>
                    <br />

                    <TableSessions
                        sessions={selectedUser.sessions}
                        actions={s => (
                            <div className="td-actions">
                                {/* <button className="btn warn" onClick={e => deleteSession(s.id)}><i className="fas fa-trash-alt"></i></button> */}
                            </div>
                        )} />


                    <br />
                </div>
            </div>

        </div>
    )

}