document.addEventListener("DOMContentLoaded", () => {
    console.log("✅ applications.js yüklendi.");
    loadApplications();
});

// ✅ Başvuruları yükle
function loadApplications() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("🚫 Giriş yapmalısınız.");
        return;
    }

    console.log("📡 Başvurular fetch ediliyor...");

    fetch("https://vize-sistemi.onrender.com/applications", {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(async res => {
            console.log("📡 HTTP Status:", res.status);
            if (!res.ok) {
                const errorText = await res.text();
                console.error("🚫 Sunucu hatası:", errorText);
                alert("🚫 Başvurular alınamadı! Hata: " + errorText);
                return [];
            }
            return res.json();
        })
        .then(data => {
            console.log("📥 Gelen Veri:", data);
            if (!Array.isArray(data)) {
                console.error("🚫 Beklenmeyen yanıt formatı:", data);
                alert("🚫 Sunucu geçersiz veri gönderdi!");
                return;
            }
            renderApplications(data);
        })
        .catch(err => {
            console.error("🔥 Fetch hatası:", err);
            alert("🚫 Sunucuya bağlanılamadı!");
        });
}

// ✅ Başvuruları tabloya bas
function renderApplications(applications) {
    console.log("🟢 Tabloya işlenecek başvuru sayısı:", applications.length);

    $('#applicationsTable').DataTable({
        destroy: true,
        responsive: true,
        data: applications,
        columns: [
            { data: 'ad' },
            { data: 'soyad' },
            { data: 'email' },
            { data: 'telefon' },
            { data: 'vize_tipi' },
            { data: 'vize_giris' },
            { data: 'express' },
            { data: 'sigorta' },
            {
                data: 'passport',
                render: d => d ? `<img src="https://vize-sistemi.onrender.com${d}" class="preview">` : '—'
            },
            {
                data: 'biometric_photo',
                render: d => d ? `<img src="https://vize-sistemi.onrender.com${d}" class="preview">` : '—'
            },
            {
                data: 'hotel_reservation',
                render: d => d ? `<img src="https://vize-sistemi.onrender.com${d}" class="preview">` : '—'
            },
            {
                data: 'flight_ticket',
                render: d => d ? `<img src="https://vize-sistemi.onrender.com${d}" class="preview">` : '—'
            },
            {
                data: 'id',
                render: id => `
                    <button class="edit-btn" onclick="editApplication(${id})">✏️ Düzenle</button>
                    <button class="delete-btn" onclick="deleteApplication(${id})">🗑️ Sil</button>
                `
            }
        ]
    });
}

// ✅ Düzenleme Fonksiyonu
function editApplication(id) {
    console.log("✏️ Düzenlenecek başvuru ID:", id);
    localStorage.setItem("editAppId", id);
    window.location.href = "application.html?edit=true";
}

// ✅ Silme Fonksiyonu
function deleteApplication(id) {
    if (!confirm("❗ Bu başvuruyu silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem("token");
    fetch(`https://vize-sistemi.onrender.com/applications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => {
            if (res.ok) {
                alert("✅ Başvuru silindi.");
                loadApplications(); // tabloyu yenile
            } else {
                alert("🚫 Silme başarısız!");
            }
        })
        .catch(err => console.error("🔥 Silme hatası:", err));
}
