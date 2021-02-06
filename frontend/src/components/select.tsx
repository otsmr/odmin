import React, { useEffect, useState, useRef } from 'react';

import "../assets/style/elements/select.scss"

export default function (props: {
    options: { value?: string, title: string }[],
    title: string,
    value: string,
    onChange: {(newValue: string | null): void}
}) {

    // Option: disabled

    const [isOpen, setIsOpen] = useState(false);
    const [isTop, setIsTop] = useState(false);

    const [filterBy, setFilterBy] = useState("");

    const select = useRef((null as any));


    useEffect(()=>{

        function onDocumentClick (event: MouseEvent) {

            if (select.current?.parentElement.querySelector(":hover") !== select.current) 
                setIsOpen(false);
            
        }
        
        document.addEventListener("click", onDocumentClick)

        return () => {
            document.removeEventListener("click", onDocumentClick)
        }

    }, [])

    function selectOption (event: React.MouseEvent<HTMLLIElement, MouseEvent>) {

        setIsOpen(false);

        const optionid = parseInt(event.currentTarget.dataset["optionid"] || "-1");

        if (optionid === -1) return;

        props.onChange(props.options[optionid].value || "");

    }

    function openSelect () {

        const sItem = select.current;
        if (!sItem) return;

        if (
            sItem.querySelector(".list:hover") === null &&
            sItem.querySelector(".fa-times:hover") === null
        ) setIsOpen(!isOpen);

        if (isOpen) return;

        setTimeout(() => {
            if ((sItem.offsetTop + sItem.offsetHeight + sItem.querySelector(".list")?.offsetHeight) > document.body.offsetHeight) 
                setIsTop(true);
            else setIsTop(false);
        }, 0);

    }


    return (

        <div
          className={"select input" + ((isOpen) ? " open" : "") + ((isTop) ? " top" : "")}
          ref={select}
          onClick={openSelect}
          >

            {(props.value) ? (
                <div className='overlay'>
                    <div>
                        {props.options.find(e => e.value === props.value)?.title}
                        <i className="fas fa-times" onClick={e => props.onChange(null)}></i>
                    </div>
                </div>
            ) : null}

            <div className="toggle">{props.title}</div>
            {(isOpen) ? (
                <div className={"list" + ((props.options.length > 5) ? " search" : "")}>
                    {(props.options.length > 5) ? (
                        <input autoFocus placeholder="Suchen" className="input" value={filterBy} onChange={e => setFilterBy(e.target.value)} />
                    ) : null}
                    <ul>
                    {props.options.filter(option => option.title.toLowerCase().indexOf(filterBy.toLowerCase()) > -1).map((option, index: number) => (
                        (option.value) ? (
                            <li className={(option.value === props.value) ? "selected" : ""} key={index} data-optionid={index} onClick={selectOption}>{option.title}</li>
                        ) : (
                            <div key={index}>{option.title}</div>
                        )
                    ))}
                    </ul>
                </div>
            ) : null}

        </div>

    )

}