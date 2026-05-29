document.addEventListener('click', function(e) {
    const btn = e.target.closest('#menuToggle');
    if(!btn) return;
    const dashboardGrid = document.querySelector('.dashboard-grid');
    const sidebar = document.querySelector('.sidebar');
    if(!dashboardGrid || !sidebar) return;
    if(window.innerWidth <= 768) {
        sidebar.classList.toggle('active');
    } else {
        dashboardGrid.classList.toggle('collapsed');
    }
});
