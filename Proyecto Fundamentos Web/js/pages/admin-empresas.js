document.addEventListener('DOMContentLoaded', () => {

    const userNameDisplay = document.getElementById('topbarUserName');
    if(userNameDisplay) userNameDisplay.innerText = localStorage.getItem('user_name') || 'Usuario de Sistema';

    const empresasTable = document.getElementById('empresasTableBody');
    if(empresasTable) {
        fetch('api/empresas.php').then(r=>r.json()).then(res => {
            if(res.status !== 'success') return;
            empresasTable.innerHTML = '';
            res.data.forEach(e => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${e.id}</td>
                    <td>${e.razon_social}</td>
                    <td>${e.rfc}</td>
                    <td>${e.direccion||'N/A'}</td>
                    <td>${e.contacto||'N/A'}</td>
                    <td><span class="badge" style="background:#E8F5E9;color:#2E7D32;padding:4px 8px;border-radius:4px;">${e.giro}</span></td>
                    <td>
                        <button class="btn btn-outline" title="Editar"
                            data-id="${e.id}" data-razon="${e.razon_social}" data-rfc="${e.rfc}" data-giro="${e.giro}" data-contacto="${e.contacto||''}" data-dir="${e.direccion||''}"
                            onclick="editarEmpresaBtn(this)"><i class="ph ph-pencil"></i></button>
                        <button class="btn btn-outline" style="color:#d32f2f" title="Eliminar"
                            data-id="${e.id}" onclick="borrarEmpresa(parseInt(this.dataset.id))"><i class="ph ph-trash"></i></button>
                    </td>
                `;
                empresasTable.appendChild(tr);
            });
            if(res.data.length === 0) empresasTable.innerHTML = '<tr><td colspan="7" style="text-align:center">No hay empresas registradas activas</td></tr>';
        });
    }

    const empresaForm = document.getElementById('empresaForm');
    if(empresaForm) {
        empresaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const payload = {
                razon_social: document.getElementById('em_razon').value,
                rfc:          document.getElementById('em_rfc').value,
                direccion:    document.getElementById('em_direccion').value,
                contacto:     document.getElementById('em_contacto').value,
                giro:         document.getElementById('em_giro').value
            };
            fetch('api/empresas.php', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
            .then(r=>r.json())
            .then(data => {
                if(data.status === 'success') { alert('¡Empresa registrada exitosamente!'); window.location.reload(); }
                else alert('Error: ' + data.message);
            })
            .catch(() => alert('Error conectando con el servidor'));
        });
    }

    const editEmpresaForm = document.getElementById('editEmpresaForm');
    if(editEmpresaForm) {
        editEmpresaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const p = {
                id:           document.getElementById('edit_em_id').value,
                razon_social: document.getElementById('edit_em_razon').value,
                rfc:          document.getElementById('edit_em_rfc').value,
                giro:         document.getElementById('edit_em_giro').value,
                contacto:     document.getElementById('edit_em_contacto').value,
                direccion:    document.getElementById('edit_em_direccion').value
            };
            fetch('api/empresas.php', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) })
            .then(r=>r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
        });
    }

});

window.editarEmpresaBtn = function(btn) {
    document.getElementById('edit_em_id').value       = btn.dataset.id;
    document.getElementById('edit_em_razon').value    = btn.dataset.razon;
    document.getElementById('edit_em_rfc').value      = btn.dataset.rfc;
    const giroSelect = document.getElementById('edit_em_giro');
    if(giroSelect) giroSelect.value = btn.dataset.giro;
    document.getElementById('edit_em_contacto').value = btn.dataset.contacto;
    document.getElementById('edit_em_direccion').value = btn.dataset.dir;
    const m = document.getElementById('editEmpresaModal');
    if(m) m.classList.add('active');
};
window.editarEmpresa = window.editarEmpresaBtn;

window.cerrarEditEmpresaModal = function() {
    const m = document.getElementById('editEmpresaModal');
    if(m) m.classList.remove('active');
};

window.borrarEmpresa = function(id) {
    if(!confirm('¿Seguro de eliminar esta empresa?')) return;
    fetch('api/empresas.php', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) })
    .then(r=>r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
};
