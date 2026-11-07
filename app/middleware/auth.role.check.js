const jwt = require("jsonwebtoken");
const rolesConfig = require("../utils/roles.json");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"] || req.cookie['accessToken'];
    const token = authHeader && authHeader.split(" ")[1]; // 'Bearer TOKEN_STRING' se token nikalne ke liye

    if (!token)
        return res.status(401).json({ message: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if (req.user.isBlocked) {
            return res.status(403).json({ message: 'Your account has been blocked. Contact support.' });
        }
        next();
    } catch (err) {
        res.status(401).json({ message: "Invalid token" });
    }
}

function authorizePermission(requiredPermission) {
    return (req, res, next) => {
        const userRole = req.user.role;
        const permissions = rolesConfig[userRole] || [];

        if (!permissions.includes(requiredPermission)) {
            return res.status(403).json({ message: "Access denied" });
        }

        next();
    };
}

module.exports = { authenticateToken, authorizePermission };