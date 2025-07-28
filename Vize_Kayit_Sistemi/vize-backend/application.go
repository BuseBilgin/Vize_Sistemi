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

// ✅ Application Modeli
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

// ✅ Yardımcı: Dosya yükleme
func saveUploadedFile(r *http.Request, fieldName string) (string, error) {
	file, header, err := r.FormFile(fieldName)
	if err != nil {
		if err == http.ErrMissingFile {
			return "", nil
		}
		return "", err
	}
	defer file.Close()

	os.MkdirAll("uploads", os.ModePerm)
	filename := fmt.Sprintf("%d_%s", getUserID(r), filepath.Base(header.Filename))
	dstPath := filepath.Join("uploads", filename)

	dst, err := os.Create(dstPath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	_, err = io.Copy(dst, file)
	if err != nil {
		return "", err
	}

	// ✅ frontend'in kolay kullanabilmesi için tam path yerine sadece relative path dönüyoruz
	return "/uploads/" + filename, nil
}

// ✅ Başvuru oluşturma
func CreateApplication(w http.ResponseWriter, r *http.Request) {
	if !isStaff(r) {
		http.Error(w, "Yalnızca staff başvuru yapabilir", http.StatusForbidden)
		return
	}

	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Form çözümlenemedi: "+err.Error(), http.StatusBadRequest)
		return
	}

	userID := getUserID(r)
	fmt.Println("📌 Yeni başvuru yapan userID:", userID)

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

	// ✅ Dosyaları kaydet
	app.Passport, _ = saveUploadedFile(r, "passport")
	app.BiometricPhoto, _ = saveUploadedFile(r, "biometric_photo")
	app.HotelReservation, _ = saveUploadedFile(r, "hotel_reservation")
	app.FlightTicket, _ = saveUploadedFile(r, "flight_ticket")

	_, err = DB.Exec(`
		INSERT INTO applications (user_id, ad, soyad, email, telefon, vize_tipi, vize_giris, express, sigorta, passport, biometric_photo, hotel_reservation, flight_ticket)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		app.UserID, app.Ad, app.Soyad, app.Email, app.Telefon, app.VizeTipi, app.VizeGiris, app.Express, app.Sigorta,
		app.Passport, app.BiometricPhoto, app.HotelReservation, app.FlightTicket)

	if err != nil {
		http.Error(w, "Başvuru eklenemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("✅ Başvuru başarıyla eklendi:", app.Email)
	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Başvuru başarıyla oluşturuldu"))
}

// ✅ Başvuruları listeleme
func GetApplications(w http.ResponseWriter, r *http.Request) {
	role := getUserRole(r)
	userID := getUserID(r)
	fmt.Println("📌 Başvuru listesi istek - Rol:", role, " UserID:", userID)

	if !isStaff(r) && !isAdmin(r) {
		http.Error(w, "Yetkisiz erişim", http.StatusForbidden)
		return
	}

	var rows *sql.Rows
	var err error

	if isAdmin(r) {
		rows, err = DB.Query(`SELECT id,user_id,ad,soyad,email,telefon,vize_tipi,vize_giris,express,sigorta,passport,biometric_photo,hotel_reservation,flight_ticket FROM applications`)
	} else {
		rows, err = DB.Query(`SELECT id,user_id,ad,soyad,email,telefon,vize_tipi,vize_giris,express,sigorta,passport,biometric_photo,hotel_reservation,flight_ticket FROM applications WHERE user_id=?`, userID)
	}
	if err != nil {
		http.Error(w, "Veriler alınamadı: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var apps []Application
	for rows.Next() {
		var app Application
		rows.Scan(&app.ID, &app.UserID, &app.Ad, &app.Soyad, &app.Email, &app.Telefon,
			&app.VizeTipi, &app.VizeGiris, &app.Express, &app.Sigorta,
			&app.Passport, &app.BiometricPhoto, &app.HotelReservation, &app.FlightTicket)
		apps = append(apps, app)
	}

	if apps == nil {
		apps = []Application{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(apps)
}

// ✅ Tek başvuru
func GetApplicationByID(w http.ResponseWriter, r *http.Request) {
	if !isStaff(r) && !isAdmin(r) {
		http.Error(w, "Yetkisiz erişim", http.StatusForbidden)
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
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(app)
}
