document.addEventListener("DOMContentLoaded", () => {
  getMe();
  loadApplications();
  loadUsers();
  loadLogs();
});

// Çıkış
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// Kullanıcı rolü bilgisi al
function getMe() {
  const token = localStorage.getItem("token");
  fetch("http://localhost:8080/me", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("userRole").innerText = `Rol: ${data.role}`;
    })
    .catch((err) => console.error("Yetki alınamadı", err));
}

//  YOL DÜZELTME Fonksiyonu
function getImageUrl(file) {
  if (!file) return "";
  const clean = file.replace(/^(\.\/)?uploads[\\/]/, "");
  return `http://localhost:8080/uploads/${clean}`;
}

// Başvuruları yükle
function loadApplications() {
  const token = localStorage.getItem("token");
  fetch("http://localhost:8080/applications", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => renderApplications(data))
    .catch((err) => console.error("Başvuru alınamadı", err));
}

// Başvuruları tabloya yazdır
function renderApplications(apps) {
  const tbody = document.querySelector("#applicationsTable tbody");
  tbody.innerHTML = "";
  apps.forEach((app) => {
    const row = tbody.insertRow();
    row.insertCell().textContent = app.ad;
    row.insertCell().textContent = app.soyad;
    row.insertCell().textContent = app.email;
    row.insertCell().textContent = app.telefon;
    row.insertCell().textContent = app.vize_tipi;
    row.insertCell().textContent = app.vize_giris;
    row.insertCell().textContent = app.express;
    row.insertCell().textContent = app.sigorta;

    // Görseller doğru URL ile
    row.insertCell().innerHTML = app.passport ? `<img src="${getImageUrl(app.passport)}" class="preview">` : "";
    row.insertCell().innerHTML = app.biometric_photo ? `<img src="${getImageUrl(app.biometric_photo)}" class="preview">` : "";
    row.insertCell().innerHTML = app.hotel_reservation ? `<img src="${getImageUrl(app.hotel_reservation)}" class="preview">` : "";
    row.insertCell().innerHTML = app.flight_ticket ? `<img src="${getImageUrl(app.flight_ticket)}" class="preview">` : "";
  });
}

// Kullanıcıları yükle
function loadUsers() {
  const token = localStorage.getItem("token");
  fetch("http://localhost:8080/users", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => renderUsers(data))
    .catch((err) => console.error("Kullanıcılar alınamadı", err));
}

// Kullanıcı tablosu
function renderUsers(users) {
  const tbody = document.querySelector("#usersTable tbody");
  tbody.innerHTML = "";
  users.forEach((u) => {
    const row = tbody.insertRow();
    row.insertCell().textContent = u.name;
    row.insertCell().textContent = u.email;
    row.insertCell().textContent = u.role;

    const actionCell = row.insertCell();
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Sil";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = () => deleteUser(u.id);

    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = u.role === "admin" ? "Staff Yap" : "Admin Yap";
    toggleBtn.classList.add("edit-btn");
    toggleBtn.onclick = () => updateUserRole(u.id, u.role === "admin" ? "staff" : "admin");

    actionCell.appendChild(deleteBtn);
    actionCell.appendChild(toggleBtn);
  });
}

// Kullanıcı sil
function deleteUser(id) {
  const token = localStorage.getItem("token");
  if (!confirm("Kullanıcı silinsin mi?")) return;
  fetch(`http://localhost:8080/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    res.ok ? loadUsers() : res.text().then((msg) => alert("Silme hatası: " + msg));
  });
}

// Kullanıcı rolü güncelle
function updateUserRole(id, role) {
  const token = localStorage.getItem("token");
  fetch(`http://localhost:8080/users/${id}/role`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ role: role.toLowerCase() }),
  }).then((res) => {
    res.ok ? loadUsers() : res.text().then((msg) => alert("Rol güncellenemedi: " + msg));
  });
}

// Logları yükle
function loadLogs() {
  const token = localStorage.getItem("token");
  fetch("http://localhost:8080/logs", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((logs) => renderLogs(logs))
    .catch((err) => console.error("Loglar alınamadı", err));
}

// Log tablosu
function renderLogs(logs) {
  const tbody = document.querySelector("#logsTable tbody");
  tbody.innerHTML = "";
  logs.forEach((log) => {
    const row = tbody.insertRow();
    row.insertCell().textContent = log.user_id;
    row.insertCell().textContent = log.ip;
    row.insertCell().textContent = log.status;
    row.insertCell().textContent = log.user_type;
    row.insertCell().textContent = log.log_time;
  });
}

// Yeni kullanıcı ekle
document.getElementById("addUserForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("newUserName").value;
  const email = document.getElementById("newUserEmail").value;
  const password = document.getElementById("newUserPassword").value;
  const role = document.getElementById("newUserRole").value;

  const token = localStorage.getItem("token");
  fetch("http://localhost:8080/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, email, password, role: role.toLowerCase() }),
  })
    .then((res) => res.ok ? loadUsers() : res.text().then((text) => alert("Kullanıcı ekleme hatası: " + text)))
    .catch((err) => alert("İstek başarısız: " + err));
});

//  Görsel tıklanınca büyütme efekti
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("preview")) {
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImage");
    modalImg.src = e.target.src;
    modal.style.display = "block";
  }
});

document.getElementById("closeModal").addEventListener("click", function() {
  document.getElementById("imgModal").style.display = "none";
});

document.getElementById("imgModal").addEventListener("click", function(e) {
  if (e.target.id === "imgModal") this.style.display = "none";
});
