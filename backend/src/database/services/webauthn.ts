
import { Webauthn } from '../initdb';

export const getAllKeysByUserid =  async (user_id) => {

    return await Webauthn.findAll({
        where: {
            user_id
        }
    });

}

export const getCredentialByID =  async (credentialID) => {

    return await Webauthn.findByPk(credentialID);

}

export const removePublicKey =  async (data, next) => {

    try {
        const key = await Webauthn.findByPk(data.credentialID);
        await key.destroy();
        next(true);
    } catch (error) {
        next();
    }

}

export const addNewCredentialForUser = async (options, credential) => {

    return await Webauthn.create({
        credentialID: credential.id,
        user_id: options.userid,
        name: options.name,
        publicKeyJwk: credential.publicKeyJwk,
        signCount: credential.signCount,
    });

}

export const updateSignCountBycredentialID = async (credentialID, signCount) => {

    const key = await Webauthn.findByPk(credentialID);

    return key.update({
        signCount
    });

}