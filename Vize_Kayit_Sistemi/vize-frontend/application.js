document.addEventListener("DOMContentLoaded", async () => {
  console.log("✅ JS yüklendi, DOM hazır.");

  const editId = localStorage.getItem("editAppId");

  if (editId) {
    await fillFormForUpdate(editId);
  } else {
    localStorage.removeItem("editAppId");
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.textContent = "Başvur";
  }

  // ✅ Dosya önizleme eventleri
  initFilePreview("passportInput", "passportPreview");
  initFilePreview("biometricInput", "biometricPreview");
  initFilePreview("hotelInput", "hotelPreview");
  initFilePreview("flightInput", "flightPreview");
});

// ✅ Başvuru Gönderme
document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  console.log("📌 Submit event tetiklendi");

  const token = localStorage.getItem("token");
  if (!token) {
    alert("🚫 Giriş yapmalısınız.");
    return;
  }

  const form = e.target;
  const updateId = localStorage.getItem("editAppId");
  const method = updateId ? "PUT" : "POST";
  const endpoint = updateId
    ? `https://vize-sistemi.onrender.com/applications/${updateId}`
    : "https://vize-sistemi.onrender.com/applications";

  const formData = new FormData(form);

  // ✅ Debug
  console.log("📤 Gönderilen FormData:");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const res = await fetch(endpoint, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    console.log("📡 HTTP Status:", res.status);

    let responseBody;
    try {
      responseBody = await res.json();
    } catch {
      responseBody = await res.text();
    }

    console.log("✅ Sunucu Yanıtı:", responseBody);

    if (res.ok) {
      alert(updateId ? "✅ Başvuru başarıyla güncellendi." : "✅ Başvuru başarıyla eklendi.");
      localStorage.removeItem("editAppId");
      window.location.href = "application2.html?updated=true";
    } else {
      alert(`🚫 İşlem başarısız! Sunucu yanıtı: ${JSON.stringify(responseBody)}`);
    }
  } catch (err) {
    console.error("🚫 Fetch Hatası:", err);
    alert("🚫 Sunucuya bağlanılamadı. Konsolu kontrol edin.");
  }
});

// ✅ Formu Düzenleme Moduna Getir
async function fillFormForUpdate(id) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`https://vize-sistemi.onrender.com/applications/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      alert("🚫 Başvuru bilgileri alınamadı!");
      return;
    }

    const app = await res.json();
    console.log("🟢 Güncellenecek Başvuru:", app);

    document.querySelector('input[name="ad"]').value = app.ad || "";
    document.querySelector('input[name="soyad"]').value = app.soyad || "";
    document.querySelector('input[name="email"]').value = app.email || "";
    document.querySelector('input[name="telefon"]').value = app.telefon || "";
    document.querySelector('select[name="vize_tipi"]').value = app.vize_tipi || "30 Gün";
    document.querySelector('select[name="express"]').value = app.express || "Hayır";
    document.querySelector('select[name="sigorta"]').value = app.sigorta || "Yok";
    document.querySelector('select[name="vize_giris"]').value = app.vize_giris || "Tek Giriş";

    // ✅ Mevcut verileri inputlara set ettikten sonra
if (app.passport) {
  document.getElementById("passportPreview").innerHTML =
    `<img src="https://vize-sistemi.onrender.com${app.passport}" style="max-width:100%;border:1px solid #ccc;border-radius:4px;">`;
}

if (app.biometric_photo) {
  document.getElementById("biometricPreview").innerHTML =
    `<img src="https://vize-sistemi.onrender.com${app.biometric_photo}" style="max-width:100%;border:1px solid #ccc;border-radius:4px;">`;
}

if (app.hotel_reservation) {
  document.getElementById("hotelPreview").innerHTML =
    `<img src="https://vize-sistemi.onrender.com${app.hotel_reservation}" style="max-width:100%;border:1px solid #ccc;border-radius:4px;">`;
}

if (app.flight_ticket) {
  document.getElementById("flightPreview").innerHTML =
    `<img src="https://vize-sistemi.onrender.com${app.flight_ticket}" style="max-width:100%;border:1px solid #ccc;border-radius:4px;">`;
}


    // ✅ Güncellemede dosya yükleme zorunluluğunu kaldır
    document.querySelectorAll('input[type="file"]').forEach(fileInput => {
      fileInput.removeAttribute("required");
    });

    document.querySelector('button[type="submit"]').textContent = "Güncelle";
  } catch (err) {
    console.error("🚫 Form doldurulamadı:", err);
  }
}

// ✅ Dosya Önizleme Fonksiyonu
function initFilePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);

  if (!input || !preview) {
    console.warn(`⚠️ Önizleme için ID bulunamadı: ${inputId}, ${previewId}`);
    return;
  }

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = e => {
          preview.innerHTML = `<img src="${e.target.result}" alt="preview" style="max-width:100%;border:1px solid #ccc;border-radius:4px;">`;
        };
        reader.readAsDataURL(file);
      } else {
        preview.textContent = `📄 ${file.name}`;
      }
    } else {
      preview.textContent = "Henüz dosya seçilmedi";
    }
  });
}
