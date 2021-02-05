import React from 'react';

export default function (props: {

}) {

    return (
        <div className="content">

            <h1>verdächtiges Verhalten</h1>
            <h2 className="subtitle">Die Funktion verdächtiges Verhalten kann die Kontosicherheit erhöhen</h2>

            <h2>Erkennen</h2>
            <ul>
                <li>Standort -&gt; ip-adresse</li>
                <li>-&gt; alte Sessions weiterhin speichern?</li>
                <li>Browser / Betriebsystem</li>
                <li>Verbindungstyp (vpn, tor)</li>
                <li>verdächtige Einstellungen (webauthn-key, passwort, benutzername)</li>
            </ul>
            <h2>Verhindern (wenn erkannt)</h2>
            <ul>
                <li>2FA-Auth über Kanal (Benachrichtigungen)</li>
                <li>Login nach hinten verschieben</li>
                <li>Login verhindern (oder Funktionen einschränken)</li>
            </ul>

        </div>
    )
}