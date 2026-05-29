document.addEventListener('DOMContentLoaded', () => {

    const userNameDisplay = document.getElementById('topbarUserName');
    if(userNameDisplay) userNameDisplay.innerText = localStorage.getItem('user_name') || 'Usuario de Sistema';

    const perfilForm = document.getElementById('perfilForm');
    if(!perfilForm) return;

    const pUid = localStorage.getItem('user_id');
    const pEid = localStorage.getItem('empresa_id');
    const rolID = localStorage.getItem('rol_id');

    if(pEid && pEid !== 'null' && pEid !== '0') {
        const empresaPanel = document.getElementById('empresaPanel');
        if(empresaPanel) empresaPanel.style.display = 'block';
    }

    if(rolID === '1') {
        document.querySelectorAll('.admin-link').forEach(el => el.style.display = 'flex');
    } else {
        document.querySelectorAll('.client-link').forEach(el => el.style.display = 'flex');
    }

    fetch(`api/perfil.php?user_id=${pUid}`)
    .then(r => r.json())
    .then(res => {
        if(res.status !== 'success') return;
        const nombreField = document.getElementById('pf_nombre');
        if(nombreField) nombreField.value = res.data.nombre || '';
        document.getElementById('pf_email').value = res.data.email || '';
        if(res.data.empresa_id) {
            const setV = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };
            setV('pf_razon',     res.data.razon_social);
            setV('pf_rfc',      res.data.rfc);
            setV('pf_contacto', res.data.contacto);
            setV('pf_giro',     res.data.giro);
            setV('pf_direccion',res.data.direccion);
        }
    });

    perfilForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass     = document.getElementById('pf_password').value;
        const passConf = document.getElementById('pf_password_conf') ? document.getElementById('pf_password_conf').value : '';
        if(pass !== '' && pass !== passConf) return alert('Las contraseñas no coinciden. Por favor repítala correctamente.');

        const getV = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
        const payload = {
            user_id:     pUid,
            empresa_id:  pEid,
            nombre:      getV('pf_nombre'),
            email:       getV('pf_email'),
            password:    pass,
            razon_social: getV('pf_razon'),
            rfc:         getV('pf_rfc'),
            contacto:    getV('pf_contacto'),
            giro:        getV('pf_giro'),
            direccion:   getV('pf_direccion')
        };

        fetch('api/perfil.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
        }).then(r => r.json()).then(d => {
            alert(d.message);
            if(d.status === 'success') {
                localStorage.setItem('user_name', payload.nombre);
                const tnDisplay = document.getElementById('topbarUserName');
                if(tnDisplay) tnDisplay.innerText = payload.nombre;
                document.getElementById('pf_password').value = '';
                if(document.getElementById('pf_password_conf')) document.getElementById('pf_password_conf').value = '';
            }
        }).catch(() => alert('Ocurrió un error al intentar comunicarse con el servidor remoto.'));
    });

});
