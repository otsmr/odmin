import React, { useEffect, useState } from 'react';

import "../assets/style/pages/setup.scss"
import { Input } from '../components/input';
import socket from '../utils/socket';


export default function Setup ({}) {

    const [problemWithInput, setProblemWithInput] = useState({ inputid: "", msg: "", inputValue: "" });
    const [isLoading, setIsLoading] = useState(false);

    const TABS = [ "mysql", "admin", "smtp", "email", "privacy" ]

    const [currentTab, setCurrentTab] = useState(0);

    const [formElements, setFormElements] = useState([
        { label: "Name", value: "odmin", name: "mysql-database" },
        { label: "Username", value: "odmin", name: "mysql-user" },
        { label: "Password", value: "odmin", name: "mysql-pass" },
        { label: "Host", value: "odmin_mysql", name: "mysql-host" },
        { label: "Port", value: 3306, name: "mysql-port", type: "number" },

        { label: "Host", value: "", name: "smtp-host" },
        { label: "Port", value: "", name: "smtp-port", type: "number" },
        { label: "User", value: "", name: "smtp-user" },
        { label: "Secure", value: true, name: "smtp-secure", type: "checkbox" },
        { label: "Password", value: "", name: "smtp-pass" },

        { label: "Username", value: "admin", name: "admin-username" },
        { label: "Password", value: Array(12).fill(0).map(e => String.fromCharCode(Math.round(Math.random()*100) % 92 + 32)).join(""), name: "admin-password" },
        
        { label: "E-Mail", value: "", name: "admin-email" },
        
        { label: "Sending email address for account related emails", value: "account@example.org", name: "email-account" },

        { label: "IP addresses pseudonymize", value: true, name: "privacy-ip-addresses-pseudonymize", type: "checkbox" },
        { label: "IP Localization Service", value: "https://ipinfo.oproj.de/", name: "privacy-ip-localization-service" },
    ])

    function updateValue (name: string, event:  React.ChangeEvent<HTMLInputElement>) {

        const updatedFormElements = [...formElements];
        const formElement = updatedFormElements.find(e => e.name === name);

        if (!formElement)
            return;

        if (formElement.type === "checkbox")
            formElement.value = event.target.checked;
        else
            formElement.value = event.target.value;

        if (formElement.type === "number")
            formElement.value = parseInt(String(formElement.value));

        setFormElements(updatedFormElements);

    }

    function nextTab () {

        if (TABS[currentTab+1]) {
            return setCurrentTab(currentTab+1);
        }

    
        const formData = formElements.map(e => {return {name: e.name, value: e.value}});

        setIsLoading(true);
        socket.emit("/setup/save", formData, (error: boolean, tabid: number, problemWithInput: any) => {
            setIsLoading(false);

            if (error) {
                setCurrentTab(tabid);
                console.log(problemWithInput);
                problemWithInput.inputValue = formElements.find(e => e.name === problemWithInput.inputid)?.value;
                setProblemWithInput(problemWithInput);
                return;
            }

            (window as any).location.href = "/";                        

        })

    }


    return (

        <div className="content center bordered">

            {(isLoading) ? (
                <h1>Odmin is set up...</h1>
            ) : (

                <>
                <h1>Odmin installation</h1>

                <br />

                <h2>{currentTab+1}. {TABS[currentTab][0].toUpperCase() + TABS[currentTab].slice(1)}</h2>

                <br />

                {formElements.filter(e => e.name.startsWith(TABS[currentTab])).map(formElement => (
                    <div key={formElement.name} className="input-label">
                        <label>{formElement.label}</label>
                        <Input  inputid={formElement.name} problemWithInput={problemWithInput} setProblemWithInput={setProblemWithInput}>
                            <input value={String(formElement.value)} checked={formElement.value === true} className="input" type={formElement.type || "text"} onChange={e => updateValue(formElement.name, e)} />
                        </Input>
                    </div>
                ))}

                <br />

                <div className="footer">
                    {(TABS[currentTab-1] ? <div className="btn light" onClick={_ => setCurrentTab(currentTab-1)}> Back </div> : null)}
                    <div className="btn" onClick={nextTab}> {(TABS[currentTab+1] ? "Next" : "Save")}</div>
                </div>
                </>

            )}

            
        </div>

    )

}