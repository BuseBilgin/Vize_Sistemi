document.addEventListener("DOMContentLoaded", () => {
    loadApplications();
});

function loadApplications() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Giriş yapmalısınız.");
        return;
    }

    fetch("https://vize-sistemi.onrender.com/applications", {
        headers: { "Authorization": `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => {
            renderApplications(data);
        })
        .catch(err => console.error("Başvurular alınamadı:", err));
}

function renderApplications(applications) {
    const table = $('#applicationsTable').DataTable({
        destroy: true,
        responsive: true,
        data: applications,
        columns: [
            { data: 'ad' },
            { data: 'soyad' },
            { data: 'email' },
            { data: 'telefon' },
            { data: 'vize_tipi' },
            { data: 'vize_giris' },
            { data: 'express' },
            { data: 'sigorta' },
            {
                data: 'passport',
                render: d => d ? `<img src="https://vize-sistemi.onrender.com${d}" class="preview">` : ''
            },
            {
                data: 'biometric_photo',
                render: d => d ? `<img src="https://vize-sistemi.onrender.com${d}" class="preview">` : ''
            },
            {
                data: 'hotel_reservation',
                render: d => d ? `<img src="https://vize-sistemi.onrender.com${d}" class="preview">` : ''
            },
            {
                data: 'flight_ticket',
                render: d => d ? `<img src="https://vize-sistemi.onrender.com${d}" class="preview">` : ''
            }
        ]
    });
}
