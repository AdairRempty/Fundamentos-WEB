document.addEventListener('DOMContentLoaded', () => {

    const userNameDisplay = document.getElementById('topbarUserName');
    if(userNameDisplay) userNameDisplay.innerText = localStorage.getItem('user_name') || 'Usuario de Sistema';

    const residuosTable = document.getElementById('residuosTableBody');
    if(residuosTable) {
        fetch('api/residuos.php').then(r=>r.json()).then(res => {
            if(res.status !== 'success') return;
            residuosTable.innerHTML = '';
            res.data.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${r.id}</td>
                    <td>${r.codigo}</td>
                    <td>${r.nombre}</td>
                    <td>$${r.precio_compra_kg}</td>
                    <td>${r.descripcion||'N/A'}</td>
                    <td>
                        <button class="btn btn-outline" title="Editar"
                            data-id="${r.id}" data-nombre="${r.nombre}" data-codigo="${r.codigo}" data-precio="${r.precio_compra_kg}" data-desc="${r.descripcion||''}"
                            onclick="editarResiduoBtn(this)"><i class="ph ph-pencil"></i></button>
                        <button class="btn btn-outline" style="color:#d32f2f" title="Eliminar"
                            data-id="${r.id}" onclick="borrarResiduo(parseInt(this.dataset.id))"><i class="ph ph-trash"></i></button>
                    </td>
                `;
                residuosTable.appendChild(tr);
            });
            if(res.data.length === 0) residuosTable.innerHTML = '<tr><td colspan="6" style="text-align:center">Sin registros activos</td></tr>';
        });
    }

    const residuoForm = document.getElementById('residuoForm');
    if(residuoForm) {
        residuoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const p = {
                nombre:          document.getElementById('res_nombre').value,
                codigo:          document.getElementById('res_codigo').value,
                precio_compra_kg: document.getElementById('res_precio').value,
                descripcion:     document.getElementById('res_desc').value
            };
            fetch('api/residuos.php', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) })
            .then(r=>r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
        });
    }

    const editResiduoForm = document.getElementById('editResiduoForm');
    if(editResiduoForm) {
        editResiduoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const p = {
                id:              document.getElementById('edit_res_id').value,
                nombre:          document.getElementById('edit_res_nombre').value,
                codigo:          document.getElementById('edit_res_codigo').value,
                precio_compra_kg: document.getElementById('edit_res_precio').value,
                descripcion:     document.getElementById('edit_res_desc').value
            };
            fetch('api/residuos.php', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(p) })
            .then(r=>r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
        });
    }

});

window.editarResiduoBtn = function(btn) {
    document.getElementById('edit_res_id').value     = btn.dataset.id;
    document.getElementById('edit_res_nombre').value = btn.dataset.nombre;
    document.getElementById('edit_res_codigo').value = btn.dataset.codigo;
    document.getElementById('edit_res_precio').value = btn.dataset.precio;
    document.getElementById('edit_res_desc').value   = btn.dataset.desc;
    const m = document.getElementById('editResiduoModal');
    if(m) m.classList.add('active');
};
window.editarResiduo = window.editarResiduoBtn;

window.cerrarEditResiduoModal = function() {
    const m = document.getElementById('editResiduoModal');
    if(m) m.classList.remove('active');
};

window.borrarResiduo = function(id) {
    if(!confirm('¿Seguro de eliminar este residuo?')) return;
    fetch('api/residuos.php', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) })
    .then(r=>r.json()).then(d => { if(d.status==='success'){ alert(d.message); window.location.reload(); } else alert(d.message); });
};
