import React, { useEffect, useState } from 'react';

import { Portal } from './portal';


import "../../style/component/toast.scss"


export default function (props: {
    icon: string,
    children: JSX.Element,
    timeInS?: number
}) {

    const [display, setDisplay] = useState(true);

    useEffect(()=>{

        setTimeout(() => {
            setDisplay(false);
        }, 5000);

        return () => {
            
        }

    })

    return (

        (display) ? (<Portal key={Math.random()} id="toasts">
            <div className={'toast ' + props.icon}>
                <div className='body'>
                    {props.children}
                </div>
                <div className="icon">
                    <span className="m-icon">{props.icon}</span>
                </div>
            </div>
        </Portal>) : null

    )

}