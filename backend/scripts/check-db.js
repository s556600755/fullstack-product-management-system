const path = require("node:path");
require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
    quiet: true
});

const pool = require("../config/db");

async function checkDatabase() {
    try {
        await pool.query("SELECT 1");
        console.log("資料庫連線成功：SELECT 1 執行成功。");
    } catch (error) {
        console.error("資料庫連線失敗，錯誤代碼：", error.code || "UNKNOWN_ERROR");
        console.error("請檢查 backend/.env 的連線設定與 MySQL 服務狀態。");
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

checkDatabase().catch((error) => {
    console.error("資料庫檢查未能正常結束，錯誤代碼：", error.code || "UNKNOWN_ERROR");
    process.exitCode = 1;
});
