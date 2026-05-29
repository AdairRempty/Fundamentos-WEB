class EcotrackSidebar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        let role = this.getAttribute('role');
        if(!role) {
            const locRole = localStorage.getItem('rol_id');
            role = locRole == '1' ? 'admin' : 'client';
        }

        const activePage = this.getAttribute('active-page') || '';
        
        const adminLinks = `
            <a href="admin_dashboard.html" class="sidebar-item ${activePage === 'manifiestos' ? 'active' : ''}"><i class="ph ph-files"></i> Manifiestos</a>
            <a href="bitacora.html" class="sidebar-item ${activePage === 'bitacora' ? 'active' : ''}"><i class="ph ph-book-open"></i> Bitácora</a>
            <a href="directorio_empresas.html" class="sidebar-item ${activePage === 'empresas' ? 'active' : ''}"><i class="ph ph-buildings"></i> Catálogo Empresas</a>
            <a href="admin_vehiculos.html" class="sidebar-item ${activePage === 'vehiculos' ? 'active' : ''}"><i class="ph ph-truck"></i> Vehículos</a>
            <a href="admin_residuos.html" class="sidebar-item ${activePage === 'residuos' ? 'active' : ''}"><i class="ph ph-list-dashes"></i> Residuos</a>
            <a href="admin_usuarios.html" class="sidebar-item ${activePage === 'usuarios' ? 'active' : ''}"><i class="ph ph-users"></i> Usuarios</a>
            <a href="perfil.html" class="sidebar-item ${activePage === 'perfil' ? 'active' : ''}" style="margin-top: auto;"><i class="ph ph-gear"></i> Configuración</a>
        `;

        const clientLinks = `
            <a href="client_dashboard.html" class="sidebar-item ${activePage === 'manifiestos' ? 'active' : ''}"><i class="ph ph-folder"></i> Mis Manifiestos</a>
            <a href="client_usuarios.html" class="sidebar-item ${activePage === 'usuarios' ? 'active' : ''}"><i class="ph ph-users"></i> Mis Empleados</a>
            <a href="perfil.html" class="sidebar-item ${activePage === 'perfil' ? 'active' : ''}" style="margin-top: auto;"><i class="ph ph-user"></i> Mi perfil</a>
        `;

        this.innerHTML = `
        <aside class="sidebar glass-panel" style="border-radius: 0; min-height: 100vh;">
            <div class="nav-brand" style="margin-bottom: 2rem;">
                <i class="ph-fill ph-leaf"></i> EcoTrack
            </div>
            ${role === 'admin' ? adminLinks : clientLinks}
        </aside>
        `;
    }
}

customElements.define('ecotrack-sidebar', EcotrackSidebar);
