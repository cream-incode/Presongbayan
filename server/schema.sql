CREATE DATABASE IF NOT EXISTS presyongbayan;
USE presyongbayan;

CREATE TABLE IF NOT EXISTS admin (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
 
CREATE TABLE IF NOT EXISTS vendor (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(120) NOT NULL,
  email           VARCHAR(190) NOT NULL UNIQUE,
  password_hash   VARCHAR(255) NOT NULL,
  approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
 
CREATE TABLE IF NOT EXISTS customer (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS market (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
  market_name VARCHAR(150) NOT NULL,
  location    VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_category (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
  category_name VARCHAR(100) NOT NULL UNIQUE,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP 
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS stall (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- stall id. the stall repository reads this as id.
  market_id  INT UNSIGNED NOT NULL, -- which market the stall is in.
  vendor_id  INT UNSIGNED NOT NULL, -- who owns it. every ownership check in the code uses this column.
  stall_name VARCHAR(100) NOT NULL, -- the label like "Stall 12".
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- auto-filled creation time.
  CONSTRAINT fk_stall_market FOREIGN KEY (market_id) REFERENCES market(id), -- no ON DELETE option means RESTRICT, so a market that still has stalls can't be deleted by accident.
  CONSTRAINT fk_stall_vendor FOREIGN KEY (vendor_id) REFERENCES vendor(id) -- same for vendors. this is also what triggers the 409 message in the controller.
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- product id.
  stall_id      INT UNSIGNED NOT NULL, -- the stall that sells it. the owner is found through this since product has no vendor_id.
  category_id   INT UNSIGNED NOT NULL, -- the category it belongs to.
  product_name  VARCHAR(150) NOT NULL, -- name like "Regular Rice".
  brand         VARCHAR(100) NULL, -- optional brand. NULL is fine here and the repository turns it into an empty string.
  package_size  DECIMAL(10,2) NOT NULL, -- size of one pack like 1.00. DECIMAL avoids the rounding problems floats have.
  unit          VARCHAR(30) NOT NULL, -- unit like kg or piece.
  current_price DECIMAL(10,2) NOT NULL, -- the live price in pesos. only a reviewed price update should change it later.
  is_available  BOOLEAN NOT NULL DEFAULT TRUE, -- MySQL stores this as 1 or 0. defaults to in stock.
  last_updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- set on insert and refreshed on every update by MySQL itself.
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- when the product was first added.
  CONSTRAINT fk_product_stall FOREIGN KEY (stall_id) REFERENCES stall(id), -- RESTRICT, so a stall with products can't be removed.
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES product_category(id) -- RESTRICT, so a category that's in use can't disappear.
) ENGINE=InnoDB;

-- starter rows so a vendor has a market and categories to pick when creating stalls and products. change or delete them anytime.
INSERT INTO market (market_name, location) VALUES -- adds two sample markets.
  ('Sample Market A', 'Quezon City'), -- becomes id 1 on a fresh table.
  ('Sample Market B', 'Quezon City'); -- becomes id 2.

INSERT INTO product_category (category_name) VALUES -- adds common categories. category_name is UNIQUE so running this twice will error instead of duplicating.
  ('Rice and Grains'), -- id 1.
  ('Eggs and Dairy'), -- id 2.
  ('Vegetables'), -- id 3.
  ('Meat and Poultry'), -- id 4.
  ('Fish and Seafood'); -- id 5.