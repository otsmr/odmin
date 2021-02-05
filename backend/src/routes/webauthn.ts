
// import * as fido from "../utils/fido";
// import config from "../utils/config";
// import log from "../utils/logs";

// import { getUserByUsername } from "../database/services/user";
// import {
//     getAllKeysByUserid,
//     addNewCredentialForUser
// } from "../database/services/webauthn";

// import { checkPassword } from "../utils/dialog";


// export default async (socket) => {

//     socket
    
//     .on("webauthn:signin:getChallenge", async (username: string, call: Function) => {

//         const user = await getUserByUsername(username);

//         if (!user) return call(true);

//         const challenge = fido.getChallenge(user.id);
//         let credentialIDs = await getAllKeysByUserid(user.id);
//         credentialIDs = credentialIDs.map(e => e.credentialID);

//         if (credentialIDs.length === 0) return call(true);

//         socket.tmpUserWebAuthn = user;

//         call(false, {
//             rp_id: config.get("webauthn:rp_id")
//         }, challenge, credentialIDs);

//     })

//     .on("webauthn:sigin:assertion", async (assertion, call) => {

//         try {

//             const res = await fido.verifyAssertion(assertion);

//             if (res.userid === socket.tmpUserWebAuthn.id) {
//                 socket.webauthnUser = socket.tmpUserWebAuthn;
//                 call(true);
//             } else throw "failed"
            
//         } catch (error) {
//             log.error("socket", `webauthn:sigin:assertion: ${error.toString()}`);
//             socket.tmpUserWebAuthn = null;
//             call(false);
//         }        

//     })
    
//     .on("webauthn:getChallenge", async (call) => {

//         try {
//             const challenge = fido.getChallenge(socket.user.id);
//             let credentialIDs = await getAllKeysByUserid(socket.user.id);
//             credentialIDs = credentialIDs.map(e => e.credentialID);
//             call(false, {
//                 rp_id: config.get("webauthn:rp_id"),
//                 rp_name: config.get("webauthn:rp_name")
//             }, String(socket.user.id), challenge, credentialIDs);
//         } catch (error) {
//             log.error("socket", `webauthn:getChallenge: ${error.toString()}`);
//             call(true);
//         }

//     })
    
//     .on("webauthn:makeCredential", async (options, attestation, call) => {

//         try {

//             const credential = fido.makeCredential(attestation);

//             if (credential.userid !== socket.user.id) throw Error("Unbekannter Benutzer");

//             checkPassword(socket, "Schlüssel hinzufügen", async () => {
//                 await addNewCredentialForUser({
//                     userid: socket.user.id,
//                     name: options.name,
//                     type: options.attachment
//                 }, credential.credential);
//                 call(false);
//             }, () => {
//                 call(true);
//             });

//         } catch (error) {
//             log.error("socket", `webauthn:makeCredential: ${error.toString()}`);
//             call(true);
//         }

//     })

// }