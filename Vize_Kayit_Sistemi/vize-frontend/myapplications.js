document.addEventListener("DOMContentLoaded", () => {
    loadMyApplications();
});

function loadMyApplications() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("🚫 Giriş yapmalısınız.");
        return;
    }

    fetch("https://vize-sistemi.onrender.com/applications", {
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
        console.log("📡 API Yanıt Kodu:", res.status);
        if (!res.ok) {
            return res.text().then(text => { 
                throw new Error("Sunucu Hatası: " + text); 
            });
        }
        return res.json();
    })
    .then(data => {
        console.log("📌 API'den Gelen Başvurular:", data);
        if (!Array.isArray(data) || data.length === 0) {
            alert("⚠️ Henüz başvuru bulunamadı.");
        }
        renderMyApplications(data);
    })
    .catch(err => {
        console.error("❌ Başvurular alınamadı:", err);
        alert("🚫 Başvurular yüklenirken hata oluştu: " + err.message);
    });
}

function renderMyApplications(applications) {
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

function editApplication(id) {
    localStorage.setItem("editAppId", id);
    window.location.href = "application.html?edit=true";
}

function deleteApplication(id) {
    if (!confirm("Bu başvuruyu silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem("token");
    fetch(`https://vize-sistemi.onrender.com/applications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(res => {
        if (res.ok) {
            alert("✅ Başvuru silindi");
            loadMyApplications();
        } else {
            return res.text().then(t => { throw new Error(t); });
        }
    })
    .catch(err => {
        console.error("❌ Silme hatası:", err);
        alert("🚫 Silme sırasında hata: " + err.message);
    });
}
