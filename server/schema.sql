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
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  stall_id      INT UNSIGNED NOT NULL,
  category_id   INT UNSIGNED NOT NULL,
  product_name  VARCHAR(150) NOT NULL,
  brand         VARCHAR(100) NULL,
  package_size  DECIMAL(10,2) NOT NULL,
  unit          VARCHAR(30) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  is_available  BOOLEAN NOT NULL DEFAULT TRUE,
  approval_status      ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending', -- new products wait for the admin.
  reviewed_by_admin_id INT UNSIGNED NULL, -- which admin decided, NULL until then.
  reviewed_at          TIMESTAMP NULL DEFAULT NULL, -- when they decided.
  last_updated  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_product_stall FOREIGN KEY (stall_id) REFERENCES stall(id),
  CONSTRAINT fk_product_category FOREIGN KEY (category_id) REFERENCES product_category(id),
  CONSTRAINT fk_product_reviewer FOREIGN KEY (reviewed_by_admin_id) REFERENCES admin(id) ON DELETE SET NULL
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

CREATE TABLE IF NOT EXISTS product_update (
  id                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, -- id of the price submission. counts up by itself.
  product_id             INT UNSIGNED NOT NULL, -- which product the new price is for. UNSIGNED so it matches product.id exactly.
  submitted_by_vendor_id INT UNSIGNED NOT NULL, -- the vendor who proposed the price. we set it from the login token, never from the request body.
  reviewed_by_admin_id   INT UNSIGNED NULL, -- the admin who decided. NULL means nobody reviewed it yet.
  proposed_price         DECIMAL(10,2) NOT NULL, -- the new price the vendor wants. I used a real number column instead of the ERD's proposed_values text so the approve step can copy it straight into product.current_price.
  status                 ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending', -- ENUM only allows those 3 values. new submissions start as pending, which is the "Pending Review" badge on your page.
  submitted_at           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, -- auto-filled when the vendor submits.
  reviewed_at            TIMESTAMP NULL DEFAULT NULL, -- filled when the admin decides. the NULL DEFAULT NULL is there because MySQL timestamps otherwise auto-fill themselves.
  CONSTRAINT fk_pupdate_product FOREIGN KEY (product_id) REFERENCES product(id), -- RESTRICT by default, so a product with submissions can't be deleted by accident.
  CONSTRAINT fk_pupdate_vendor FOREIGN KEY (submitted_by_vendor_id) REFERENCES vendor(id), -- same, keeps the history.
  CONSTRAINT fk_pupdate_admin FOREIGN KEY (reviewed_by_admin_id) REFERENCES admin(id) ON DELETE SET NULL -- if an admin account is deleted the submission stays and this becomes NULL.
) ENGINE=InnoDB; -- InnoDB is needed for foreign keys and for the transaction we use when approving.