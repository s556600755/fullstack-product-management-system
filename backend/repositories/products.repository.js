const pool = require("../config/db");

async function getAllProducts() {
    const [rows] = await pool.query(`
        SELECT id, name, price, stock, created_at
        FROM products
        ORDER BY id ASC
    `);

    return rows.map(function (product) {
        return {
            ...product,
            id: Number(product.id),
            price: Number(product.price),
            stock: Number(product.stock)
        };
    });
}

async function createProduct({ name, price, stock }) {
    const [result] = await pool.execute(`
        INSERT INTO products (name, price, stock)
        VALUES (?, ?, ?)
    `, [name, price, stock]);

    const [rows] = await pool.execute(`
        SELECT id, name, price, stock, created_at
        FROM products
        WHERE id = ?
    `, [result.insertId]);

    const product = rows[0];
    if (!product) {
        throw new Error("Created product could not be retrieved");
    }

    return {
        ...product,
        id: Number(product.id),
        price: Number(product.price),
        stock: Number(product.stock)
    };
}

async function updateProduct({ id, name, price, stock }) {
    await pool.execute(`
        UPDATE products
        SET name = ?, price = ?, stock = ?
        WHERE id = ?
    `, [name, price, stock, id]);

    const [rows] = await pool.execute(`
        SELECT id, name, price, stock, created_at
        FROM products
        WHERE id = ?
    `, [id]);

    const product = rows[0];
    if (!product) {
        return null;
    }

    return {
        ...product,
        id: Number(product.id),
        price: Number(product.price),
        stock: Number(product.stock)
    };
}

async function deleteProduct(id) {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const [rows] = await connection.execute(`
            SELECT id, name, price, stock, created_at
            FROM products
            WHERE id = ?
            FOR UPDATE
        `, [id]);

        const product = rows[0];
        if (!product) {
            await connection.commit();
            return null;
        }

        await connection.execute(`
            DELETE FROM products
            WHERE id = ?
        `, [id]);
        await connection.commit();

        return {
            ...product,
            id: Number(product.id),
            price: Number(product.price),
            stock: Number(product.stock)
        };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct };
