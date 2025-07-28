document.addEventListener("DOMContentLoaded", () => {
    loadMyApplications();
});

function loadMyApplications() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Giriş yapmalısınız.");
        return;
    }

    fetch("https://vize-sistemi.onrender.com/applications", {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => renderMyApplications(data))
        .catch(err => console.error("Başvurular alınamadı:", err));
}

function renderMyApplications(applications) {
    const table = $('#applicationsTable').DataTable({
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

// ✅ Düzenleme fonksiyonu
function editApplication(id) {
    localStorage.setItem("editAppId", id);
    window.location.href = "application.html";
}

// ✅ Silme fonksiyonu
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
                alert("🚫 Silme hatası");
            }
        });
}
