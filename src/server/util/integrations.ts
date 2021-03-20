import jwt from "jsonwebtoken";

interface IntegrationJWT {
    scopes: string[]
    name: string
    issued: number
}

export function verifyIntegrationToken(token: string, scope: string) {
    try {
        const payload = jwt.verify(token, process.env.INTEGRATION_SECRET) as IntegrationJWT,
            hasScope = payload.scopes.includes(scope);

        console.log(`Integration validation for "${scope}"`, {
            name: payload.name,
            scopes: payload.scopes,
            issued: new Date(payload.issued).toLocaleString()
        })
        console.log(`Has scope ${scope}? ${hasScope}`);
        return hasScope;
    } catch(e) {
        console.log(`Invalid JWT provided for scope "${scope}": ${token}`);
        return false;
    }
}

export function createIntegrationToken(name: string, scopes: string[]) {
    if (!name || !scopes.length) {
        return;
    }
    return jwt.sign({
        scopes, name,
        issued: Date.now()
    } as IntegrationJWT, process.env.INTEGRATION_SECRET)
}