document.addEventListener('DOMContentLoaded', () => {

    const userNameDisplay = document.getElementById('topbarUserName');
    if(userNameDisplay) userNameDisplay.innerText = localStorage.getItem('user_name') || 'Usuario de Sistema';

    const clientTable = document.getElementById('clientManifiestosTableBody');
    if(clientTable) {
        fetch(`api/manifiestos.php?rol_id=${localStorage.getItem('rol_id')}&empresa_id=${localStorage.getItem('empresa_id')}`)
        .then(r => r.json())
        .then(res => {
            if(res.status !== 'success') return;
            clientTable.innerHTML = '';
            res.data.forEach(m => {
                const badgeClass = m.estatus === 'Recibido' ? 'received' : m.estatus === 'Anulado' ? 'anulado' : 'transit';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${m.folio}</td>
                    <td>${m.fecha}</td>
                    <td>EcoTrack Centro</td>
                    <td>${m.materiales_estimado || 'N/A'}</td>
                    <td><span class="badge ${badgeClass}">${m.estatus}</span></td>
                    <td><button class="btn btn-outline" style="padding:0.3rem 0.8rem;font-size:0.85rem;" onclick="verManifiesto(${m.id})"><i class="ph ph-eye"></i></button></td>
                `;
                clientTable.appendChild(tr);
            });
            if(res.data.length === 0) clientTable.innerHTML = '<tr><td colspan="6" style="text-align:center">No tienes manifiestos registrados</td></tr>';
        });
    }

    const usuariosTable = document.getElementById('usuariosTableBody');
    if(usuariosTable) {
        fetch(`api/usuarios.php?rol_id=${localStorage.getItem('rol_id')}&empresa_id=${localStorage.getItem('empresa_id')}`)
        .then(r=>r.json()).then(res => {
            if(res.status !== 'success') return;
            usuariosTable.innerHTML = '';
            res.data.forEach(u => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${u.id}</td>
                    <td>${u.empresa || 'N/A'}</td>
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
            if(res.data.length === 0) usuariosTable.innerHTML = '<tr><td colspan="5" style="text-align:center">Sin empleados registrados</td></tr>';
        });
    }

    const usuarioForm = document.getElementById('usuarioForm');
    if(usuarioForm) {
        usuarioForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const p = {
                email:          document.getElementById('usu_email').value,
                password:       document.getElementById('usu_pass').value,
                rol_id:         3,
                empresa_id:     localStorage.getItem('empresa_id'),
                req_rol_id:     localStorage.getItem('rol_id'),
                req_empresa_id: localStorage.getItem('empresa_id')
            };
            fetch('api/usuarios.php', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) })
            .then(r=>r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
        });
    }

    const recoleccionForm = document.getElementById('recoleccionForm');
    if(recoleccionForm) {
        recoleccionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const p = {
                empresa_id: localStorage.getItem('empresa_id'),
                fecha_recoleccion: document.getElementById('rec_fecha').value,
                materiales: document.getElementById('rec_materiales').value,
                observaciones: document.getElementById('rec_observaciones').value
            };
            fetch('api/solicitudes.php', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) })
            .then(r => r.json())
            .then(d => {
                if(d.status === 'success') {
                    alert(d.message);
                    cerrarSolicitudModal();
                    recoleccionForm.reset();
                } else {
                    alert(d.message);
                }
            })
            .catch(() => alert('Error conectando con el servidor'));
        });
    }
});

if(typeof window.verManifiesto === 'undefined') {
    window.verManifiesto = function(id) {
        fetch(`api/manifiesto_detalle.php?id=${id}`)
        .then(r => r.json())
        .then(res => {
            if(res.status !== 'success') return alert('No se pudo cargar el manifiesto.');
            const d = res.data;
            const folio = '#' + d.folio;
            const setEl = (sel, val) => { const el = document.getElementById(sel); if(el) el.textContent = val || '—'; };
            setEl('modal_folio', 'Folio: ' + folio);
            setEl('m_razon', d.razon_social); setEl('m_rfc', d.rfc); setEl('m_giro', d.giro);
            setEl('m_contacto', d.contacto); setEl('m_direccion', d.direccion);
            setEl('m_modelo', d.modelo); setEl('m_placas', d.placas); setEl('m_chofer', d.chofer);
            setEl('m_cap', d.capacidad_carga_kg ? d.capacidad_carga_kg + ' kg' : '—');
            setEl('m_estatus', d.estatus); setEl('m_fecha', d.fecha); setEl('m_folio2', folio);
            const listaEl = document.getElementById('m_residuos_list');
            if(listaEl) {
                listaEl.innerHTML = (!d.residuos || !d.residuos.length)
                    ? '<div class="manifest-residuo-row"><span style="color:var(--text-light)">Sin residuos</span><span>—</span><span>—</span></div>'
                    : d.residuos.map(r => `<div class="manifest-residuo-row">
                        <span><strong>${r.nombre}</strong> <small>${r.codigo||''}</small></span>
                        <span>${r.peso_bruto_kg??'—'} kg</span>
                        <span><strong>${r.peso_neto_kg??'—'} kg</strong></span>
                      </div>`).join('');
            }
            const modal = document.getElementById('manifestModal');
            if(modal) modal.classList.add('active');
        }).catch(() => alert('Error al conectar con el servidor.'));
    };
    window.cerrarModal = function() {
        const m = document.getElementById('manifestModal');
        if(m) m.classList.remove('active');
    };
}

window.abrirSolicitudModal = function() {
    const modal = document.getElementById('recoleccionModal');
    if(modal) modal.classList.add('active');
};

window.cerrarSolicitudModal = function() {
    const modal = document.getElementById('recoleccionModal');
    if(modal) modal.classList.remove('active');
};
