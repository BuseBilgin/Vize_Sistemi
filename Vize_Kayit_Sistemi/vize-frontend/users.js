$(document).ready(function () {
  loadUsers();

  $("#addUserForm").on("submit", function (e) {
    e.preventDefault();
    addUser();
  });
});

function loadUsers() {
  const token = localStorage.getItem("token");
  fetch("https://vize-sistemi.onrender.com/users", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      $('#usersTable').DataTable({
        destroy: true,
        responsive: true,
        autoWidth: false, // ✅ Mobilde düzgün kolon genişliği
        data: data,
        columns: [
          { data: 'name' },
          { data: 'email' },
          { data: 'role' },
          {
            data: null, render: row => `
              <button class="btn btn-sm btn-danger mb-1" onclick="deleteUser(${row.id})">Sil</button>
              <button class="btn btn-sm btn-warning mb-1" onclick="updateUserRole(${row.id}, '${row.role === "admin" ? "staff" : "admin"}')">
                ${row.role === "admin" ? "Staff Yap" : "Admin Yap"}
              </button>`
          }
        ],

        // ✅ Mobilde her hücreye kolon başlığı ekle
        createdRow: function (row, data, dataIndex) {
          $('td', row).each(function (index) {
            const header = $('#usersTable thead th').eq(index).text();
            $(this).attr('data-label', header);
          });
        }
      });
    })
    .catch(err => console.error("Kullanıcılar yüklenemedi", err));
}

// ✅ Kullanıcı Silme
function deleteUser(id) {
  if (!confirm("Kullanıcı silinsin mi?")) return;
  const token = localStorage.getItem("token");
  fetch(`https://vize-sistemi.onrender.com/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => {
    res.ok ? loadUsers() : alert("Silme hatası!");
  }).catch(err => alert("İstek başarısız: " + err));
}

// ✅ Rol Güncelleme
function updateUserRole(id, role) {
  const token = localStorage.getItem("token");
  fetch(`https://vize-sistemi.onrender.com/users/${id}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ role })
  }).then(res => {
    res.ok ? loadUsers() : alert("Rol güncellenemedi!");
  }).catch(err => alert("İstek başarısız: " + err));
}

// ✅ Kullanıcı Ekleme
function addUser() {
  const name = $("#newUserName").val();
  const email = $("#newUserEmail").val();
  const password = $("#newUserPassword").val();
  const role = $("#newUserRole").val();

  const token = localStorage.getItem("token");
  fetch("https://vize-sistemi.onrender.com/users", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, email, password, role })
  }).then(res => {
    if (res.ok) {
      document.getElementById("addUserForm").reset();
      loadUsers();
    } else {
      alert("Kullanıcı ekleme hatası!");
    }
  }).catch(err => alert("İstek başarısız: " + err));
}
