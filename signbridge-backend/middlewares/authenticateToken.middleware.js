const { admin } = require("../config/firebaseAdmin.config");
const UserService = require("../services/UserService");

const extractBearerToken = (req) => {
    const authHeader = req.headers.authorization;
    return authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
};

const sendUnauthorized = (res, message = "Unauthorized") => res.status(401).json({ message });

const verifyToken = async (token) => {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken; // Return the decoded token for further use
    }
    catch (error) {
        console.error("Token verification failed:", error);
        throw new Error("Unauthorized");
    }
}

async function verifyRequest(req, res, callback) {
    const token = extractBearerToken(req);
    // Handle token presented as a Bearer token in the Authorization header
    if (!token) { sendUnauthorized(res, "No Bearer Token Provided") };
    try {
        const decodedToken = await verifyToken(token);
        if (decodedToken)
            callback(req, res, decodedToken);
    }
    catch (error) {
        sendUnauthorized(res);
    };
}

async function adminVerifyRequest(req, res, callback) {
    const token = extractBearerToken(req);
    // Handle token presented as a Bearer token in the Authorization header
    if (!token) { return sendUnauthorized(res, "No Bearer Token Provided") };
    try {
        const decodedToken = await verifyToken(token);
        const user = await UserService.GetUserByEmail(decodedToken.email);
        if (!user || user.role_access !== "admin") return sendUnauthorized(res, "You are not an Admin");
        if (decodedToken)
            callback(req, res);
    }
    catch (error) {
        sendUnauthorized(res);
    };
}

async function signExpertVerifyRequest(req, res, callback) {
    const token = extractBearerToken(req);
    // Handle token presented as a Bearer token in the Authorization header
    if (!token) { return sendUnauthorized(res, "No Bearer Token Provided") };

    try {
        const decodedToken = await verifyToken(token);
        const user = await UserService.GetUserByEmail(decodedToken.email);
        if (!user || user.role_access !== "signexpert") return sendUnauthorized(res, "You are not a Sign Expert");
        if (decodedToken)
            callback(req, res);
    }
    catch (error) {
        sendUnauthorized(res);
    };
}

async function signExpertOrAdminVerifyRequest(req, res, callback) {
    const token = extractBearerToken(req);
    // Handle token presented as a Bearer token in the Authorization header
    if (!token) { return sendUnauthorized(res, "No Bearer Token Provided") };

    try {
        const decodedToken = await verifyToken(token);
        const user = await UserService.GetUserByEmail(decodedToken.email);
        if (!user || !["admin", "signexpert"].includes(user.role_access)) return sendUnauthorized(res, "You are not an Admin or Sign Expert");
        if (decodedToken)
            callback(req, res);
    }
    catch (error) {
        sendUnauthorized(res);
    };
}

async function publicOrSignExpertVerifyRequest(req, res, callback) {
    const token = extractBearerToken(req);
    // Handle token presented as a Bearer token in the Authorization header
    if (!token) { return sendUnauthorized(res, "No Bearer Token Provided") };

    try {
        const decodedToken = await verifyToken(token);
        const user = await UserService.GetUserByEmail(decodedToken.email);
        if (!user || !["public", "signexpert"].includes(user.role_access)) return sendUnauthorized(res, "You are not an Admin or Sign Expert");
        if (decodedToken)
            callback(req, res);
    }
    catch (error) {
        sendUnauthorized(res);
    };
}


module.exports = { verifyRequest, adminVerifyRequest, signExpertVerifyRequest, signExpertOrAdminVerifyRequest, publicOrSignExpertVerifyRequest };