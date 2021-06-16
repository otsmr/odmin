import config from "./config"
import log from "./logs"
import fetch from "node-fetch"

const localDomains = [
    "::1",
    "localhost",
    "127.0.0.1",
    "::ffff:127.0.0.1"
]

export async function getRealIpInDevMode (ipadress: string): Promise<string> {

    if (
        config.get("runmode") === "development" && 
        (
            localDomains.indexOf(ipadress) > -1 ||
            ipadress.startsWith("127.0.0.") ||
            ipadress.startsWith("::ffff:")
        )    
    ) {
        try {
            
            let res = await fetch(config.get("privacy:ip-localization-service") + "/api/myip");
            let data = await res.json();
            ipadress = data.ip || "";

        } catch (error) {
            log.error("getRealIpInDevMode", `ERROR: ${error}`);
        }

    }

    return ipadress;

}

export async function getLocationFromIP (ipadress: string): Promise<{
    city: string
    plz: string
    country: string
}> {
    
    const location = {
        city: "",
        plz: "",
        country: "",
    }

    try {
                    
        const response = await fetch(config.get("privacy:ip-localization-service") + "/api/ip", {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ip: ipadress
            })
        });
        const responseJSON = await response.json();

        location.city = responseJSON.city;
        location.plz = responseJSON.zipcode;
        location.country = responseJSON.country_long + ` (${responseJSON.region})`;

    } catch (error) {
        log.error("getLocationFromIP", `ERROR: ${error}`);
    }
    
    return location;
}