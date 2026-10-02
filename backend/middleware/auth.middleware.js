const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authorization = req.headers.authorization;
    const match = typeof authorization === "string"
        ? /^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/.exec(authorization)
        : null;

    if (!match) {
        return res.status(401).json({ message: "未授權，請重新登入" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret.trim() === "" || jwtSecret === "replace_with_a_secure_secret") {
        return res.status(500).json({ message: "身分驗證服務暫時無法使用，請稍後再試" });
    }

    let decoded;
    try {
        decoded = jwt.verify(match[1], jwtSecret, { algorithms: ["HS256"] });
    } catch {
        return res.status(401).json({ message: "未授權，請重新登入" });
    }

    if (
        !decoded || typeof decoded !== "object" ||
        !Number.isSafeInteger(decoded.userId) ||
        decoded.userId <= 0 || decoded.userId > 4294967295 ||
        !["user", "admin"].includes(decoded.role)
    ) {
        return res.status(401).json({ message: "未授權，請重新登入" });
    }

    req.user = {
        id: decoded.userId,
        role: decoded.role
    };
    next();
}

module.exports = { authenticateToken };
