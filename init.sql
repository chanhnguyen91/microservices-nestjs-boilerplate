CREATE DATABASE IF NOT EXISTS product_db;

-- Cấp quyền cho user trên auth_db và product_db cho host '%'
GRANT ALL PRIVILEGES ON auth_db.* TO 'user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON product_db.* TO 'user'@'%' IDENTIFIED BY 'password';

-- Cấp quyền cho user trên auth_db và product_db cho host 'localhost'
GRANT ALL PRIVILEGES ON auth_db.* TO 'user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON product_db.* TO 'user'@'localhost' IDENTIFIED BY 'password';

-- Cấp quyền tạo cơ sở dữ liệu cho shadow database
GRANT CREATE ON *.* TO 'user'@'%';
GRANT CREATE ON *.* TO 'user'@'localhost';

-- Tạo shadow database thủ công (đề phòng Prisma gặp lỗi)
CREATE DATABASE IF NOT EXISTS prisma_shadow_db;
GRANT ALL PRIVILEGES ON prisma_shadow_db.* TO 'user'@'%' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON prisma_shadow_db.* TO 'user'@'localhost' IDENTIFIED BY 'password';

FLUSH PRIVILEGES;