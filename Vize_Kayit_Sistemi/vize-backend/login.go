package main

import (
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

// LoginRequest - giriş yapan kullanıcının verileri
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginLog - log kaydı yapısı
type LoginLog struct {
	ID       int    `json:"id"`
	UserID   int    `json:"user_id"`
	Email    string `json:"email"`
	IP       string `json:"ip"`
	Status   string `json:"status"`
	UserType string `json:"user_type"`
	LogTime  string `json:"log_time"`
}

// LoginHandler - kullanıcı giriş işlemi ve JWT üretimi
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var login LoginRequest
	err := json.NewDecoder(r.Body).Decode(&login)
	if err != nil {
		http.Error(w, "Geçersiz veri", http.StatusBadRequest)
		return
	}

	var storedHash string
	var userID int
	var role string

	err = DB.QueryRow("SELECT id, password, role FROM users WHERE email = ?", login.Email).
		Scan(&userID, &storedHash, &role)
	if err != nil {
		// Kullanıcı bulunamadıysa logla
		DB.Exec(`INSERT INTO login_logs (user_id, email, ip, status, user_type)
		         VALUES (?, ?, ?, ?, ?)`,
			0, login.Email, r.RemoteAddr, "fail", "unknown")
		http.Error(w, "Kullanıcı bulunamadı", http.StatusUnauthorized)
		return
	}

	// Şifre doğrulama
	err = bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(login.Password))
	if err != nil {
		DB.Exec(`INSERT INTO login_logs (user_id, email, ip, status, user_type)
		         VALUES (?, ?, ?, ?, ?)`,
			userID, login.Email, r.RemoteAddr, "fail", role)
		http.Error(w, "Hatalı şifre", http.StatusUnauthorized)
		return
	}

	// Başarılı giriş log kaydı
	DB.Exec(`INSERT INTO login_logs (user_id, email, ip, status, user_type)
	         VALUES (?, ?, ?, ?, ?)`,
		userID, login.Email, r.RemoteAddr, "success", role)

	// JWT oluştur
	token, err := GenerateJWT(userID, role)
	if err != nil {
		http.Error(w, "Token oluşturulamadı", http.StatusInternalServerError)
		return
	}

	// Rolü de frontend'e gönder
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Giriş başarılı!",
		"token":   token,
		"role":    role,
	})
}

// GetLoginLogs - sadece admin giriş loglarını görebilir
func GetLoginLogs(w http.ResponseWriter, r *http.Request) {
	if !isAdmin(r) {
		http.Error(w, "Yetkisiz erişim", http.StatusForbidden)
		return
	}

	rows, err := DB.Query(`
		SELECT id, user_id, email, ip, status, user_type, log_time
		FROM login_logs ORDER BY log_time DESC`)
	if err != nil {
		http.Error(w, "Loglar alınamadı", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var logs []LoginLog
	for rows.Next() {
		var log LoginLog
		err := rows.Scan(&log.ID, &log.UserID, &log.Email, &log.IP, &log.Status, &log.UserType, &log.LogTime)
		if err == nil {
			logs = append(logs, log)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(logs)
}
