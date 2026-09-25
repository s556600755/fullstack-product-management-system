const express = require("express");
const cors = require("cors");
const path = require("node:path");
require("dotenv").config({
    path: path.resolve(__dirname, ".env"),
    quiet: true
});
const { getAllProducts, createProduct, updateProduct, deleteProduct } = require("./repositories/products.repository");

const app = express();
app.use(cors());
app.use(express.json());

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

app.post("/products", async function (req, res) {
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

app.delete("/products/:id", async function (req, res) {
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

app.put("/products/:id", async function (req, res) {
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

app.get("/products", async function (req, res) {
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
