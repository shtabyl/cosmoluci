const searchField = document.querySelector('#js-search-field');
const clearSearchFieldBtn = document.querySelector('#js-clear-search');

function filterArticles(query) {
    const rows = document.querySelectorAll('.js-admin-row');

    rows.forEach(row => {
        const title = row.querySelector('.admin-artwork__title')?.textContent?.toLowerCase().trim() || '';

        if (title.includes(query)) {
            row.hidden = false;
        } else {
            row.hidden = true;
        }
    });
}


searchField.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (e.target.value.length > 0) {
        clearSearchFieldBtn.hidden = false;
    } else {
        clearSearchFieldBtn.hidden = true;
    }

    filterArticles(query);
    
});

clearSearchFieldBtn.addEventListener('click', (e) => {
    searchField.value = '';
    clearSearchFieldBtn.hidden = true;
    filterArticles('');

});