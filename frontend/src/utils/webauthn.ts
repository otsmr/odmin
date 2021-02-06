
import socket from "../utils/socket";

import {
    base64encode,
    arrayBufferToString,
    stringToArrayBuffer,
    convertToUint8Array
} from "./webauthn-utils";


export function detectWebAuthnSupport() {

    if ( window.PublicKeyCredential === undefined || typeof window.PublicKeyCredential !== "function" ) 
        return false;
    return true;

}
export function checkIsPlatformAvailable (call: {(status: boolean): void}) {

    if (!detectWebAuthnSupport() || typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== "function")
        return call(false);

    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(available => {
        if (available) call(true);
        else call(false);
    }).catch(e => {
        call(false);
    });

}



function createNewAuthnCredential () {

    const options = {
        attestationType: "",
        authenticatorAttachment: "",

        userVerification: "",
        residentKeyRequirement: "",
        txAuthSimpleExtension: ""
    }

    socket.emit("/webauthn/makechallenge", (err: Boolean, options: any, userid: string, challenge:any, credentialIDs: string[]) => {

        if (err) return alert("Fehler");

        const makeCredentialOptions = {
            rp: {
                name: options.rp_name,
                id: options.rp_id
            },
            user: {
                id: stringToArrayBuffer(userid),
                name: options.name,
                displayName: options.name
            },
            pubKeyCredParams: [
                { type: "public-key", alg: -7 },
                { type: "public-key", alg: -257 }
            ],
            authenticatorSelection: {
                requireResidentKey: false,
                userVerification: "discouraged"
            },
            timeout: 60000,
            challenge: stringToArrayBuffer(challenge),
            excludeCredentials: convertToUint8Array(credentialIDs),
            attestation: "none"
        }

        return navigator.credentials.create({
            publicKey: makeCredentialOptions as any
        }).then((rawAttestation:any) => {

            const credential = {
                id: rawAttestation.id,
                rawId: base64encode(rawAttestation.rawId),
                type: rawAttestation.type,
                response: {
                    clientDataJSON: arrayBufferToString(rawAttestation.response.clientDataJSON),
                    attestationObject: base64encode(rawAttestation.response.attestationObject)
                }
            };

            socket.emit("/webauthn/registernewcredential", options, credential, (err: boolean) => {
                console.info("Gespeichert");
            })

        }).catch((e) => {
            console.log(e);
            const err = e.toString().split(":")[0];
            console.error(e);
            if (err === `NotAllowedError`) {
                console.log("Benutzer abgebrochen");
            } else {
                // TODO: Fehler definieren
                console.log("Schlüsseln in Verwendung");
            }
        })
    });

}

function signInWithAuthn (username: string, call: {(err: boolean, status: boolean): void}) {

    if (typeof navigator.credentials === "undefined") return call(true, false);

    socket.emit("/webauthn/getchallenge", username, (err:Boolean, options: any, challenge: string, credentialIDs: string[]) => {

        if (err) {
            console.error(err);
            return call(true, false);
        }

        const getAssertionOptions = {
            allowCredentials: convertToUint8Array(credentialIDs),
            rpId: options.rp_id,
            challenge: stringToArrayBuffer(challenge),
            timeout: 60000
        }

        // return navigator.credentials.get({
        //     publicKey: getAssertionOptions
        // }).then((rawAssertion:any) => {

        //     socket.emit("/webauthn/assertion", {
        //         id: base64encode(rawAssertion.rawId),
        //         clientDataJSON: arrayBufferToString(rawAssertion.response.clientDataJSON),
        //         userHandle: base64encode(rawAssertion.response.userHandle),
        //         signature: base64encode(rawAssertion.response.signature),
        //         authenticatorData: base64encode(rawAssertion.response.authenticatorData)
        //     }, (status: boolean) => {
        //         call(false, status)
        //     });

        // }).catch(e => {
        //     const err = e.toString().split(":")[0];
        //     if (err !== `NotAllowedError`) {
        //         console.log("FEHLER");
        //     }
        //     call(true, false);
        // });
    })

}

export function initWebAutnForSignin () {

    socket.on("/webauthn/signinwithauthn", (username: string, call: {(): void}) => {
        signInWithAuthn(username, call);
    })
    
}