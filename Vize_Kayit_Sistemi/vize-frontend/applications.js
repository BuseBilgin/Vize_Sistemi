$(document).ready(function() {
  const token = localStorage.getItem("token");
  fetch("https://vize-sistemi.onrender.com/applications", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      $('#applicationsTable').DataTable({
        destroy: true,
        responsive: true,
        data: data,
        columns: [
          { data: 'ad' },
          { data: 'soyad' },
          { data: 'email' },
          { data: 'telefon' },
          { data: 'vize_tipi' },
          { data: 'vize_giris' },
          { data: 'express' },
          { data: 'sigorta' },
          { data: 'passport', render: d => d ? `<img src="https://vize-sistemi.onrender.com/uploads/${d}" class="preview">` : '' },
          { data: 'biometric_photo', render: d => d ? `<img src="https://vize-sistemi.onrender.com/uploads/${d}" class="preview">` : '' },
          { data: 'hotel_reservation', render: d => d ? `<img src="https://vize-sistemi.onrender.com/uploads/${d}" class="preview">` : '' },
          { data: 'flight_ticket', render: d => d ? `<img src="https://vize-sistemi.onrender.com/uploads/${d}" class="preview">` : '' }
        ]
      });
    });
});
