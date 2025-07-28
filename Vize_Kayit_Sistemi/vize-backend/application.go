package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
)

type Application struct {
	ID               int    `json:"id"`
	UserID           int    `json:"user_id"`
	Ad               string `json:"ad"`
	Soyad            string `json:"soyad"`
	Email            string `json:"email"`
	Telefon          string `json:"telefon"`
	VizeTipi         string `json:"vize_tipi"`
	VizeGiris        string `json:"vize_giris"`
	Express          string `json:"express"`
	Sigorta          string `json:"sigorta"`
	Passport         string `json:"passport"`
	BiometricPhoto   string `json:"biometric_photo"`
	HotelReservation string `json:"hotel_reservation"`
	FlightTicket     string `json:"flight_ticket"`
}

func saveUploadedFile(r *http.Request, fieldName string) (string, error) {
	file, header, err := r.FormFile(fieldName)
	if err != nil {
		if err == http.ErrMissingFile {
			fmt.Println("⚠️ Dosya alanı eksik:", fieldName)
			return "", nil
		}
		fmt.Println("❌ Dosya yükleme hatası:", err)
		return "", err
	}
	defer file.Close()

	os.MkdirAll("uploads", os.ModePerm)
	filename := fmt.Sprintf("%d_%s", getUserID(r), filepath.Base(header.Filename))
	dstPath := filepath.Join("uploads", filename)

	dst, err := os.Create(dstPath)
	if err != nil {
		fmt.Println("❌ Dosya oluşturulamadı:", err)
		return "", err
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		fmt.Println("❌ Dosya kopyalanamadı:", err)
		return "", err
	}

	fmt.Println("📂 Dosya yüklendi:", dstPath)
	return "/uploads/" + filename, nil
}

func CreateApplication(w http.ResponseWriter, r *http.Request) {
	fmt.Println("🚀 CreateApplication çağrıldı")
	if !isStaff(r) {
		http.Error(w, "Yalnızca staff başvuru yapabilir", http.StatusForbidden)
		fmt.Println("⛔ Yetkisiz kullanıcı başvuru yapmaya çalıştı!")
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Form çözümlenemedi: "+err.Error(), http.StatusBadRequest)
		fmt.Println("❌ MultipartForm hatası:", err)
		return
	}

	userID := getUserID(r)
	fmt.Println("📌 Yeni başvuru yapan userID:", userID, " Role:", getUserRole(r))

	app := Application{
		UserID:    userID,
		Ad:        r.FormValue("ad"),
		Soyad:     r.FormValue("soyad"),
		Email:     r.FormValue("email"),
		Telefon:   r.FormValue("telefon"),
		VizeTipi:  r.FormValue("vize_tipi"),
		VizeGiris: r.FormValue("vize_giris"),
		Express:   r.FormValue("express"),
		Sigorta:   r.FormValue("sigorta"),
	}

	app.Passport, _ = saveUploadedFile(r, "passport")
	app.BiometricPhoto, _ = saveUploadedFile(r, "biometric_photo")
	app.HotelReservation, _ = saveUploadedFile(r, "hotel_reservation")
	app.FlightTicket, _ = saveUploadedFile(r, "flight_ticket")

	_, err = DB.Exec(`INSERT INTO applications 
        (user_id, ad, soyad, email, telefon, vize_tipi, vize_giris, express, sigorta, passport, biometric_photo, hotel_reservation, flight_ticket) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		app.UserID, app.Ad, app.Soyad, app.Email, app.Telefon, app.VizeTipi, app.VizeGiris, app.Express, app.Sigorta,
		app.Passport, app.BiometricPhoto, app.HotelReservation, app.FlightTicket)

	if err != nil {
		http.Error(w, "Başvuru eklenemedi: "+err.Error(), http.StatusInternalServerError)
		fmt.Println("❌ DB Insert hatası:", err)
		return
	}

	fmt.Println("✅ Başvuru başarıyla eklendi:", app.Email)
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Başvuru başarıyla oluşturuldu"))
}

func GetApplications(w http.ResponseWriter, r *http.Request) {
	role := getUserRole(r)
	userID := getUserID(r)
	fmt.Println("🚀 GetApplications çağrıldı | Rol:", role, " UserID:", userID)

	if !isStaff(r) && !isAdmin(r) {
		http.Error(w, "Yetkisiz erişim", http.StatusForbidden)
		fmt.Println("⛔ Yetkisiz erişim: rol =", role)
		return
	}

	var rows *sql.Rows
	var err error

	if isAdmin(r) {
		fmt.Println("👑 Admin tüm başvuruları getiriyor")
		rows, err = DB.Query(`SELECT id,user_id,ad,soyad,email,telefon,vize_tipi,vize_giris,express,sigorta,passport,biometric_photo,hotel_reservation,flight_ticket FROM applications`)
	} else {
		fmt.Println("👤 Staff sadece kendi başvurularını getiriyor")
		rows, err = DB.Query(`SELECT id,user_id,ad,soyad,email,telefon,vize_tipi,vize_giris,express,sigorta,passport,biometric_photo,hotel_reservation,flight_ticket FROM applications WHERE user_id=?`, userID)
	}
	if err != nil {
		http.Error(w, "Veriler alınamadı: "+err.Error(), http.StatusInternalServerError)
		fmt.Println("❌ DB Query hatası:", err)
		return
	}
	defer rows.Close()

	var apps []Application
	for rows.Next() {
		var app Application
		err := rows.Scan(&app.ID, &app.UserID, &app.Ad, &app.Soyad, &app.Email, &app.Telefon,
			&app.VizeTipi, &app.VizeGiris, &app.Express, &app.Sigorta,
			&app.Passport, &app.BiometricPhoto, &app.HotelReservation, &app.FlightTicket)
		if err != nil {
			fmt.Println("❌ Row Scan hatası:", err)
		}
		apps = append(apps, app)
	}

	fmt.Println("📊 Toplam başvuru sayısı:", len(apps))
	if len(apps) == 0 {
		fmt.Println("⚠️ Hiç başvuru bulunamadı!")
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(apps)
}

func GetApplicationByID(w http.ResponseWriter, r *http.Request) {
	fmt.Println("🚀 GetApplicationByID çağrıldı")
	if !isStaff(r) && !isAdmin(r) {
		http.Error(w, "Yetkisiz erişim", http.StatusForbidden)
		fmt.Println("⛔ Yetkisiz erişim ID bazlı sorguda")
		return
	}

	id := mux.Vars(r)["id"]
	row := DB.QueryRow(`SELECT id,user_id,ad,soyad,email,telefon,vize_tipi,vize_giris,express,sigorta,passport,biometric_photo,hotel_reservation,flight_ticket FROM applications WHERE id=?`, id)

	var app Application
	err := row.Scan(&app.ID, &app.UserID, &app.Ad, &app.Soyad, &app.Email, &app.Telefon,
		&app.VizeTipi, &app.VizeGiris, &app.Express, &app.Sigorta,
		&app.Passport, &app.BiometricPhoto, &app.HotelReservation, &app.FlightTicket)
	if err != nil {
		http.Error(w, "Başvuru bulunamadı", http.StatusNotFound)
		fmt.Println("❌ Başvuru bulunamadı ID:", id, " Hata:", err)
		return
	}

	fmt.Println("✅ Başvuru bulundu ID:", id, " Kullanıcı:", app.UserID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(app)
}
