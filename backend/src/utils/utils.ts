
export const chunkArray = (array: string, size: number) => {

    let tmp = [];
    for (let i = 0; i < array.length; i += size) 
        tmp.push(array.slice(i, i + size));
    return tmp;

}

export const gurlp = ( name: string, url: string ) => {

    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var results = new RegExp("[\\?&]"+name+"=([^&#]*)").exec( url );
    return results == null ? null : results[1];

}

export const validateEmail = (email: string) => {

    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);

}

export const getClientIPFromSocket = (socket) => {

    const ip = socket.handshake.headers["x-real-ip"];

    if (!ip) return socket.handshake.address;
    return ip;

}

export function getRandomStringID (length: number = 10) {

    let string = "";
    
    for (let i = 0;i<length;i++) {
        string += "abcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.round(Math.random() * 36))
    }
    
    return string;   

}

export function pseudoIP (ip: string): string {

    if (ip.indexOf(":") > -1) { // IPv6

        //! FIXME: pseudo ipv6

        // let addrArray  = ipaddr.parse(ip).toByteArray();

        // for (let i = 7; i < 16; i++) 
        //     addrArray[i] = 0;

        // ip = ipaddr.fromByteArray(addrArray).toString();

    } else { // IPv4

        ip = ip.split(".").slice(0, 2).join(".") + ".*";

    }

    return ip;

}