
import moment from "moment";

export function setHttpOnlyCookie (cookies: object, callBack: {(): void}) {

    fetch((window as any).API_BASE + "/api/v0/set-cookie", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(cookies)
    })
    .then(e => e.json())
    .then(e => {
        callBack();
    })

}

export function createBeautifulCountdown (sollZeit: number, istZeit: number) {
    if (sollZeit - istZeit <= 0) return "00:00:00";
    const duration = moment.duration(sollZeit - istZeit);
    let countdown = "";
    const h = duration.hours();
    if (h >= 10) countdown += h + ":";
    if (h < 10 && h > 0) countdown += "0" + h + ":";
    const m = duration.minutes();
    if (m >= 10) countdown += m + ":";
    if (m < 10 && m > 0) countdown += "0" + m + ":";
    if (m === 0 && h >= 0) countdown += "00:"
    const s = duration.seconds();
    if (s >= 10) countdown += s;
    if (s < 10) countdown += "0" + s;
    return countdown;
}

export function setCookie (cname: string, cvalue: string, exdays: number = 1) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function blurAll () {
    const tmp = document.createElement("input");
    document.body.appendChild(tmp);
    tmp.focus();
    document.body.removeChild(tmp);
}

export const downloadFile = (name: string, body: string, content: string = "text/plain") => {

    var element = document.createElement('a');
    element.setAttribute('href', `data:${content};charset=utf-8,` + encodeURIComponent(body));
    element.setAttribute('download', name);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);

}

export const cleanUsername = (username: string) => {
    return username.toLowerCase().replace(/((?![a-zA-Z0-9_]))./g, '')
}

export const getSearchLocation = (name: string) => {

    let search = (window as any).location.search.substring(1).split("&").map((e: string) => e.split("="));

    return search.find((e: string[]) => e[0] === name)[1] || null;

}