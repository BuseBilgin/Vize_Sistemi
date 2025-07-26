package main

import (
	"log"
	"net/http"
	"strings" // ✅ Netlify domain kontrolü için gerekli

	"github.com/gorilla/mux"
)

func main() {
	// Veritabanına bağlan
	ConnectDB()

	// Router oluştur
	r := mux.NewRouter()
	r.Use(corsMiddleware)

	// uploads klasörünü public olarak sun
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("uploads"))))

	// OPTIONS isteklerine cevap ver (CORS için kritik)
	r.Methods("OPTIONS").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	// Kimlik doğrulama işlemleri
	r.HandleFunc("/register", RegisterHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/login", LoginHandler).Methods("POST", "OPTIONS")
	r.HandleFunc("/me", AuthenticateMiddleware(GetMe)).Methods("GET", "OPTIONS")
	r.HandleFunc("/logs", AuthenticateMiddleware(GetLoginLogs)).Methods("GET", "OPTIONS")

	// Başvuru işlemleri (CRUD)
	r.HandleFunc("/applications", AuthenticateMiddleware(CreateApplication)).Methods("POST", "OPTIONS")
	r.HandleFunc("/applications", AuthenticateMiddleware(GetApplications)).Methods("GET", "OPTIONS")
	r.HandleFunc("/applications/{id}", AuthenticateMiddleware(UpdateApplication)).Methods("PUT", "OPTIONS")
	r.HandleFunc("/applications/{id}", AuthenticateMiddleware(DeleteApplication)).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/applications/{id}", AuthenticateMiddleware(GetApplicationByID)).Methods("GET", "OPTIONS")

	// Admin kullanıcı işlemleri
	r.HandleFunc("/users", AuthenticateMiddleware(CreateUser)).Methods("POST", "OPTIONS")
	r.HandleFunc("/users", AuthenticateMiddleware(ListUsers)).Methods("GET", "OPTIONS")
	r.HandleFunc("/users/{id}/role", AuthenticateMiddleware(UpdateUserRole)).Methods("PUT", "OPTIONS")
	r.HandleFunc("/users/{id}", AuthenticateMiddleware(DeleteUser)).Methods("DELETE", "OPTIONS")

	// Sunucuyu başlat
	log.Println("Sunucu 8080 portunda çalışıyor...")
	log.Fatal(http.ListenAndServe(":8080", r))
}

// ✅ Gelişmiş CORS middleware – tüm Netlify domainlerine izin verir
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "http://localhost:3000" || strings.Contains(origin, ".netlify.app") {
			w.Header().Set("Access-Control-Allow-Origin", origin)
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}
