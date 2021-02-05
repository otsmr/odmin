import React, { useState, useEffect } from 'react';
import Toast from '../../components/toast';
import { emptyInputProblem, Input, IInputProblem } from '../../components/input';
import Table from '../../components/table';
import Select from '../../components/select';
import socket from '../../../socket';
import { Link } from 'react-router-dom';

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
    logins: {
        plz: string,
        city: string,
        country: string,
        time: string
    }[],
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

export default function () {

    const [toasts, setToasts] = useState([<div key="-1"></div>]);
    const [problemWithInput, setProblemWithInput] = useState(emptyInputProblem);

    const [allUsers, setAllUsers] = useState(([] as IUser[]));
    const [selectedUser, setSelectedUser] = useState((null as IUserAll | null));

    function updateData () {

        socket.emit("/admin/users/getall", (err: boolean, allUsers?: IUser[]) => {
            if (err) return console.log("load users");

            setAllUsers(allUsers || []);

        })

    }

    function deleteUser (userid: number) {

    }

    function editUser (userid: number) {

        socket.emit("/admin/users/getuser", userid, (err: boolean, userData: IUserAll | null = null) => {

            if (err) return console.error("get user");

            console.log(userData);

            setSelectedUser(userData);

        })

    }

    useEffect(()=>{
        updateData();
    }, [])


    return (
        <div className="content">
            {toasts}

            <h1>Benutzer</h1>
            <h2 className="subtitle">Alle registrierten Benutzer</h2>

            {(selectedUser) ? (
                <div className="cart padding bigsize">
                    <h3>Benutzer: {selectedUser.name}</h3>

                    <div className="input-flex">
                        <button className="btn">Benutzer {(selectedUser.enabled) ? "deaktivieren" : "aktivieren"}</button>
                        <button className="btn warn" onClick={e => deleteUser(selectedUser.id)}><i className="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            ) : null}

            <div className="cart bigsize padding">
                <h3>alle Benutzer</h3>
                <br />

                <Table
                    className="small-padding"
                    header={["ID", "Benutzername", "Rolle", "Registriert", ""]}
                    disabledRows={allUsers.map(user => !user.enabled)}
                    data={allUsers.map(user => [String(user.id), user.name, roles.find(e => e.value === user.role)?.title || "-", user.createdAt, (
                    <div className="td-actions">
                       <Link to={`/admin/users/${user.id}`}>
                            <button className="btn"><i className="fas fa-edit"></i></button>
                        </Link>
                    </div>
                    )])}
                    
                    />

            </div>

        </div>
    )

}