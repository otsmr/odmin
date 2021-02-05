const router = require('express').Router();

import { getServiceByName } from "../database/services/service"
import { destroySessionByToken } from "../database/services/session"
// import { checkIsLogged } from "../database/services/user"

router.use("/?:type/?:value", async (req: any, res: any, next: any) => {

    const type = req.params.type.toLowerCase();
    const token = req.cookies.token || null;
    
    res.setHeader('Content-Type', 'application/json');

    // switch (type) {

    //     case "istokenvalid":

    //         const isValid = await checkIsLogged(req.params.value);
    //         if (isValid) {
    //             return res.send(JSON.stringify({
    //                 valid: true,
    //                 user: {
    //                     id: isValid.id,
    //                     name: isValid.name,
    //                     role: isValid.role
    //                 }
    //             }));
    //         }
    //         return res.send(JSON.stringify({
    //             valid: false
    //         }))
            
    //     case "logout":

    //         let return_to = "/";
            
    //         const userLogout = await checkIsLogged(token);
    //         const serviceName = req.query.service || "odmin";
    
    //         if (userLogout) await destroySessionByToken(userLogout.isTokenValid);
            
    //         if (serviceName !== "odmin") {
    //             const service = await getServiceByName(serviceName);
    //             const returnto = decodeURIComponent(req.query.return_to || "/");
    //             if (service && service.return_to) {
    //                 return_to = service.return_to + `?logout=true&return_to=${returnto}`;
    //             }
    //         }
    
    //         return res.redirect(return_to);

    // }

    return res.send(JSON.stringify({
        error: "403 Forbidden"
    }))

})

export default router;