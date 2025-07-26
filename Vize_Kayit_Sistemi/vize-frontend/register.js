$(document).ready(function () {
  $('#registerForm').submit(function (e) {
    e.preventDefault();

    const name = $('#name').val();
    const email = $('#email').val();
    const password = $('#password').val();
    const confirmPassword = $('#confirmPassword').val();

    if (password !== confirmPassword) {
      $('#result').css('color', 'red').text('Şifreler uyuşmuyor!');
      return;
    }

    $.ajax({
      url: 'http://localhost:8080/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ name, email, password }),
      success: function (res) {
        $('#result').css('color', 'green').text(res.message || 'Kayıt başarılı!');

        // ✅ Kayıt sonrası otomatik login ve rol kontrolü
        $.ajax({
          url: 'http://localhost:8080/login',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ email, password }),
          success: function (loginRes) {
            localStorage.setItem('token', loginRes.token);
            localStorage.setItem('role', loginRes.role);

            if (loginRes.role === 'admin') {
              window.location.href = 'dashboard.html';
            } else {
              window.location.href = 'application.html';
            }
          },
          error: function () {
            $('#result').css('color', 'red').text('Otomatik giriş başarısız oldu.');
          }
        });
      },
      error: function (xhr) {
        $('#result').css('color', 'red').text('Kayıt başarısız: ' + xhr.responseText);
      }
    });
  });
});
