$(document).ready(function () {
  loadMyApplications();

  // ✅ Eğer güncelleme sonrası geldiyse mesaj göster
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("updated") === "true") {
    alert("✅ Başvuru başarıyla güncellendi!");
    history.replaceState(null, "", "application2.html"); // URL’den parametreyi kaldır
  }
});

// ✅ Başvurularımı Yükle
function loadMyApplications() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Giriş yapmalısınız!");
    window.location.href = "index.html";
    return;
  }

  fetch("https://vize-sistemi.onrender.com/applications", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) throw new Error("Veri alınamadı");
      return res.json();
    })
    .then(data => {
      $("#applicationsTable").DataTable({
        destroy: true,
        responsive: true,
        data: data,
        columns: [
          { data: "ad" },
          { data: "soyad" },
          { data: "email" },
          { data: "telefon" },
          { data: "vize_tipi" },
          { data: "vize_giris" },
          {
            data: null,
            render: row => `
              <button class="btn btn-warning btn-sm" onclick="editApplication(${row.id})">
                <i class="fas fa-edit"></i> Düzenle
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteApplication(${row.id})">
                <i class="fas fa-trash"></i> Sil
              </button>`
          }
        ]
      });
    })
    .catch(() => alert("🚫 Başvurular alınamadı!"));
}

// ✅ Başvuru Düzenleme → Kullanıcıyı application.html sayfasına yönlendiriyoruz
function editApplication(id) {
  localStorage.setItem("editAppId", id); // id’yi saklıyoruz
  window.location.href = "application.html";
}

// ✅ Başvuru Silme
function deleteApplication(id) {
  const token = localStorage.getItem("token");
  if (!confirm("Bu başvuruyu silmek istiyor musunuz?")) return;

  fetch(`https://vize-sistemi.onrender.com/applications/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => {
    if (res.ok) {
      alert("✅ Başvuru silindi.");
      loadMyApplications();
    } else {
      alert("🚫 Silme başarısız!");
    }
  });
}
