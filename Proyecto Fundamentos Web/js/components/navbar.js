class EcotrackNavbar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <nav class="navbar" id="navbar">
                <div class="nav-brand">
                    <i class="ph-fill ph-leaf"></i> <a href="index.html">EcoTrack</a>
                </div>
                <div class="nav-links">
                    <a href="index.html">Inicio</a>
                    <a href="contacto.html">Contacto</a>
                    <a href="login.html" class="btn btn-primary" style="color: white;"><i class="ph ph-sign-in"></i> Acceder</a>
                </div>
            </nav>
        `;

        const navbar = this.querySelector('#navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }
    }
}

customElements.define('ecotrack-navbar', EcotrackNavbar);
