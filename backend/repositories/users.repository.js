const pool = require("../config/db");

// Authentication-only result: never return this object directly in an HTTP response.
async function findUserByEmail(email) {
    const [rows] = await pool.execute(`
        SELECT id, name, email, password_hash, role, created_at
        FROM users
        WHERE email = ?
    `, [email]);

    const user = rows[0];
    if (!user) {
        return null;
    }

    return {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        password_hash: user.password_hash,
        role: user.role,
        created_at: user.created_at
    };
}

// The caller must generate passwordHash before calling this function.
async function createUser({ name, email, passwordHash, role = "user" }) {
    const [result] = await pool.execute(`
        INSERT INTO users (name, email, password_hash, role)
        VALUES (?, ?, ?, ?)
    `, [name, email, passwordHash, role]);

    const user = await findUserById(result.insertId);
    if (!user) {
        throw new Error("Created user could not be retrieved");
    }

    return user;
}

async function findUserById(id) {
    const [rows] = await pool.execute(`
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = ?
    `, [id]);

    const user = rows[0];
    if (!user) {
        return null;
    }

    return {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
    };
}

module.exports = { findUserByEmail, createUser, findUserById };
