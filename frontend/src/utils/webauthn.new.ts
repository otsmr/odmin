export default null;
// export function detectWebAuthnSupport() {

//     if (
//         window.PublicKeyCredential === undefined ||
//         typeof window.PublicKeyCredential !== "function"
//     ) return false;

//     return true;

// }

// function string2buffer (str: string) {
//     return (new Uint8Array(str.length)).map(function (x, i) {
//         return str.charCodeAt(i)
//     });
// }

// // Encode an ArrayBuffer into a base64 string.
// function bufferEncode(value: any) {
//     return base64js.fromByteArray(value)
//         .replace(/\+/g, "-")
//         .replace(/\//g, "_")
//         .replace(/=/g, "");
// }

// // Don't drop any blanks
// // decode
// function bufferDecode(value: string) {
//     return Uint8Array.from(atob(value), c => c.charCodeAt(0));
// }

// function buffer2string(buf: any) {
//     let str = "";
//     if (!(buf.constructor === Uint8Array)) {
//         buf = new Uint8Array(buf);
//     }
//     buf.map(function (x: any) {
//         return str += String.fromCharCode(x)
//     });
//     return str;
// }

// var state = {
//     createResponse: null,
//     publicKeyCredential: null,
//     credential: null,
//     user: {
//         name: "testuser@example.com",
//         displayName: "testuser",
//     },
// }

// function makeCredential(username: string) {
//     console.log("Fetching options for new credential");
    
//     var credential = null;

//     var attestation_type = $('#select-attestation').find(':selected').val();
//     var authenticator_attachment = $('#select-authenticator').find(':selected').val();
    
//     var user_verification = $('#select-verification').find(':selected').val();
//     var resident_key_requirement = $('#select-residency').find(':selected').val();
//     var txAuthSimple_extension = $('#extension-input').val();

//     $.get('/makeCredential/' + username, {
//             attType: attestation_type,
//             authType: authenticator_attachment,
//             userVerification: user_verification,
//             residentKeyRequirement: resident_key_requirement,
//             txAuthExtension: txAuthSimple_extension,
//         }, null, 'json')
//         .done(function (makeCredentialOptions: any) {            
//             makeCredentialOptions.publicKey.challenge = bufferDecode(makeCredentialOptions.publicKey.challenge);
//             makeCredentialOptions.publicKey.user.id = bufferDecode(makeCredentialOptions.publicKey.user.id);
//             if (makeCredentialOptions.publicKey.excludeCredentials) {
//                 for (var i = 0; i < makeCredentialOptions.publicKey.excludeCredentials.length; i++) {
//                     makeCredentialOptions.publicKey.excludeCredentials[i].id = bufferDecode(makeCredentialOptions.publicKey.excludeCredentials[i].id);
//                 }
//             }
//             console.log("Credential Creation Options");
//             console.log(makeCredentialOptions);
//             navigator.credentials.create({
//                 publicKey: makeCredentialOptions.publicKey
//             }).then(function (newCredential) {
//                 console.log("PublicKeyCredential Created");
//                 console.log(newCredential);
//                 state.createResponse = newCredential;
//                 registerNewCredential(newCredential);
//             }).catch(function (err) {
//                 console.info(err);
//             });
//         });
// }

// function getAssertion() {
//     hideErrorAlert();
//     if ($("#input-email").val() === "") {
//         showErrorAlert("Please enter a username");
//         return;
//     }
//     setUser();
//     $.get('/user/' + state.user.name + '/exists', {}, null, 'json').done(function (response) {
//             console.log(response);
//         }).then(function () {
            
//             var user_verification = $('#select-verification').find(':selected').val();            
//             var txAuthSimple_extension = $('#extension-input').val();

//             $.get('/assertion/' + state.user.name, {
//                 userVer: user_verification,
//                 txAuthExtension: txAuthSimple_extension
//             }, null, 'json')
//                 .done(function (makeAssertionOptions) {
//                     console.log("Assertion Options:");
//                     console.log(makeAssertionOptions);
//                     makeAssertionOptions.publicKey.challenge = bufferDecode(makeAssertionOptions.publicKey.challenge);
//                     makeAssertionOptions.publicKey.allowCredentials.forEach(function (listItem) {
//                         listItem.id = bufferDecode(listItem.id)
//                     });
//                     console.log(makeAssertionOptions);
//                     navigator.credentials.get({
//                             publicKey: makeAssertionOptions.publicKey
//                         })
//                         .then(function (credential) {
//                             console.log(credential);
//                             verifyAssertion(credential);
//                         }).catch(function (err) {
//                             console.log(err.name);
//                             showErrorAlert(err.message);
//                         });
//                 });
//         })
//         .catch(function (error) {
//             if (!error.exists) {
//                 showErrorAlert("User not found, try registering one first!");
//             }
//             return;
//         });
// }

// function verifyAssertion(assertedCredential) {
//     // Move data into Arrays incase it is super long
//     console.log('calling verify')
//     let authData = new Uint8Array(assertedCredential.response.authenticatorData);
//     let clientDataJSON = new Uint8Array(assertedCredential.response.clientDataJSON);
//     let rawId = new Uint8Array(assertedCredential.rawId);
//     let sig = new Uint8Array(assertedCredential.response.signature);
//     let userHandle = new Uint8Array(assertedCredential.response.userHandle);
//     $.ajax({
//         url: '/assertion',
//         type: 'POST',
//         data: JSON.stringify({
//             id: assertedCredential.id,
//             rawId: bufferEncode(rawId),
//             type: assertedCredential.type,
//             response: {
//                 authenticatorData: bufferEncode(authData),
//                 clientDataJSON: bufferEncode(clientDataJSON),
//                 signature: bufferEncode(sig),
//                 userHandle: bufferEncode(userHandle),
//             },
//         }),
//         contentType: "application/json; charset=utf-8",
//         dataType: "json",
//         success: function (response) {
//             window.location = "/dashboard"
//             console.log(response)
//         }
//     });
// }