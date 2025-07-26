$(document).ready(function() {
  const token = localStorage.getItem("token");
  fetch("https://vize-sistemi.onrender.com/logs", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      $('#logsTable').DataTable({
        destroy: true,
        responsive: true,
        data: data,
        columns: [
          { data: 'user_id' },
          { data: 'ip' },
          { data: 'status' },
          { data: 'user_type' },
          { data: 'log_time' }
        ]
      });
    })
    .catch(err => console.error("Loglar alınamadı", err));
});
