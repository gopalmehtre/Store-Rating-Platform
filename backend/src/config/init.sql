CREATE TYPE user_role AS ENUM ('ADMIN', 'USER', 'OWNER');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20 AND LENGTH(name) <= 60),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address VARCHAR(400) NOT NULL CHECK (LENGTH(address) <= 400),
    role user_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL CHECK (LENGTH(name) >= 20 AND LENGTH(name) <= 60),
    email VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(400) NOT NULL CHECK (LENGTH(address) <= 400),
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, store_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_store ON ratings(store_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at 
    BEFORE UPDATE ON stores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at 
    BEFORE UPDATE ON ratings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

INSERT INTO users (name, email, password, address, role) VALUES 
('System Administrator Account', 
 'admin@store.com', 
 '$2b$10$rX8qELhN5Z.mKqB3p8YvJO5JZEZq0gYxV.zxP2kN3hJQF4nxP2kN3h', 
 '123 Admin Street, City Center, State, Country - 12345', 
 'ADMIN');

INSERT INTO users (name, email, password, address, role) VALUES 
('Electronics Store Owner Account', 
 'owner@electronics.com', 
 '$2b$10$rX8qELhN5Z.mKqB3p8YvJO5JZEZq0gYxV.zxP2kN3hJQF4nxP2kN3h', 
 '456 Market Road, Downtown District, State - 67890', 
 'OWNER'),
('Grocery Store Owner Account Name', 
 'owner@grocery.com', 
 '$2b$10$rX8qELhN5Z.mKqB3p8YvJO5JZEZq0gYxV.zxP2kN3hJQF4nxP2kN3h', 
 '789 Food Street, Market Square, State - 11111', 
 'OWNER');

INSERT INTO users (name, email, password, address, role) VALUES 
('Regular Test User Account One', 
 'user@test.com', 
 '$2b$10$rX8qELhN5Z.mKqB3p8YvJO5JZEZq0gYxV.zxP2kN3hJQF4nxP2kN3h', 
 '321 User Avenue, Residential Area - 22222', 
 'USER');

INSERT INTO stores (name, email, address, owner_id) VALUES 
('Premium Electronics Emporium Store', 
 'contact@electronics.com', 
 '456 Market Road, Downtown District, State - 67890', 
 2),
('Fresh Grocery Market Place Store', 
 'info@grocery.com', 
 '789 Food Street, Market Square, State - 11111', 
 3);

INSERT INTO ratings (user_id, store_id, rating) VALUES 
(4, 1, 5),
(4, 2, 4);