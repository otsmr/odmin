import React, { useState } from 'react';
import { createBeautifulCountdown } from '../utils/utils';
import socket from '../utils/socket';

export interface IService { 
    id: string
    name: string
    homepage: string
} 

export function checkService (
    setService: React.Dispatch<React.SetStateAction<IService | null>>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
): void {

    const search = (window as any).location.search;

    const indexStart = search.indexOf("serviceid=");
    if (indexStart === -1) return setIsLoading(false);

    let indexEnd = search.indexOf("&", indexStart);
    if (indexEnd === - 1) indexEnd = search.length;
    const serviceid: string = search.slice(indexStart + 10, indexEnd);

    socket.emit("/sign/checkservice", serviceid, (err: boolean, service: {
        name: string,
        homepage: string
    } | null) => {

        setIsLoading(false);
        if (!err && service) setService({
            id: serviceid,
            ...service
        })
        else setService(null);

    })

}

export function useLockedSign (): {
    setIsLocked:  { (status: boolean): void }
    lockedElement: JSX.Element,
    isLocked: boolean,
    updateLockedTime: {(): void}
} {

    const [isLocked, setIsLocked] = useState(false);
    const [countdown, setCountdown] = useState("--:--");


    let sollZeit = 0;
    let istZeit = 0;
    let nextCheck = 0;

    const updateLockedTime = () => {

        if (nextCheck <= 0 || sollZeit - istZeit <= 0) {

            socket.emit("/sign/getlockedtime", (err: boolean, data: {
                timeLocked: number,
                isLocked: boolean
            }) => {

                if (err) return console.error(err);

                console.log(data);
                
                if (!data.isLocked) {
                    return setIsLocked(false);
                } else {
                    setIsLocked(true);
                    setTimeout(updateLockedTime, 1000);
                }

                sollZeit = data.timeLocked;
                nextCheck = 20;

            });

        } else {
            setCountdown(createBeautifulCountdown(sollZeit, istZeit));
            setTimeout(updateLockedTime, 1000);
        }


        nextCheck--;
        istZeit = + new Date();


    }

    return { 
        isLocked,
        updateLockedTime: updateLockedTime,
        setIsLocked: (status: boolean) => {

            if (status) updateLockedTime();

            setIsLocked(status);

        },
        lockedElement: (
            <div className="time-based-locked">
                <p>Vorübergehend gesperrt</p>
                <h1>{countdown}</h1>
            </div>
        )
    };

}