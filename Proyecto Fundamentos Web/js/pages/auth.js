document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            fetch('api/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email:    document.getElementById('email').value,
                    password: document.getElementById('password').value
                })
            })
            .then(r => r.json())
            .then(data => {
                if(data.status === 'success') {
                    localStorage.setItem('user_id',        data.data.id);
                    localStorage.setItem('user_name',      data.data.nombre);
                    localStorage.setItem('rol_id',         data.data.rol_id);
                    localStorage.setItem('empresa_id',     data.data.empresa_id);
                    localStorage.setItem('empresa_nombre', data.data.empresa_nombre);
                    window.location.href = data.data.rol_id == 1 ? 'admin_dashboard.html' : 'client_dashboard.html';
                } else {
                    alert(data.message);
                }
            })
            .catch(() => alert('Error conectando con el servidor'));
        });
    }

    const registroForm = document.getElementById('registroForm');
    if(registroForm) {
        registroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            fetch('api/registro.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razon:     document.getElementById('reg_razon').value,
                    rfc:       document.getElementById('reg_rfc').value,
                    giro:      document.getElementById('reg_giro').value,
                    direccion: document.getElementById('reg_direccion').value,
                    contacto:  document.getElementById('reg_contacto').value,
                    email:     document.getElementById('reg_email').value,
                    password:  document.getElementById('reg_password').value
                })
            }).then(r => r.json()).then(data => {
                if(data.status === 'success') {
                    alert(data.message);
                    window.location.href = 'login.html';
                } else {
                    alert('Error: ' + data.message);
                }
            }).catch(console.error);
        });
    }

});
