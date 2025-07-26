// common.js
document.addEventListener("DOMContentLoaded", () => {
  getMe();
});

function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

function getMe() {
  const token = localStorage.getItem("token");
  fetch("https://vize-sistemi.onrender.com/me", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => document.getElementById("userRole").innerText = `Rol: ${data.role}`)
    .catch(() => window.location.href = "index.html");
}
