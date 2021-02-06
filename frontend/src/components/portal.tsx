import { createPortal } from "react-dom";
import { useEffect } from "react";


export function Portal(props: { id: string; children: any }) {

    const rootElement = document.querySelector(`#${props.id}`) || document.createElement("div");
    

    useEffect(()=> {

        rootElement.classList.add("open");
        
        return () => {
            rootElement.classList.remove("open");
        }

    })

    return createPortal(props.children, rootElement);

}
