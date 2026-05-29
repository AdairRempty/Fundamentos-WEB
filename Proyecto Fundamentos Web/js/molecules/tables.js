document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', function(e) {
        if(e.target.tagName !== 'TH' || !e.target.closest('.data-table')) return;
        const headerCell  = e.target;
        const tableElement = headerCell.closest('table');
        const tbody = tableElement.querySelector('tbody');
        if(!tbody) return;
        const headerIndex = Array.from(headerCell.parentNode.children).indexOf(headerCell);
        const isAscending = headerCell.classList.contains('th-sort-asc');

        tableElement.querySelectorAll('th').forEach(th => th.classList.remove('th-sort-asc','th-sort-desc'));
        headerCell.classList.toggle('th-sort-asc', !isAscending);
        headerCell.classList.toggle('th-sort-desc', isAscending);

        const rows = Array.from(tbody.querySelectorAll('tr'));
        rows.sort((a, b) => {
            const aText = a.children[headerIndex]?.textContent.trim() || '';
            const bText = b.children[headerIndex]?.textContent.trim() || '';
            const aNum  = parseFloat(aText.replace(/[^0-9.-]+/g,''));
            const bNum  = parseFloat(bText.replace(/[^0-9.-]+/g,''));
            if(!isNaN(aNum) && !isNaN(bNum)) return isAscending ? aNum - bNum : bNum - aNum;
            return isAscending ? aText.localeCompare(bText) : bText.localeCompare(aText);
        });
        tbody.append(...rows);
    });
    document.querySelectorAll('.table-search').forEach(input => {
        const targetId = input.getAttribute('data-target');
        if(!targetId) return;
        const tbody = document.getElementById(targetId);
        if(!tbody) return;
        const tableElement = tbody.closest('table');
        if(!tableElement) return;

        const select = document.createElement('select');
        select.className = 'search-column-select';
        select.innerHTML = '<option value="all">Todas las columnas</option>';
        tableElement.querySelectorAll('thead th').forEach((th, index) => {
            const title = th.textContent.trim().replace(/[▲▼]/g,'');
            if(title && title !== 'Acciones') {
                const opt = document.createElement('option');
                opt.value = index;
                opt.textContent = title;
                select.appendChild(opt);
            }
        });
        const wrapper  = document.createElement('div');
        wrapper.className = 'table-search-wrapper';
        const inputWrap = document.createElement('div');
        inputWrap.className = 'search-input-wrap';
        const icon = document.createElement('i');
        icon.className = 'ph ph-magnifying-glass';

        input.style.maxWidth = '';
        input.placeholder = 'Buscar...';
        input.parentNode.insertBefore(wrapper, input);
        inputWrap.appendChild(icon);
        inputWrap.appendChild(input);
        wrapper.appendChild(select);
        wrapper.appendChild(inputWrap);
        const doSearch = () => {
            const filter   = input.value.toLowerCase();
            const colIndex = select.value;
            Array.from(tbody.getElementsByTagName('tr')).forEach(row => {
                if(!row.getElementsByTagName('td').length) return;
                let match = false;
                if(colIndex === 'all') {
                    match = row.textContent.toLowerCase().includes(filter);
                } else {
                    const cell = row.children[colIndex];
                    if(cell) match = cell.textContent.toLowerCase().includes(filter);
                }
                row.style.display = match ? '' : 'none';
            });
        };

        input.addEventListener('input', doSearch);
        select.addEventListener('change', doSearch);
    });

});
