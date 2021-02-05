// import * as Speakeasy from "speakeasy";
// import sendMail from "../mail/sendMail";
// import Notify from "../mail/notify";

// import { editORupdateService, deleteService } from "./services/service";
// import { createNewToken, removeToken } from "./services/token";
// import { removePublicKey } from "./services/webauthn";
// import { updateNotifications } from "./services/notifications";
// import { 
//     getUserByUsername,
//     changeTwoFA,
//     changeUsersPassword,
//     updateUserAccount
// } from "./services/user";

// // import { prompt, alert, confirm, checkPassword } from "../utils/dialog";
// import { validateEmail } from "../utils/utils";

// import config from "../utils/config";

// const forms = {};

// forms["admin:removeInvitetoken"] = (data, next) => {

//     removeToken("invitetoken", data.token, () => {
//         next(true);
//         data.socket.emit("reload");
//     });

// };
// forms["admin:addinvitetoken"] = async (data, next) => {

//     await createNewToken("invitetoken", data.token);
//     next(true);
//     data.socket.emit("reload");

// };


// forms["admin:addeditservice"] = editORupdateService;
// forms["admin:deleteservice"] = (data, next) => {
//     confirm(data.socket, {
//         title: `Service "${data.name}" löschen?`,
//         body: `Service wird unwiederruflich gelöschen!`,
//         success: (v, diaNext) => {
//             diaNext(true);
//             deleteService(data, next);
//         },
//         cancel: next
//     });   
// };


// forms["settings:removePublicKey"] = removePublicKey;
// forms["settings:twofa"] = (data, next) => {
    

//     if (data.disable)
//         return checkPassword(data.socket, "Zwei-Faktor-Authentifizierung deaktivieren", () => {
//             changeTwoFA(null, data.socket.user.id, next);
//             const notify = new Notify(data.socket.user.id);
//             notify.send("2fa-disabled");
//         }, next);


//     const verified = Speakeasy.totp.verify({ 
//         secret: data.socket.twoauthsecret.base32,
//         encoding: 'base32',
//         token: data.verifizierungscode
//     });

//     if (!verified) return next(false, { message: ["verifizierungscode"] });
        
//     checkPassword(data.socket, "Zwei-Faktor-Authentifizierung aktivieren", () => {
//         changeTwoFA(data.socket.twoauthsecret.base32, data.socket.user.id, next);
//         const notify = new Notify(data.socket.user.id);
//         notify.send("2fa-enabled");
//     }, next);

// }

// forms["settings:account"] = async (data, next) => {

//     if (data.password) {

//         try {

//             if (data.password !== data.passwordwdh) throw ["passwordwdh"];
//             if (data.password.length < 8) throw ["password"];

//             checkPassword(data.socket, "Passwort ändern", () => {
        
//                 changeUsersPassword(data.socket.user.id, data.password, (err, msg) => {
//                     if (err) return console.log(msg);
//                     next(true);
//                     const notify = new Notify(data.socket.user.id);
//                     notify.send("changePassword");
//                 });
        
//             }, next);
            
//         } catch (e) {
//             next(false, { message: e });
//         }

//         return;
//     }

//     if (data.name !== data.socket.user.name) {
//         const isUserName = await getUserByUsername(data.name);
//         if (isUserName) return next(false, {
//             message: "nameAlredyUsed"
//         })
//     } else delete data.name;


//     checkPassword(data.socket, "Kontoeinstellungen ändern", () => {

//         // updateUserAccount(data, (err, msg) => {
//         //     if (err) return next();
//         //     next(true);
//         //     new Notify(data.socket.user.id).send("updateAccount");
//         //     if (data.name && data.name !== data.socket.user.name) {
//         //         return data.socket.emit("logout");
//         //     }
//         // });

//     }, next);
   
// }

// forms["settings:notifications"] = async (data, next) => {

//     if (!data.email) 
//         return checkPassword(data.socket, "Benachrichtigungen ändern", () => {
//             updateNotifications(data, next);
//         }, next);


//     if (!validateEmail(data.email))
//         return next(false, {message: ["email"]});


    // checkPassword(data.socket, "E-Mail-Adresse ändern", () => {
    
    //     const code = Math.floor(Math.random()*(999999 - 100000 + 1) + 100000);

    //     sendMail({
    //         type: "newEmailAddress",
    //         subject: "E-Mail-Adresse bestätigen",
    //         to: data.email,
    //         from: config.get("email:account"),
    //         replace: {
    //             newMail: data.email,
    //             code
    //         },
    //         success: (err) => {
                
    //             if (err) {
    //                 alert(data.socket, {
    //                     title: "Unbekannter Fehler",
    //                     body: "Die E-Mail konnte nicht gesendet werden."
    //                 });
    //                 return next();
    //             }

    //             prompt(data.socket, {
    //                 title: "E-Mail bestätigen",
    //                 placeholder: "Bestätigungscode",
    //                 cancel: next,
    //                 success: (insertCode, nextDialog) => {
    //                     if (code == insertCode) {
    //                         updateNotifications(data, (status) => {
    //                             next(status);
    //                             nextDialog(status);
    //                         });
    //                     } else nextDialog(false);
    //                 }
    //             })

    //         }
    //     })

    // })
   
// }