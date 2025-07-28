document.addEventListener("DOMContentLoaded", async () => {
    const editId = localStorage.getItem("editAppId");
    if (editId) {
        await fillFormForUpdate(editId);
    } else {
        localStorage.removeItem("editAppId");
        document.querySelector('button[type="submit"]').textContent = "Başvur";
    }
});

// ✅ Başvuru Gönderme
document.getElementById("applicationForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("🚫 Giriş yapmalısınız.");
        return;
    }

    const updateId = localStorage.getItem("editAppId");
    const endpoint = updateId
        ? `https://vize-sistemi.onrender.com/applications/${updateId}`
        : `https://vize-sistemi.onrender.com/applications`;
    const method = updateId ? "PUT" : "POST";

    const formData = new FormData(this);

    try {
        const res = await fetch(endpoint, {
            method,
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });

        if (res.ok) {
            alert(updateId ? "✅ Başvuru başarıyla güncellendi." : "✅ Başvuru başarıyla eklendi.");
            localStorage.removeItem("editAppId");
            window.location.href = "application2.html?updated=true";
        } else {
            const err = await res.text();
            alert("🚫 İşlem başarısız: " + err);
        }
    } catch (err) {
        console.error("❌ Sunucu hatası:", err);
        alert("🚫 Sunucuya bağlanılamadı.");
    }
});

// ✅ Düzenlenecek Başvuruyu Formda Göster
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
        document.querySelector('input[name="ad"]').value = app.ad;
        document.querySelector('input[name="soyad"]').value = app.soyad;
        document.querySelector('input[name="email"]').value = app.email;
        document.querySelector('input[name="telefon"]').value = app.telefon;
        document.querySelector('select[name="vize_tipi"]').value = app.vize_tipi;
        document.querySelector('select[name="express"]').value = app.express;
        document.querySelector('select[name="sigorta"]').value = app.sigorta;
        document.querySelector('select[name="vize_giris"]').value = app.vize_giris;

        // ✅ Güncelleme modunda dosya zorunluluğu kaldır
        document.querySelectorAll('input[type="file"]').forEach(input => input.removeAttribute("required"));

        document.querySelector('button[type="submit"]').textContent = "Güncelle";
    } catch (err) {
        console.error("❌ Form doldurulamadı:", err);
    }
}
