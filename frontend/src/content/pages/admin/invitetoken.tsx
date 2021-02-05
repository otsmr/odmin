import React, { useState, useEffect } from 'react';
import { Input, emptyInputProblem, IInputProblem } from '../../components/input';
import Toast from '../../components/toast';
import Table from '../../components/table';
import socket from '../../../socket';

interface Token {
    name: string,
    id: number,
    createdAt: string
}

export default function () {

    const [problemWithInput, setProblemWithInput] = useState(emptyInputProblem);
    const [toasts, setToasts] = useState([<div key="-1"></div>]);
    
    const [newToken, setNewToken] = useState("");
    const [allTokens, setAllTokens] = useState(([] as Token[]));


    function deleteToken (tokenid: number) {

        socket.emit("/admin/invitetoken/delete", tokenid, (err: boolean) => {
            if (err) return console.error("delete token");
            updateData();
        })

    }

    function createToken () {

        socket.emit("/admin/invitetoken/create", newToken , (err: boolean, data: {
            createSucesss: boolean,
            problemMessage?: string,
            problemWithInput?: IInputProblem
        }) => {
            if (err && !data.problemMessage) return console.error("create invitetoken");

            if (data.problemWithInput) return setProblemWithInput(data.problemWithInput);

            if (data.createSucesss) {
                setToasts(toasts.concat((
                    <Toast icon="check" key={Math.random()}>
                        <p>Der Token "{newToken}" wurde erstellt</p>
                    </Toast>
                )))
                setNewToken("");
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

        socket.emit("/admin/invtetoken/getall", (err: boolean, allTokens?: Token[]) => {
            if (err) return console.log("load tokens");

            setAllTokens(allTokens || []);

        })

    }

    useEffect(()=>{
        updateData();
    }, [])

    return (

        <div className="content">

            {toasts}

            <h1>Einladungstoken</h1>
            <h2 className="subtitle">Einladungstoken zur Registrierung</h2> 

            {/* // TODO: de- und aktivieren, Einladungstoken per Mail senden */}

            <div className="cart padding">
                <h3>neuer Einladungstoken</h3>
                <div className="input-flex">
                    <Input inputid="token" problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                        <input autoFocus placeholder="787e121" className="input" type="text" value={newToken} onChange={e => setNewToken(e.target.value)} />
                    </Input>
                    {(newToken.length > 2) ? (
                        <button onClick={createToken} className="btn">Hinzufügen</button>
                        ) : null}
                </div>

            </div>

            <div className="cart bigsize padding">
                <h3>aktive Einladungstoken</h3>
                <br />

                <Table
                    className="small-padding"
                    header={["Token", "Erstellt am", ""]}
                    data={allTokens.map(token => [token.name, token.createdAt, (
                    <div className="td-actions">
                        <button className="btn warn" onClick={e => deleteToken(token.id)}><i className="fas fa-trash-alt"></i></button>
                    </div>
                    )])}
                    
                    />

            </div>

        </div>
    )

}