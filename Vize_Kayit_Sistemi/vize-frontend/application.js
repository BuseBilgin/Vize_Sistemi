document.addEventListener("DOMContentLoaded", async () => {
  const editId = localStorage.getItem("editAppId");
  if (editId) {
    await fillFormForUpdate(editId);
  }
});

// ✅ Başvuru Formu Gönderme
document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Giriş yapmalısınız.");
    return;
  }

  const form = e.target;
  const updateId = localStorage.getItem("editAppId");
  const method = updateId ? "PUT" : "POST";
  const endpoint = updateId
    ? `https://vize-sistemi.onrender.com/applications/${updateId}`
    : "https://vize-sistemi.onrender.com/applications";

  const formData = new FormData(form);

  try {
    const res = await fetch(endpoint, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      alert(updateId ? "✅ Başvuru güncellendi." : "✅ Başvuru eklendi.");
      localStorage.removeItem("editAppId");
      window.location.href = "application2.html"; // Başvurularım sayfasına yönlendir
    } else {
      alert("🚫 İşlem başarısız!");
    }
  } catch (err) {
    console.error(err);
    alert("🚫 Sunucuya bağlanılamadı.");
  }
});

// ✅ Düzenlenecek Başvuru Bilgilerini Formda Göster
async function fillFormForUpdate(id) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`https://vize-sistemi.onrender.com/applications/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const app = await res.json();

    document.querySelector('input[name="ad"]').value = app.ad;
    document.querySelector('input[name="soyad"]').value = app.soyad;
    document.querySelector('input[name="email"]').value = app.email;
    document.querySelector('input[name="telefon"]').value = app.telefon;
    document.querySelector('select[name="vize_tipi"]').value = app.vize_tipi;
    document.querySelector('select[name="express"]').value = app.express;
    document.querySelector('select[name="sigorta"]').value = app.sigorta;
    document.querySelector('select[name="vize_giris"]').value = app.vize_giris;

    // ✅ Dosyalar zaten backend’de, bu yüzden kullanıcı isterse yeni yükleyecek.
    document.querySelector('button[type="submit"]').textContent = "Güncelle";
  } catch (err) {
    console.error("Form doldurulamadı:", err);
  }
}
