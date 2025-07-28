document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ JS yüklendi, DOM hazır.");

  const editId = localStorage.getItem("editAppId");
  if (editId) {
    await fillFormForUpdate(editId);
  } else {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.textContent = "Başvur";
  }

  initFilePreview("passportInput", "passportPreview");
  initFilePreview("biometricInput", "biometricPreview");
  initFilePreview("hotelInput", "hotelPreview");
  initFilePreview("flightInput", "flightPreview");
});

document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) { alert("🚫 Giriş yapmalısınız."); return; }

  const updateId = localStorage.getItem("editAppId");
  const method = updateId ? "PUT" : "POST";
  const endpoint = updateId
    ? `https://vize-sistemi.onrender.com/applications/${updateId}`
    : "https://vize-sistemi.onrender.com/applications";

  const formData = new FormData(this);

  try {
    const res = await fetch(endpoint, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    let data = await res.json().catch(() => ({}));
    if (res.ok) {
      alert(updateId ? "✅ Başvuru güncellendi" : "✅ Başvuru eklendi");
      localStorage.removeItem("editAppId");
      window.location.href = "application2.html?updated=true";
    } else {
      alert("🚫 İşlem başarısız: " + JSON.stringify(data));
    }
  } catch (err) {
    alert("🚫 Sunucu hatası: " + err.message);
  }
});

async function fillFormForUpdate(id) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`https://vize-sistemi.onrender.com/applications/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return alert("🚫 Başvuru bilgileri alınamadı!");

    const app = await res.json();

    document.querySelector('input[name="ad"]').value = app.ad || "";
    document.querySelector('input[name="soyad"]').value = app.soyad || "";
    document.querySelector('input[name="email"]').value = app.email || "";
    document.querySelector('input[name="telefon"]').value = app.telefon || "";
    document.querySelector('select[name="vize_tipi"]').value = app.vize_tipi || "30 Gün";
    document.querySelector('select[name="vize_giris"]').value = app.vize_giris || "Tek Giriş";
    document.querySelector('select[name="express"]').value = app.express || "Hayır";
    document.querySelector('select[name="sigorta"]').value = app.sigorta || "Yok";

    if (app.passport) document.getElementById("passportPreview").innerHTML = `<img src="https://vize-sistemi.onrender.com${app.passport}">`;
    if (app.biometric_photo) document.getElementById("biometricPreview").innerHTML = `<img src="https://vize-sistemi.onrender.com${app.biometric_photo}">`;
    if (app.hotel_reservation) document.getElementById("hotelPreview").innerHTML = `<img src="https://vize-sistemi.onrender.com${app.hotel_reservation}">`;
    if (app.flight_ticket) document.getElementById("flightPreview").innerHTML = `<img src="https://vize-sistemi.onrender.com${app.flight_ticket}">`;

    document.querySelectorAll('input[type="file"]').forEach(el => el.removeAttribute("required"));
    document.querySelector('button[type="submit"]').textContent = "Güncelle";
  } catch (err) {
    console.error("🚫 Form doldurulamadı:", err);
  }
}

function initFilePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input) return;
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => { preview.innerHTML = `<img src="${e.target.result}">`; };
      reader.readAsDataURL(file);
    }
  });
}
