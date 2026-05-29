class EcotrackTopbar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const title = this.getAttribute('title') || 'Panel de Control';
        
        this.innerHTML = `
            <div class="topbar">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <button id="menuToggle" class="menu-toggle"><i class="ph ph-list"></i></button>
                    <h2>${title}</h2>
                </div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span id="topbarUserName">Usuario</span>
                    <a href="index.html" class="btn btn-outline" style="padding: 0.5rem 1rem;" onclick="localStorage.clear()">Cerrar Sesión</a>
                </div>
            </div>
        `;

        const userNameDisplay = this.querySelector('#topbarUserName');
        if(userNameDisplay) {
            userNameDisplay.innerText = localStorage.getItem('user_name') || 'Usuario de Sistema';
        }
    }
}

customElements.define('ecotrack-topbar', EcotrackTopbar);




