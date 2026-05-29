document.addEventListener('DOMContentLoaded', () => {
    const userNameDisplay = document.getElementById('topbarUserName');
    if(userNameDisplay) userNameDisplay.innerText = localStorage.getItem('user_name') || 'Usuario de Sistema';

    const adminTable = document.getElementById('manifiestosTableBody');
    if(adminTable) {
        fetch(`api/manifiestos.php?rol_id=${localStorage.getItem('rol_id')}&empresa_id=${localStorage.getItem('empresa_id')}`)
        .then(r => r.json())
        .then(res => {
            if(res.status !== 'success') return;
            adminTable.innerHTML = '';
            res.data.forEach(m => {
                const badgeClass = m.estatus === 'Recibido' ? 'received' : m.estatus === 'Anulado' ? 'anulado' : 'transit';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${m.folio}</td>
                    <td>${m.fecha}</td>
                    <td>${m.empresa}</td>
                    <td>${m.modelo} (${m.placas})</td>
                    <td><span class="badge ${badgeClass}">${m.estatus}</span></td>
                    <td>
                        <button class="btn btn-outline" title="Ver Detalle" onclick="verManifiesto(${m.id})"><i class="ph ph-eye"></i></button>
                        <button class="btn btn-outline" title="Editar" onclick="editarManifiesto(${m.id},'${m.folio}','${m.fecha}','${m.estatus}',${m.vehiculo_id})"><i class="ph ph-pencil"></i></button>
                        <button class="btn btn-outline" style="color:#d32f2f" title="Anular" onclick="anularManifiesto(${m.id})"><i class="ph ph-x-circle"></i></button>
                    </td>
                `;
                adminTable.appendChild(tr);
            });
            if(res.data.length === 0) adminTable.innerHTML = '<tr><td colspan="6" style="text-align:center">No hay manifiestos registrados</td></tr>';
        });
    }

    const manifiestoForm = document.getElementById('manifiestoForm');
    if(manifiestoForm) {
        const empresaSelect = document.getElementById('empresa_id');
        const vehiculoSelect = document.getElementById('vehiculo_id');
        const residuoSelect  = document.getElementById('residuo_id');

        window.residuosOptionsCache = '<option value="">Seleccionar...</option>';

        if(empresaSelect) fetch('api/catalogos.php?type=empresas').then(r=>r.json()).then(r => {
            if(r.status === 'success') {
                empresaSelect.innerHTML = '<option value="">-- Seleccionar Empresa --</option>';
                r.data.forEach(e => empresaSelect.innerHTML += `<option value="${e.id}">${e.razon_social} (RFC: ${e.rfc})</option>`);
            }
        });

        if(vehiculoSelect) fetch('api/catalogos.php?type=vehiculos').then(r=>r.json()).then(r => {
            if(r.status === 'success') {
                vehiculoSelect.innerHTML = '<option value="">-- Seleccionar Vehículo --</option>';
                r.data.forEach(v => vehiculoSelect.innerHTML += `<option value="${v.id}" data-chofer="${v.chofer}">${v.modelo} (Placas: ${v.placas})</option>`);
            }
            vehiculoSelect.addEventListener('change', (e) => {
                const opt = e.target.options[e.target.selectedIndex];
                const choferEl = document.getElementById('chofer');
                if(choferEl) choferEl.value = opt ? (opt.dataset.chofer || '') : '';
            });
        });

        fetch('api/catalogos.php?type=residuos').then(r=>r.json()).then(r => {
            if(r.status === 'success') {
                r.data.forEach(item => window.residuosOptionsCache += `<option value="${item.id}">${item.nombre}</option>`);
                if(residuoSelect) residuoSelect.innerHTML = window.residuosOptionsCache;
            }
        });

        manifiestoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const tbody = document.getElementById('residuosTableBody') || document.querySelector('.table-secondary tbody');
            const rows = tbody.querySelectorAll('tr');
            const residuosArr = [];
            
            rows.forEach(row => {
                const selResiduo = row.querySelector('.residuo-select');
                const inBruto = row.querySelector('.peso-bruto-input');
                const inNeto = row.querySelector('.peso-neto-input');
                if (selResiduo && selResiduo.value && inNeto && inNeto.value) {
                    residuosArr.push({
                        id: selResiduo.value,
                        peso_bruto: inBruto ? (inBruto.value || 0) : 0,
                        peso_neto: inNeto.value
                    });
                }
            });

            if (residuosArr.length === 0 && document.getElementById('residuo_id')) {
                const oldResId = document.getElementById('residuo_id').value;
                const oldNeto = document.getElementById('peso_neto') ? document.getElementById('peso_neto').value : null;
                if (oldResId && oldNeto) {
                    residuosArr.push({
                        id: oldResId,
                        peso_bruto: document.getElementById('peso_bruto') ? (document.getElementById('peso_bruto').value || 0) : 0,
                        peso_neto: oldNeto
                    });
                }
            }

            const payload = {
                empresa_id:  document.getElementById('empresa_id').value,
                fecha:       document.getElementById('fecha').value,
                folio: document.getElementById('folio').value,
                vehiculo_id: document.getElementById('vehiculo_id').value,
                estatus:     document.getElementById('estatus').value,
                observaciones: document.getElementById('observaciones') ? document.getElementById('observaciones').value : '',
                residuos: residuosArr
            };
            fetch('api/manifiestos.php', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
            .then(r => r.json())
            .then(data => {
                if(data.status === 'success') {
                    alert('¡Manifiesto registrado y anexado a la bitácora exitosamente!');
                    window.location.href = 'admin_dashboard.html';
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(() => alert('Error conectando con el servidor'));
        });
    }

    const editManifiestoForm = document.getElementById('editManifiestoForm');
    if(editManifiestoForm) {
        editManifiestoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const p = {
                id:          document.getElementById('edit_man_id').value,
                folio: document.getElementById('edit_man_folio').value,
                fecha:       document.getElementById('edit_man_fecha').value,
                estatus:     document.getElementById('edit_man_estatus').value,
                vehiculo_id: document.getElementById('edit_man_vehiculo').value
            };
            fetch('api/manifiestos.php', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) })
            .then(r => r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
        });
    }

});

window.editarManifiesto = function(id, folio, fecha, estatus, vehiculo_id) {
    document.getElementById('edit_man_id').value    = id;
    document.getElementById('edit_man_folio').value = folio;
    document.getElementById('edit_man_fecha').value = fecha;
    document.getElementById('edit_man_estatus').value = estatus;
    const vehSelect = document.getElementById('edit_man_vehiculo');
    if(vehSelect) {
        vehSelect.innerHTML = '<option>Cargando...</option>';
        fetch('api/catalogos.php?type=vehiculos').then(r=>r.json()).then(res => {
            if(res.status === 'success') {
                vehSelect.innerHTML = '';
                res.data.forEach(v => vehSelect.innerHTML += `<option value="${v.id}" ${v.id==vehiculo_id?'selected':''}>${v.modelo} (${v.placas})</option>`);
            }
        });
    }
    const modal = document.getElementById('editManifiestoModal');
    if(modal) modal.classList.add('active');
};

window.cerrarEditManifiestoModal = function() {
    const m = document.getElementById('editManifiestoModal');
    if(m) m.classList.remove('active');
};

window.anularManifiesto = function(id) {
    if(!confirm('¿Está seguro de Anular este Manifiesto? Esta acción cambiará su estatus a Anulado.')) return;
    fetch('api/manifiestos.php', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) })
    .then(r => r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
};

window.verManifiesto = function(id) {
    fetch(`api/manifiesto_detalle.php?id=${id}`)
    .then(r => r.json())
    .then(res => {
        if(res.status !== 'success') return alert('No se pudo cargar el manifiesto.');
        const d = res.data;
        const folio = '#' + d.folio;
        const setEl = (sel, val) => { const el = document.getElementById(sel); if(el) el.textContent = val || '—'; };
        setEl('modal_folio', 'Folio: ' + folio);
        setEl('m_razon',    d.razon_social);
        setEl('m_rfc',      d.rfc);
        setEl('m_giro',     d.giro);
        setEl('m_contacto', d.contacto);
        setEl('m_direccion',d.direccion);
        setEl('m_modelo',   d.modelo);
        setEl('m_placas',   d.placas);
        setEl('m_chofer',   d.chofer);
        setEl('m_cap',      d.capacidad_carga_kg ? d.capacidad_carga_kg + ' kg' : '—');
        setEl('m_estatus',  d.estatus);
        setEl('m_fecha',    d.fecha);
        setEl('m_folio2',   folio);
        const listaEl = document.getElementById('m_residuos_list');
        if(listaEl) {
            listaEl.innerHTML = (!d.residuos || !d.residuos.length)
                                ? '<div class="manifest-residuo-row"><span style="color:var(--text-light)">Sin residuos</span><span>—</span><span>—</span></div>'
                                : d.residuos.map(r => `<div class="manifest-residuo-row">
                    <span><strong>${r.nombre}</strong> <small style="color:var(--text-light)">${r.codigo||''}</small></span>
                    <span>${r.peso_bruto_kg??'—'} kg</span>
                    <span><strong>${r.peso_neto_kg??'—'} kg</strong></span>
                  </div>`).join('');
        }
                const modal = document.getElementById('manifestModal');
        if(modal) modal.classList.add('active');
    })
    .catch(() => alert('Error al conectar con el servidor.'));
};

window.cerrarModal = function() {
    const m = document.getElementById('manifestModal');
    if(m) m.classList.remove('active');
};

window.agregarResiduo = function() {
    const tbody = document.getElementById('residuosTableBody') || document.querySelector('.table-secondary tbody');
    if (!tbody) return;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            <select class="form-control residuo-select" required>
                ${window.residuosOptionsCache || '<option value="">Seleccionar...</option>'}
            </select>
        </td>
        <td>
            <select class="form-control" required>
                <option value="">Seleccionar...</option>
                <option value="Pacas">Pacas</option>
                <option value="Tambos">Tambos (200L)</option>
                <option value="Granel">A granel</option>
            </select>
        </td>
        <td><input type="number" step="0.01" class="form-control peso-bruto-input" placeholder="0.00"></td>
        <td><input type="number" step="0.01" class="form-control peso-neto-input" placeholder="0.00" required></td>
        <td style="text-align:center;"><button type="button" class="btn btn-outline" style="color:var(--danger); padding:0.4rem; height:auto; width:auto;" onclick="this.closest('tr').remove()"><i class="ph-bold ph-trash"></i></button></td>
    `;
    tbody.appendChild(tr);
};
