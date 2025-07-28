document.addEventListener("DOMContentLoaded", async () => {
  const editId = localStorage.getItem("editAppId");

  if (editId) {
    await fillFormForUpdate(editId);
  } else {
    localStorage.removeItem("editAppId");
    document.querySelector('button[type="submit"]').textContent = "Başvur";
  }

  // ✅ Dosya önizleme eventleri ekleniyor
  initFilePreview("passportInput", "passportPreview");
  initFilePreview("biometricInput", "biometricPreview");
  initFilePreview("hotelInput", "hotelPreview");
  initFilePreview("flightInput", "flightPreview");
});

// ✅ Başvuru Gönderme
document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();

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

  // ✅ Debug: Gönderilen form verilerini logla
  console.log("📤 Gönderilen Form Verileri:");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const res = await fetch(endpoint, {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    const responseText = await res.text();
    console.log("✅ Sunucu Yanıtı:", responseText);

    if (res.ok) {
      alert(updateId ? "✅ Başvuru başarıyla güncellendi." : "✅ Başvuru başarıyla eklendi.");
      localStorage.removeItem("editAppId");
      window.location.href = "application2.html?updated=true";
    } else {
      alert(`🚫 İşlem başarısız! Sunucu yanıtı: ${responseText}`);
    }
  } catch (err) {
    console.error("🚫 Fetch Hatası:", err);
    alert("🚫 Sunucuya bağlanılamadı. Detay için konsolu kontrol edin.");
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

    document.querySelector('input[name="ad"]').value = app.ad;
    document.querySelector('input[name="soyad"]').value = app.soyad;
    document.querySelector('input[name="email"]').value = app.email;
    document.querySelector('input[name="telefon"]').value = app.telefon;
    document.querySelector('select[name="vize_tipi"]').value = app.vize_tipi;
    document.querySelector('select[name="express"]').value = app.express;
    document.querySelector('select[name="sigorta"]').value = app.sigorta;
    document.querySelector('select[name="vize_giris"]').value = app.vize_giris;

    // ✅ Güncelleme modunda dosya yükleme zorunlu değil
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

  if (!input || !preview) return;

  input.addEventListener("change", () => {
    const file = input.files[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = e => {
          preview.innerHTML = `<img src="${e.target.result}" alt="preview">`;
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
