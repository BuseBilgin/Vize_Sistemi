$(document).ready(function () {
  $('#loginForm').submit(function (e) {
    e.preventDefault(); // Sayfanın yenilenmesini engelle

    const email = $('#email').val();
    const password = $('#password').val();

    $.ajax({
      url: 'https://vize-sistemi.onrender.com/login',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ email, password }),
      success: function (response) {
        $('#result').css('color', 'green').text('Giriş başarılı!');
        console.log('JWT:', response.token);

        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role); // rolü de sakla

        // Kullanıcı rolüne göre yönlendirme
        if (response.role === 'admin') {
          window.location.href = 'applications.html.html';
        } else if (response.role === 'staff') {
          window.location.href = 'application.html';
        } else {
          alert("Bilinmeyen kullanıcı rolü!");
        }
      },
      error: function (xhr) {
        $('#result').css('color', 'red').text('Giriş başarısız: ' + xhr.responseText);
      }
    });
  });
});
