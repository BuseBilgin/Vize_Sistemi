
# 👤 Hazırlayan: Buse Gül Rana BİLGİN

# 🛂 Vize Kayıt Sistemi

Bu sistem, kullanıcıların online vize başvurusu yapmasını sağlayan, yöneticilerin başvuruları ve kullanıcıları yönetebildiği bir full-stack web uygulamasıdır.

---

## 🧱 Kullanılan Teknolojiler

| Katman     | Teknoloji                         |
|------------|----------------------------------|
| Backend    | Go (Golang), Gorilla Mux         |
| Frontend   | HTML, CSS, JavaScript (Vanilla)  |
| Veritabanı | MySQL                            |
| Kimlik     | JWT ile Token Doğrulama          |
| Şifreleme  | bcrypt ile hashleme              |
| Sunucu     | serve (npm paketi)               |

---

## ⚙️ Kurulum Adımları

### ✅ 1. Veritabanı Kurulumu

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/data.sql
```
> Veritabanı adı: `vize_sistemi`
> Varsayılan kullanıcı: `admin@example.com / admin123`

---

### ✅ 2. Backend (Go)

Terminalde şu komutu çalıştırarak backend'i başlatabilirsiniz:

```bash
cd backend
go mod tidy        # İlk kez çalıştırıyorsanız
go run .
```

> Sunucu `http://localhost:8080` adresinde çalışır.
> Dosyalar `uploads/` klasörüne kaydedilir.

---

### ✅ 3. Frontend (serve ile)

**Serve** modülünü global kurun (bir kereye mahsus):

```bash
npm install -g serve
```

Ardından frontend klasöründe:

```bash
cd frontend
serve .
```

> Tarayıcıdan `http://localhost:3000` adresiyle uygulamayı başlatabilirsiniz.  
> (serve bazen farklı bir port da seçebilir, terminalde yazar.)

---

## 🧩 Özellikler

- 👤 Kullanıcı kayıt ve giriş (JWT + bcrypt hashli şifre)
- 📝 Başvuru formu (dosya yüklemeli)
- 📂 Belgeler: pasaport, fotoğraf, otel rezervasyonu, uçak bileti
- 🔄 Başvuru güncelleme/silme
- 🔐 Admin panel: kullanıcı ekleme, silme, rol değiştirme
- 📑 Giriş loglarının görüntülenmesi
- 🖼️ Belge önizleme (modal popup)

---

## 🔐 Güvenlik: Şifre Hashleme

- Kullanıcı şifreleri asla düz metin olarak saklanmaz.  
- **bcrypt** ile hashlenip MySQL'e öyle yazılır.
- Girişte gelen şifre bcrypt ile kıyaslanır.

**Örnek:**  
```go
hashed, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
DB.Exec("INSERT INTO users (...) VALUES (..., ?, ...)", string(hashed))
```

---

## 🔗 API Uç Noktaları (Örnekler)

```http
POST   /register              → Yeni kullanıcı kaydı (staff)
POST   /login                 → Giriş (JWT döner)
GET    /me                   → Giriş yapanın rolü/id bilgisi
GET    /applications         → Başvuru listesi
POST   /applications         → Başvuru oluştur
PUT    /applications/:id     → Başvuru güncelle
DELETE /applications/:id     → Başvuru sil
GET    /logs                 → Giriş logları (admin)
GET/POST/PUT/DELETE /users   → Admin kullanıcı yönetimi
```

> Tüm isteklerde `Authorization: Bearer <token>` header'ı zorunludur.

---

## 🧪 Test İçin Hazır Kullanıcılar

```text
Admin Kullanıcı:
E-posta: admin@example.com
Şifre:   admin123

Personel:
E-posta: buse@example.com
Şifre:   (hashli – login test verisi ile gösterilir)
```

---

## 📁 Proje Yapısı

```
.
├── backend/
│   ├── main.go, login.go, register.go, ...
│   ├── go.mod, go.sum
│   └── uploads/
├── frontend/
│   ├── index.html, application.html, dashboard.html
│   ├── scripts.js, dashboard.js, ...
│   └── style.css, dubai.jpg
├── database/
│   ├── schema.sql
│   └── data.sql
```

