import React, { useEffect } from 'react';
import { Portal } from './portal';

import "../assets/style/component/modal.scss"

export default function (props: {
    title: string,
    children: JSX.Element,
    footer: JSX.Element,
    closeModal?: {(): void}
}) {

    useEffect(()=>{

        function onRootClick () {

            if (props.closeModal) props.closeModal(); 

        }

        const root = document.querySelector("#root");
        if (!root) return;

        root.classList.add("openmodal");
        root.addEventListener("click", onRootClick)
        
        return () => {
            root.classList.remove("openmodal");
            root.removeEventListener("click", onRootClick)
        }

    })

    return (

        <Portal id="portal">
            <>
                <div className='modal'>
                    <header>
                        <h1>{props.title}</h1>
                    </header>
                    <div className='body'>
                        {props.children}
                    </div>
                    <footer>
                        {props.footer}
                    </footer>
                </div>
                {/* <div className="openmodal"></div> */}
            </>
        </Portal>

    )

}