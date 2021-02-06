import React from 'react';
import { Link } from 'react-router-dom';

export default function (props: {
    username: string
}) {

    return (
        <div className="content">
            <h1>Willkommen, {props.username}</h1>
            <p>Datenschutz- und Sicherheitseinstellungen verwalten, um Odmin optimal an die jeweiligen Bedürfnisse anzupassen</p>

            <div className="collection carts">

                <div className="cart">
                    <div className="body">
                        <div className="text">
                            <h3>Persönliche Daten</h3>
                            <p>Persönliche Daten des Odmin-Kontos anschauen und auswählen, welche Aktivitäten gespeichert werden</p>
                        </div>
                        <div className="img">
                        </div>
                    </div>
                    <Link to="/personalinfo" className="footer">Daten verwalten</Link>
                </div>

                <div className="cart">
                    <div className="body">
                        <div className="text">
                            <h3>Sicherheit</h3>
                            <p>Einstellungen und Empfehlungen, mit denen das Konto optimal geschützen werden kann</p>
                        </div>
                        <div className="img">
                        </div>
                    </div>
                    <Link to="/security" className="footer">Jetzt starten</Link>
                </div>

            </div>
        </div>
        
    )

}