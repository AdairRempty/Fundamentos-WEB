const _entradasMap  = new Map();
const _seleccionadas = new Set();

function _refreshBtnSalida() {
    const btn = document.getElementById('btnGenerarSalida');
    if(!btn) return;
    if(_seleccionadas.size > 0) {
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
        btn.innerHTML = `<i class="ph ph-arrow-up-right"></i> Generar Salida (${_seleccionadas.size} seleccionada${_seleccionadas.size > 1 ? 's' : ''})`;
    } else {
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
        btn.innerHTML = `<i class="ph ph-arrow-up-right"></i> Generar Salida del Movimiento Seleccionado`;
    }
}

document.addEventListener('click', function(ev) {
    const row = ev.target.closest('tr.entrada-row');
    if(!row) return;
    const entryId = row.dataset.entryId;
    if(!entryId) return;
    if(_seleccionadas.has(entryId)) {
        _seleccionadas.delete(entryId);
        row.classList.remove('selected-row');
    } else {
        _seleccionadas.add(entryId);
        row.classList.add('selected-row');
    }
    _refreshBtnSalida();
});

window.buscarEntradas = function() {
    const fecha    = document.getElementById('filtro_fecha')?.value || '';
    const empresa  = document.getElementById('filtro_empresa')?.value || '';
    const material = document.getElementById('filtro_material')?.value || '';
    const params   = new URLSearchParams({ tipo: 'entradas', fecha, empresa, material });

    fetch(`api/bitacora.php?${params.toString()}`)
    .then(r => r.json())
    .then(res => {
        const panel = document.getElementById('entradasResultPanel');
        const tbody = document.getElementById('entradasTableBody');
        if(!panel || !tbody) return;

        _entradasMap.clear();
        _seleccionadas.clear();
        _refreshBtnSalida();
        panel.style.display = 'block';

        if(res.status !== 'success' || res.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-light)">No se encontraron entradas con esos filtros.</td></tr>';
            return;
        }

        res.data.forEach(e => _entradasMap.set(String(e.id), e));
        tbody.innerHTML = res.data.map(e => `
            <tr class="entrada-row" data-entry-id="${e.id}" title="Clic para seleccionar / deseleccionar">
                <td>${e.fecha_movimiento?.split(' ')[0] || '—'}</td>
                <td>${e.empresa || 'N/A'}</td>
                <td><strong>${e.residuo}</strong></td>
                <td><small>${e.codigo || '—'}</small></td>
                <td>${e.cantidad_kg} kg</td>
                <td>${e.folio ? '#'+e.folio : '—'}</td>
            </tr>
        `).join('');
    })
    .catch(() => alert('Error al buscar entradas en el servidor.'));
};

window.abrirModalSalida = function() {
    if(_seleccionadas.size === 0) return;
    const items   = [..._seleccionadas].map(id => _entradasMap.get(id));
    const folios  = [...new Set(items.map(e => e.folio ? '#'+e.folio : 'Sin folio'))].join(', ');
    const totalKg = items.reduce((s,e) => s + parseFloat(e.cantidad_kg || 0), 0);
    const setEl   = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val || '—'; };
    setEl('salida_desc',        'Folios: ' + folios);
    setEl('s_residuo',          items.map(e => e.residuo).join(' / '));
    setEl('s_codigo',           items.map(e => e.codigo || '—').join(' / '));
    setEl('s_empresa',          [...new Set(items.map(e => e.empresa || 'N/A'))].join(', '));
    setEl('s_cantidad_entrada', totalKg.toFixed(2) + ' kg (total seleccionado)');
    const cantEl = document.getElementById('s_cantidad_salida');
    if(cantEl) cantEl.value = totalKg.toFixed(2);
    const fechaEl = document.getElementById('s_fecha_salida');
    if(fechaEl) fechaEl.value = new Date().toISOString().split('T')[0];
    document.getElementById('salidaModal').classList.add('active');
};

window.cerrarModalSalida = function() {
    const m = document.getElementById('salidaModal');
    if(m) m.classList.remove('active');
};

function _reloadBitacoraTable() {
    const bitacoraTable = document.getElementById('bitacoraTableBody');
    if(!bitacoraTable) return;
    bitacoraTable.innerHTML = '<tr><td colspan="6" style="text-align:center">Actualizando...</td></tr>';
    _loadBitacoraRows(bitacoraTable);
}

function _loadBitacoraRows(bitacoraTable) {
    fetch('api/bitacora.php').then(r => r.json()).then(res => {
        if(res.status !== 'success') return;
        bitacoraTable.innerHTML = '';
        res.data.forEach(b => {
            const badgeClass = b.tipo_movimiento === 'Entrada' ? 'entrada' : 'salida';
            const icon = b.tipo_movimiento === 'Entrada' ? 'ph-arrow-down-left' : 'ph-arrow-up-right';
            const folio = b.folio ? `#${b.folio}` : 'N/A';
            bitacoraTable.innerHTML += `
                <tr>
                    <td>${b.fecha_movimiento.split(' ')[0]}</td>
                    <td><span class="badge ${badgeClass}"><i class="ph ${icon}"></i> ${b.tipo_movimiento}</span></td>
                    <td>${b.residuo}</td>
                    <td>${b.cantidad_kg}</td>
                    <td>${b.origen_destino}</td>
                    <td>${folio}</td>
                </tr>
            `;
        });
        if(res.data.length === 0) bitacoraTable.innerHTML = '<tr><td colspan="6" style="text-align:center">No hay movimientos registrados</td></tr>';
    });
}

window.confirmarSalida = function() {
    if(_seleccionadas.size === 0) return;
    const cantidad = parseFloat(document.getElementById('s_cantidad_salida')?.value);
    const destino  = document.getElementById('s_destino')?.value?.trim();
    const obs      = document.getElementById('s_observaciones')?.value?.trim();
    const fecha    = document.getElementById('s_fecha_salida')?.value;
    if(!fecha)              return alert('Por favor selecciona la fecha de salida.');
    if(!cantidad || cantidad <= 0) return alert('Por favor ingresa una cantidad válida.');
    if(!destino)            return alert('Por favor indica el destino final de la salida.');

    const items = [..._seleccionadas].map(id => _entradasMap.get(id));
    const requests = items.map(e => fetch('api/bitacora.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            residuo_id:    e.residuo_id,
            cantidad_kg:   parseFloat((cantidad / items.length).toFixed(2)),
            destino,
            fecha_salida:  fecha,
            manifiesto_id: e.manifiesto_id || null,
            observaciones: obs || 'Salida generada desde Bitácora'
        })
    }).then(r => r.json()));

    Promise.all(requests).then(results => {
        const allOk = results.every(d => d.status === 'success');
        alert(allOk ? `${items.length} movimiento(s) de Salida registrado(s) correctamente.` : `Algunos movimientos fallaron. Verifica la bitácora.`);
        cerrarModalSalida();
        _seleccionadas.clear();
        _entradasMap.clear();
        _refreshBtnSalida();
        document.querySelectorAll('.entrada-row').forEach(r => r.classList.remove('selected-row'));
        _reloadBitacoraTable();
    }).catch(() => alert('Error al registrar las salidas.'));
};

document.addEventListener('DOMContentLoaded', () => {
    const userNameDisplay = document.getElementById('topbarUserName');
    if(userNameDisplay) userNameDisplay.innerText = localStorage.getItem('user_name') || 'Usuario de Sistema';

    const bitacoraTable = document.getElementById('bitacoraTableBody');
    if(bitacoraTable) _loadBitacoraRows(bitacoraTable);
});
