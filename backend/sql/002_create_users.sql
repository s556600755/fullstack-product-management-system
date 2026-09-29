-- Run after 001_create_products.sql creates the product_management database.
-- Requires MySQL 8.0.16 or later for enforced CHECK constraints.
-- An existing users table is preserved, not altered or reset.
USE product_management;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    -- Store only application-generated password hashes, never plaintext passwords.
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT chk_users_name
        CHECK (REGEXP_LIKE(name, '[^[:space:]]')),
    CONSTRAINT chk_users_role
        CHECK (role IN ('user', 'admin'))
) ENGINE = InnoDB
  DEFAULT CHARACTER SET utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;
