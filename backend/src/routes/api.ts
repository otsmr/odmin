const router = require('express').Router();

import { IAPI_EROR_MESSAGE } from "../interfaces/api-response"

router.use("/?:type/?:value", async (req: any, res: any, next: any) => {

    res.setHeader('Content-Type', 'application/json');


    


    res.status(403);

    const response: IAPI_EROR_MESSAGE = {
        error: true,
        message: "403 Forbidden"
    }

    return res.send(JSON.stringify(response))

})

export default router;