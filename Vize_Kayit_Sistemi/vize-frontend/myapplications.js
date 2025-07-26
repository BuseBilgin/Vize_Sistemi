$(document).ready(function() {
  loadMyApplications();
});

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
    .then(res => res.json())
    .then(data => {
      $("#applicationsTable").DataTable({
        destroy: true,
        responsive: true,
        data: data,
        columns: [
          { data: 'ad' },
          { data: 'soyad' },
          { data: 'email' },
          { data: 'telefon' },
          { data: 'vize_tipi' },
          { data: 'vize_giris' },
          { data: null, render: row => `<button onclick="deleteApplication(${row.id})" class="btn btn-danger btn-sm">Sil</button>` }
        ]
      });
    })
    .catch(() => alert("Başvurular alınamadı!"));
}

function deleteApplication(id) {
  const token = localStorage.getItem("token");
  if (!confirm("Başvuruyu silmek istiyor musunuz?")) return;

  fetch(`https://vize-sistemi.onrender.com/applications/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => res.ok ? loadMyApplications() : alert("Silme başarısız!"));
}
