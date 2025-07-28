$(document).ready(function () {
  const token = localStorage.getItem("token");

  fetch("https://vize-sistemi.onrender.com/logs", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Sunucu hatası: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      $('#logsTable').DataTable({
        destroy: true,
        responsive: true,
        autoWidth: false, // ✅ Mobil uyumu iyileştir
        data: data,
        columns: [
          { data: 'user_id' },
          { data: 'ip' },
          { data: 'status' },
          { data: 'user_type' },
          { data: 'log_time' }
        ],

        // ✅ Mobilde her hücreye başlık ekle (kart görünümü için)
        createdRow: function (row, rowData, dataIndex) {
          $('td', row).each(function (index) {
            const header = $('#logsTable thead th').eq(index).text();
            $(this).attr('data-label', header);
          });
        }
      });
    })
    .catch(err => {
      console.error("Loglar alınamadı", err);
      alert("🚫 Loglar yüklenemedi. Detay: " + err.message);
    });
});
