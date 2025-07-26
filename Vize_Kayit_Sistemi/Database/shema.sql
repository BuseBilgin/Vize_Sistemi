
create database vize_sistemi;

-- Kullanıcılar tablosu
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Başvurular tablosu
CREATE TABLE applications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ad VARCHAR(100) NOT NULL,
    soyad VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefon VARCHAR(20) NOT NULL,
    vize_tipi ENUM('30 Gün', '60 Gün') NOT NULL,
    vize_giris ENUM('Tek Giriş', 'Çoklu Giriş') NOT NULL,
    express ENUM('Evet', 'Hayır') NOT NULL,
    sigorta ENUM('Var', 'Yok') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Belgeler tablosu (dosya yüklemeleri)
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    belge_tipi VARCHAR(50) NOT NULL, -- örnek: Pasaport, Uçak Bileti
    dosya_yolu VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES applications(id)
);

-- Giriş logları
CREATE TABLE login_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ip VARCHAR(45) NOT NULL,
    status ENUM('success', 'fail') NOT NULL,
    user_type ENUM('admin', 'staff') NOT NULL,
    log_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


ALTER TABLE applications
ADD passport VARCHAR(255),
ADD biometric_photo VARCHAR(255),
ADD hotel_reservation VARCHAR(255),
ADD flight_ticket VARCHAR(255);



-- Admin Şifre: admin123
INSERT INTO users (name, email, password, role) VALUES
('Admin Kullanıcı', 'admin@example.com', '$2a$10$9lpqETXHqgKQqaZVLkX0..d6u382Fvv4TMSAs.enjK964hxxlHRtK', 'admin');


-- Kullanıcı silinince başvuruları da otomatik silinir.
ALTER TABLE applications DROP FOREIGN KEY applications_ibfk_1;
ALTER TABLE applications ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;


