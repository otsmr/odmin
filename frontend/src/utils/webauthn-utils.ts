export function randomInt (length:number = 5) {
    return Math.round(Math.random() * Math.pow(10, length))
}

export function getDBTime(date: Date | number = new Date()) {
    return parseInt("" + new Date(date).getTime() / 1000);
}


export function getQueryVariable(variable: string) {

    var vars = window.location.search.substring(1).split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) return pair[1];
    }
    return null;

}

export function base64encode(arrayBuffer: any) {
    if (!arrayBuffer || arrayBuffer.length == 0) return undefined;
    return btoa(String.fromCharCode.apply(null, (new Uint8Array(arrayBuffer) as any)));
}

export function arrayBufferToString(arrayBuffer: any) {
    return String.fromCharCode.apply(null, (new Uint8Array(arrayBuffer) as any));
}

export function stringToArrayBuffer(str:string) {
    return Uint8Array.from(str, c => c.charCodeAt(0)).buffer;
}

export function convertToUint8Array (credentialIDs: any[]) {
    return credentialIDs.map((credentialId: string) => {
        return {
            type: "public-key",
            id: Uint8Array.from(atob(credentialId), c=>c.charCodeAt(0)).buffer
        }
    })
}