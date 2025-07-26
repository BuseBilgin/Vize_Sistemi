document.addEventListener("DOMContentLoaded", () => {
  loadApplications();
});

document.getElementById("applicationForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Giriş yapmalısınız.");
    return;
  }

  const form = e.target;
  const updateId = document.getElementById("updateId")?.value;
  const method = updateId ? "PUT" : "POST";
  const endpoint = updateId
    ? `https://vize-sistemi.onrender.com/applications/${updateId}`
    : "https://vize-sistemi.onrender.com/applications";

  const formData = new FormData(form);

  try {
    const res = await fetch(endpoint, {
      method,
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      alert(updateId ? "Başvuru güncellendi." : "Başvuru eklendi.");
      form.reset();

      if (updateId) {
        document.getElementById("updateId").remove();
        document.querySelector("#applicationForm button[type='submit']").textContent = "Başvur";
      }

      loadApplications();
    } else {
      const errorText = await res.text();
      alert("Hata: " + errorText);
    }
  } catch (err) {
    console.error(err);
    alert("İstek gönderilemedi.");
  }
});

function loadApplications() {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch("https://vize-sistemi.onrender.com/applications", {
    headers: { "Authorization": `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(applications => renderApplications(applications))
    .catch(err => console.error("Başvurular alınamadı:", err));
}

function renderApplications(applications) {
  const tbody = document.querySelector("#applicationsTable tbody");
  tbody.innerHTML = "";

  if (!applications.length) {
    const row = tbody.insertRow();
    const cell = row.insertCell(0);
    cell.colSpan = 7;
    cell.textContent = "Henüz başvuru yok.";
    return;
  }

  applications.forEach(app => {
    const row = tbody.insertRow();
    row.insertCell().textContent = app.ad;
    row.insertCell().textContent = app.soyad;
    row.insertCell().textContent = app.email;
    row.insertCell().textContent = app.telefon;
    row.insertCell().textContent = app.vize_tipi;
    row.insertCell().textContent = app.vize_giris;

    // ✅ İşlem hücresi
    const actionCell = row.insertCell();
    actionCell.classList.add("actions");

    // ✅ Düzenle Butonu
    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.innerHTML = `<i class="fas fa-edit"></i> Düzenle`;
    editBtn.onclick = () => fillFormForUpdate(app.id);

    // ✅ Sil Butonu
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = `<i class="fas fa-trash"></i> Sil`;
    deleteBtn.onclick = () => deleteApplication(app.id);

    actionCell.appendChild(editBtn);
    actionCell.appendChild(deleteBtn);
  });
}

async function fillFormForUpdate(id) {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`https://vize-sistemi.onrender.com/applications/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
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

    let hidden = document.getElementById("updateId");
    if (!hidden) {
      hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.id = "updateId";
      hidden.name = "updateId";
      document.getElementById("applicationForm").appendChild(hidden);
    }
    hidden.value = id;

    document.querySelector("#applicationForm button[type='submit']").textContent = "Güncelle";
  } catch (err) {
    console.error("Form doldurulamadı:", err);
  }
}

async function deleteApplication(id) {
  const token = localStorage.getItem("token");
  if (!confirm("Bu başvuruyu silmek istediğinizden emin misiniz?")) return;

  try {
    const res = await fetch(`https://vize-sistemi.onrender.com/applications/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.ok) {
      alert("Başvuru silindi.");
      loadApplications();
    } else {
      const errText = await res.text();
      alert("Silme hatası: " + errText);
    }
  } catch (err) {
    console.error("Silme hatası:", err);
  }
}
