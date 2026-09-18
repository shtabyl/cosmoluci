const filterBtns = document.querySelectorAll('.filter-button');
const yearFilter = document.querySelector('#year-filter');

let fadeTimer = null;

const showFilteredImages = (type, year) => {
    const cards = [...document.querySelectorAll('.gallery__picture-link')];

    const matchingCards = cards.filter(card => {
        const isTypeMatch = type === 'all' || type === card.dataset.type;
        const isYearMatch = year === 'all' || year === card.dataset.year;
        return isTypeMatch && isYearMatch;
    });

    clearTimeout(fadeTimer);
    cards.forEach(card => card.classList.add('is-fading'));

    fadeTimer = setTimeout(() => {
        cards.forEach(card => {
            card.style.display = matchingCards.includes(card) ? '' : 'none';
        });

        void document.body.offsetWidth; // фиксируем opacity: 0 перед появлением

        cards.forEach(card => card.classList.remove('is-fading'));
    }, 180);
};

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('button-active'));
        btn.classList.add('button-active');

        showFilteredImages(btn.dataset.type, yearFilter.value);
    });
});

yearFilter.addEventListener('change', () => {
    const activeBtn = document.querySelector('.filter-button.button-active');
    showFilteredImages(activeBtn?.dataset.type ?? 'all', yearFilter.value);
});