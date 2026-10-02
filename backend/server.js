const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("node:path");
require("dotenv").config({
    path: path.resolve(__dirname, ".env"),
    quiet: true
});
const { getAllProducts, createProduct, updateProduct, deleteProduct } = require("./repositories/products.repository");
const { findUserByEmail, createUser } = require("./repositories/users.repository");
const { authenticateToken } = require("./middleware/auth.middleware");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/auth/register", async function (req, res) {
    const { name, email, password } = req.body ?? {};

    if (typeof name !== "string" || name.trim() === "" || [...name.trim()].length > 100) {
        return res.status(400).json({ message: "名稱必須是非空白字串，且最多 100 個字元" });
    }
    if (typeof email !== "string") {
        return res.status(400).json({ message: "Email 必須是字串" });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if ([...normalizedEmail].length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({ message: "請提供有效的 Email，且最多 255 個字元" });
    }
    if (typeof password !== "string" || [...password].length < 8) {
        return res.status(400).json({ message: "密碼必須是字串，且至少 8 個字元" });
    }
    // bcrypt only processes the first 72 bytes; reject longer input instead of truncating it.
    if (Buffer.byteLength(password, "utf8") > 72) {
        return res.status(400).json({ message: "密碼的 UTF-8 長度不可超過 72 bytes" });
    }

    try {
        const existingUser = await findUserByEmail(normalizedEmail);
        if (existingUser) {
            return res.status(409).json({ message: "此 Email 已被註冊" });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const user = await createUser({
            name: normalizedName,
            email: normalizedEmail,
            passwordHash,
            role: "user"
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "此 Email 已被註冊" });
        }
        res.status(500).json({ message: "無法註冊，請稍後再試" });
    }
});

app.post("/auth/login", async function (req, res) {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string") {
        return res.status(400).json({ message: "Email 必須是字串" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if ([...normalizedEmail].length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({ message: "請提供有效的 Email，且最多 255 個字元" });
    }
    if (typeof password !== "string" || [...password].length < 8) {
        return res.status(400).json({ message: "密碼必須是字串，且至少 8 個字元" });
    }
    if (Buffer.byteLength(password, "utf8") > 72) {
        return res.status(400).json({ message: "密碼的 UTF-8 長度不可超過 72 bytes" });
    }

    try {
        const user = await findUserByEmail(normalizedEmail);
        if (!user) {
            return res.status(401).json({ message: "Email 或密碼錯誤" });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            return res.status(401).json({ message: "Email 或密碼錯誤" });
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret || jwtSecret.trim() === "" || jwtSecret === "replace_with_a_secure_secret") {
            return res.status(500).json({ message: "無法登入，請稍後再試" });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            jwtSecret,
            { algorithm: "HS256", expiresIn: "1h" }
        );

        res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch {
        res.status(500).json({ message: "無法登入，請稍後再試" });
    }
});

function validateProductInput(name, price, stock) {
    if (typeof name !== "string" || name.trim() === "") {
        return "商品名稱必須是非空白字串";
    }
    if ([...name].length > 255) {
        return "商品名稱不可超過 255 個字元";
    }
    if (typeof price !== "number" || !Number.isFinite(price)) {
        return "價格必須是有效的有限數字";
    }
    if (price < 0 || price > 99999999.99) {
        return "價格必須介於 0 與 99999999.99 之間";
    }
    // Check the decimal representation without rounding or multiplying by 100.
    if (!/^\d+(\.\d{1,2})?$/.test(String(price))) {
        return "價格最多只能有 2 位小數";
    }
    if (typeof stock !== "number" || !Number.isInteger(stock)) {
        return "庫存必須是整數數字";
    }
    if (stock < 0 || stock > 4294967295) {
        return "庫存必須介於 0 與 4294967295 之間";
    }
    return null;
}

app.post("/products", authenticateToken, async function (req, res) {
    const { name, price, stock } = req.body ?? {};

    const validationError = validateProductInput(name, price, stock);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const newProduct = await createProduct({ name, price, stock });
        res.status(201).json(newProduct);
    } catch {
        res.status(500).json({ message: "無法新增商品，請稍後再試" });
    }
});

app.delete("/products/:id", authenticateToken, async function (req, res) {
    const id = Number(req.params.id);

    if (!/^\d+$/.test(req.params.id) || !Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: "商品 ID 必須是有效正整數" });
    }

    try {
        const product = await deleteProduct(id);
        if (!product) {
            return res.status(404).json({ message: "找不到商品" });
        }
        res.json(product);
    } catch {
        res.status(500).json({ message: "無法刪除商品，請稍後再試" });
    }
});

app.put("/products/:id", authenticateToken, async function (req, res) {
    const id = Number(req.params.id);
    const { name, price, stock } = req.body ?? {};

    if (!/^\d+$/.test(req.params.id) || !Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({ message: "商品 ID 必須是有效正整數" });
    }

    const validationError = validateProductInput(name, price, stock);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const product = await updateProduct({ id, name, price, stock });
        if (!product) {
            return res.status(404).json({ message: "找不到商品" });
        }
        res.json(product);
    } catch {
        res.status(500).json({ message: "無法更新商品，請稍後再試" });
    }
});

app.get("/products", authenticateToken, async function (req, res) {
    try {
        const products = await getAllProducts();
        res.json(products);
    } catch {
        res.status(500).json({ message: "無法取得商品，請稍後再試" });
    }
});

app.listen(3000, function () {
    console.log("後端伺服器啟動：http://localhost:3000");
});
