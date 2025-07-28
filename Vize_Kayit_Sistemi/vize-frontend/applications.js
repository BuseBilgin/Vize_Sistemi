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
        { data: 'ad', title: 'Ad' },
        { data: 'soyad', title: 'Soyad' },
        { data: 'email', title: 'Email' },
        { data: 'telefon', title: 'Telefon' },
        { data: 'vize_tipi', title: 'Vize Tipi' },
        { data: 'vize_giris', title: 'Giriş' },
        { data: 'express', title: 'Express' },
        { data: 'sigorta', title: 'Sigorta' },
        { data: 'passport', title: 'Pasaport', render: d => d ? `<img src="https://vize-sistemi.onrender.com/uploads/${d}" class="preview">` : '' },
        { data: 'biometric_photo', title: 'Biyometrik', render: d => d ? `<img src="https://vize-sistemi.onrender.com/uploads/${d}" class="preview">` : '' },
        { data: 'hotel_reservation', title: 'Otel Rez.', render: d => d ? `<img src="https://vize-sistemi.onrender.com/uploads/${d}" class="preview">` : '' },
        { data: 'flight_ticket', title: 'Uçak Bileti', render: d => d ? `<img src="https://vize-sistemi.onrender.com/uploads/${d}" class="preview">` : '' }
      ],
      createdRow: function(row, data, dataIndex) {
        $('td', row).each(function(index) {
          const columnTitle = $('#applicationsTable').DataTable().settings()[0].aoColumns[index].title;
          $(this).attr('data-label', columnTitle);
        });
      }
    });
  });
});
