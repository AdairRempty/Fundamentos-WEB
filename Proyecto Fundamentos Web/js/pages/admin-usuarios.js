document.addEventListener('DOMContentLoaded', () => {

    const userNameDisplay = document.getElementById('topbarUserName');
    if(userNameDisplay) userNameDisplay.innerText = localStorage.getItem('user_name') || 'Usuario de Sistema';

    const usuariosTable = document.getElementById('usuariosTableBody');
    if(usuariosTable) {
        fetch(`api/usuarios.php?rol_id=${localStorage.getItem('rol_id')}&empresa_id=${localStorage.getItem('empresa_id')}`)
        .then(r=>r.json()).then(res => {
            if(res.status !== 'success') return;
            usuariosTable.innerHTML = '';
            res.data.forEach(u => {
                const eName = u.empresa || 'EcoTrack Central';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.id}</td>
                    <td>${eName}</td>
                    <td>${u.email}</td>
                    <td><span class="badge" style="background:#E3F2FD;color:#1565C0;padding:4px 8px;border-radius:4px;">${u.rol}</span></td>
                    <td>
                        <button class="btn btn-outline" title="Editar"
                            data-id="${u.id}" data-email="${u.email}" data-rol="${u.rol_id}"
                            onclick="editarUsuarioBtn(this)"><i class="ph ph-pencil"></i></button>
                        <button class="btn btn-outline" style="color:#d32f2f" title="Eliminar"
                            data-id="${u.id}" onclick="borrarUsuario(parseInt(this.dataset.id))"><i class="ph ph-trash"></i></button>
                    </td>
                `;
                usuariosTable.appendChild(tr);
            });
            if(res.data.length === 0) usuariosTable.innerHTML = '<tr><td colspan="5" style="text-align:center">Sin registros activos</td></tr>';
        });
    }

    const usuarioForm = document.getElementById('usuarioForm');
    if(usuarioForm) {
        usuarioForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const p = {
                email:       document.getElementById('usu_email').value,
                password:    document.getElementById('usu_pass').value,
                rol_id:      document.getElementById('usu_rol')     ? document.getElementById('usu_rol').value     : 3,
                empresa_id:  document.getElementById('usu_empresa') ? document.getElementById('usu_empresa').value : localStorage.getItem('empresa_id'),
                req_rol_id:     localStorage.getItem('rol_id'),
                req_empresa_id: localStorage.getItem('empresa_id')
            };
            fetch('api/usuarios.php', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) })
            .then(r=>r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
        });
    }

    const editUsuarioForm = document.getElementById('editUsuarioForm');
    if(editUsuarioForm) {
        editUsuarioForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const p = {
                id:      document.getElementById('edit_usu_id').value,
                email:   document.getElementById('edit_usu_email').value,
                password: document.getElementById('edit_usu_pass').value,
                rol_id:  document.getElementById('edit_usu_rol').value
            };
            fetch('api/usuarios.php', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) })
            .then(r=>r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
        });
    }

});

window.editarUsuarioBtn = function(btn) {
    document.getElementById('edit_usu_id').value    = btn.dataset.id;
    document.getElementById('edit_usu_email').value = btn.dataset.email;
    document.getElementById('edit_usu_pass').value  = '';
    const rolSelect = document.getElementById('edit_usu_rol');
    if(rolSelect) rolSelect.value = btn.dataset.rol;
    const m = document.getElementById('editUsuarioModal');
    if(m) m.classList.add('active');
};
window.editarUsuario = window.editarUsuarioBtn;

window.cerrarEditUsuarioModal = function() {
    const m = document.getElementById('editUsuarioModal');
    if(m) m.classList.remove('active');
};

window.borrarUsuario = function(id) {
    if(!confirm('¿Seguro de revocar el acceso a este usuario?')) return;
    fetch('api/usuarios.php', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) })
    .then(r=>r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
};
