import React, { useState } from 'react';
import Table from '../../components/table';

export default function () {

    const [publicKeys] = useState(([] as string[][]));

    // function createNewAuthn () {
    //     // webauthn.createNewAuthn({
    //     //     name: item.find("[name=name]").val(),
    //     //     attachment: $("input[name='platform']:checked").val()
    //     // });
    // }
    // TODO: WebAuthn einrichten (/docs/webauthn-demo)

    return (
        <div className="content">

            
            <h1>WebAuthn</h1>
            <p>Kennwortfeld beim nächsten Anmelden einfach leer lassen, um WebAuthn zu verwenden</p>

            <div className="cart padding big">
                <h3>Neuen Schlüssel hinzufügen</h3>
                <div className="input-flex">
                    <input placeholder="Schlüsselname" className="input" type="text" />
                    <button className="btn" >Schlüssel hinzufügen</button>
                </div>

            </div>

            <br />
            {(publicKeys.length > 0) ? (
                <div className="cart padding big">
                    <h3>gespeicherte Schlüssel</h3>

                    <Table header={["Name", "Erstellt", "Aktion"]} data={publicKeys} />

                        
                        {/* fas fa-trash-alt */}
                    <br />
                </div>
            ) : (
                <div className="cart padding">
                    <p style={{color: "yellow"}}>TODO: Anleitung</p>
                </div>
            )}

        </div>
    )

}
