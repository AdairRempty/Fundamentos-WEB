document.addEventListener('DOMContentLoaded', () => {

    const userNameDisplay = document.getElementById('topbarUserName');
    if(userNameDisplay) userNameDisplay.innerText = localStorage.getItem('user_name') || 'Usuario de Sistema';

    const vehiculosTable = document.getElementById('vehiculosTableBody');
    if(vehiculosTable) {
        fetch('api/vehiculos.php').then(r=>r.json()).then(res => {
            if(res.status !== 'success') return;
            vehiculosTable.innerHTML = '';
            res.data.forEach(v => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${v.id}</td>
                    <td>${v.placas}</td>
                    <td>${v.modelo||'N/A'}</td>
                    <td>${v.capacidad_carga_kg}</td>
                    <td>${v.chofer||'Sin asignar'}</td>
                    <td>
                        <button class="btn btn-outline" title="Editar"
                            data-id="${v.id}" data-placas="${v.placas}" data-modelo="${v.modelo||''}" data-cap="${v.capacidad_carga_kg}" data-chofer="${v.chofer||''}"
                            onclick="editarVehiculoBtn(this)"><i class="ph ph-pencil"></i></button>
                        <button class="btn btn-outline" style="color:#d32f2f" title="Eliminar"
                            data-id="${v.id}" onclick="borrarVehiculo(parseInt(this.dataset.id))"><i class="ph ph-trash"></i></button>
                    </td>
                `;
                vehiculosTable.appendChild(tr);
            });
            if(res.data.length === 0) vehiculosTable.innerHTML = '<tr><td colspan="6" style="text-align:center">Sin registros activos</td></tr>';
        });
    }

    const vehiculoForm = document.getElementById('vehiculoForm');
    if(vehiculoForm) {
        vehiculoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const p = {
                placas:           document.getElementById('veh_placas').value,
                chofer:           document.getElementById('veh_chofer').value,
                modelo:           document.getElementById('veh_modelo').value,
                capacidad_carga_kg: document.getElementById('veh_cap').value
            };
            fetch('api/vehiculos.php', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) })
            .then(r=>r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
        });
    }

    const editVehiculoForm = document.getElementById('editVehiculoForm');
    if(editVehiculoForm) {
        editVehiculoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const p = {
                id:               document.getElementById('edit_veh_id').value,
                placas:           document.getElementById('edit_veh_placas').value,
                chofer:           document.getElementById('edit_veh_chofer').value,
                modelo:           document.getElementById('edit_veh_modelo').value,
                capacidad_carga_kg: document.getElementById('edit_veh_cap').value
            };
            fetch('api/vehiculos.php', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) })
            .then(r=>r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
        });
    }

});

window.editarVehiculoBtn = function(btn) {
    document.getElementById('edit_veh_id').value     = btn.dataset.id;
    document.getElementById('edit_veh_placas').value = btn.dataset.placas;
    document.getElementById('edit_veh_modelo').value = btn.dataset.modelo;
    document.getElementById('edit_veh_cap').value    = btn.dataset.cap;
    document.getElementById('edit_veh_chofer').value = btn.dataset.chofer;
    document.getElementById('editVehiculoModal').classList.add('active');
};
window.editarVehiculo = window.editarVehiculoBtn;

window.cerrarEditVehiculoModal = function() {
    const m = document.getElementById('editVehiculoModal');
    if(m) m.classList.remove('active');
};

window.borrarVehiculo = function(id) {
    if(!confirm('¿Seguro de eliminar este vehículo?')) return;
    fetch('api/vehiculos.php', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) })
    .then(r=>r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
};
