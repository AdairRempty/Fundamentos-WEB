(function initNavbar() {
    const navbar = document.getElementById('navbar');
    if(!navbar) return;
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
})();

document.addEventListener('click', (e) => {
    if(!e.target.classList.contains('modal-overlay')) return;
    ['manifestModal','salidaModal','editVehiculoModal','editResiduoModal',
     'editUsuarioModal','editEmpresaModal','editManifiestoModal','recoleccionModal'].forEach(id => {
        const m = document.getElementById(id);
        if(m) m.classList.remove('active');
    });
});
