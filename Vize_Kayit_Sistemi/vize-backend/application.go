package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"database/sql"

	"github.com/gorilla/mux"
)

// Application - başvuru veri yapısı
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

// Yardımcı fonksiyon: dosyayı kaydeder ve adını döner
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

	return filename, nil
}

// CreateApplication - yeni başvuru oluşturur
func CreateApplication(w http.ResponseWriter, r *http.Request) {
	if !isStaff(r) {
		http.Error(w, "Yetkisiz erişim", http.StatusForbidden)
		return
	}

	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		http.Error(w, "Form verisi çözümlenemedi", http.StatusBadRequest)
		return
	}

	app := Application{
		UserID:    getUserID(r),
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
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Başvuru başarıyla oluşturuldu"))
}

func GetApplications(w http.ResponseWriter, r *http.Request) {
	if !isStaff(r) && !isAdmin(r) {
		http.Error(w, "Yetkisiz erişim", http.StatusForbidden)
		return
	}

	var rows *sql.Rows
	var err error

	if isAdmin(r) {
		//  Admin tüm başvuruları görebilir
		rows, err = DB.Query(`
            SELECT id, user_id, ad, soyad, email, telefon, vize_tipi, vize_giris, express, sigorta,
            passport, biometric_photo, hotel_reservation, flight_ticket
            FROM applications`)
	} else {
		// Staff sadece kendi başvurularını görür
		userID := getUserID(r)
		rows, err = DB.Query(`
            SELECT id, user_id, ad, soyad, email, telefon, vize_tipi, vize_giris, express, sigorta,
            passport, biometric_photo, hotel_reservation, flight_ticket
            FROM applications WHERE user_id = ?`, userID)
	}

	if err != nil {
		http.Error(w, "Veriler alınamadı: "+err.Error(), http.StatusInternalServerError)
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
			http.Error(w, "Satır okunamadı: "+err.Error(), http.StatusInternalServerError)
			return
		}
		apps = append(apps, app)
	}

	if apps == nil {
		apps = []Application{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(apps)
}

// Belirli bir başvuruyu ID ile getir
func GetApplicationByID(w http.ResponseWriter, r *http.Request) {
	if !isStaff(r) && !isAdmin(r) {
		http.Error(w, "Yetkisiz erişim", http.StatusForbidden)
		return
	}

	id := mux.Vars(r)["id"]

	row := DB.QueryRow(`SELECT id, user_id, ad, soyad, email, telefon, vize_tipi, vize_giris, express, sigorta,
		passport, biometric_photo, hotel_reservation, flight_ticket
		FROM applications WHERE id = ?`, id)

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

// UpdateApplication - başvuruyu günceller (dosyalar dahil)
func UpdateApplication(w http.ResponseWriter, r *http.Request) {
	if !isStaff(r) {
		http.Error(w, "Yetkisiz erişim", http.StatusForbidden)
		return
	}

	id := mux.Vars(r)["id"]

	// Multipart form verisini çözümle
	err := r.ParseMultipartForm(20 << 20) // 20MB limit
	if err != nil {
		http.Error(w, "Form verisi çözümlenemedi", http.StatusBadRequest)
		return
	}

	// Text alanlarını al
	ad := r.FormValue("ad")
	soyad := r.FormValue("soyad")
	email := r.FormValue("email")
	telefon := r.FormValue("telefon")
	vizeTipi := r.FormValue("vize_tipi")
	vizeGiris := r.FormValue("vize_giris")
	express := r.FormValue("express")
	sigorta := r.FormValue("sigorta")

	// Dosya yüklemelerini işle
	uploadDir := "./uploads/"
	passportPath := handleFileUpload(r, "passport", uploadDir)
	biometricPath := handleFileUpload(r, "biometric_photo", uploadDir)
	hotelPath := handleFileUpload(r, "hotel_reservation", uploadDir)
	flightPath := handleFileUpload(r, "flight_ticket", uploadDir)

	//  Veritabanını güncelle (NULL olmayan dosyalar için sadece gelenleri güncelle)
	_, err = DB.Exec(`
        UPDATE applications
        SET ad=?, soyad=?, email=?, telefon=?, vize_tipi=?, vize_giris=?, express=?, sigorta=?,
            passport=IF(?<>'', ?, passport),
            biometric_photo=IF(?<>'', ?, biometric_photo),
            hotel_reservation=IF(?<>'', ?, hotel_reservation),
            flight_ticket=IF(?<>'', ?, flight_ticket)
        WHERE id=?`,
		ad, soyad, email, telefon, vizeTipi, vizeGiris, express, sigorta,
		passportPath, passportPath,
		biometricPath, biometricPath,
		hotelPath, hotelPath,
		flightPath, flightPath,
		id,
	)

	if err != nil {
		http.Error(w, "Veritabanı güncellenemedi: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Başvuru başarıyla güncellendi"))
}

// Yardımcı fonksiyon: Dosya yükleme
func handleFileUpload(r *http.Request, fieldName, uploadDir string) string {
	file, handler, err := r.FormFile(fieldName)
	if err != nil {
		return "" // dosya yüklenmediyse boş döner
	}
	defer file.Close()

	filePath := uploadDir + handler.Filename
	dst, _ := os.Create(filePath)
	defer dst.Close()
	io.Copy(dst, file)

	return filePath
}

// DeleteApplication - başvuruyu siler
func DeleteApplication(w http.ResponseWriter, r *http.Request) {
	if !isStaff(r) {
		http.Error(w, "Yetkisiz erişim", http.StatusForbidden)
		return
	}

	id := mux.Vars(r)["id"]
	_, err := DB.Exec("DELETE FROM applications WHERE id = ?", id)
	if err != nil {
		http.Error(w, "Başvuru silinemedi", http.StatusInternalServerError)
		return
	}

	w.Write([]byte("Başvuru silindi"))
}
