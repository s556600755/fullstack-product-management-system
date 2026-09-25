-- Requires MySQL 8.0.16 or later for enforced CHECK constraints.
-- Existing databases and tables are preserved, not altered or reset.
CREATE DATABASE IF NOT EXISTS product_management
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE product_management;

CREATE TABLE IF NOT EXISTS products (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Require at least one non-whitespace character, including for tabs/newlines.
    CONSTRAINT chk_products_name
        CHECK (REGEXP_LIKE(name, '[^[:space:]]')),
    CONSTRAINT chk_products_price
        CHECK (price >= 0)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;
