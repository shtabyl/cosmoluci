const filterBtns = document.querySelectorAll('.filter-button');
const yearFilter = document.querySelector('#year-filter');

// const showFilteredImages = (type, year) => {
//     const cards = document.querySelectorAll('.gallery__picture-link');

//     cards.forEach(card => {
//         const imageType = card.dataset.type;
//         const imageYear = card.dataset.year;

//         const isMatch =
//             (type === 'all' || type === imageType) &&
//             (year === 'all' || year === imageYear);

//         card.style.display = isMatch ? '' : 'none';
//     });
// };


const showFilteredImages = (type, year) => {
    const cards = [...document.querySelectorAll('.gallery__picture-link')];

    // Определяем, какие карточки должны быть видны
    const matchingCards = cards.filter(card => {
        const isTypeMatch =
            type === 'all' || type === card.dataset.type;

        const isYearMatch =
            year === 'all' || year === card.dataset.year;

        return isTypeMatch && isYearMatch;
    });

    const visibleCards = cards.filter(
        card => card.style.display !== 'none'
    );

    // Фаза A: плавно скрываем текущие карточки
    visibleCards.forEach(card => {
        card.classList.add('is-fading');
    });

    setTimeout(() => {

        // Убираем старые карточки из Grid
        cards.forEach(card => {
            card.style.display = matchingCards.includes(card)
                ? ''
                : 'none';

            card.classList.remove('is-fading');
        });

        // Фаза B: плавно показываем подходящие карточки
        matchingCards.forEach(card => {
            card.style.opacity = '0';
        });

        requestAnimationFrame(() => {
            matchingCards.forEach(card => {
                card.style.transition = 'opacity 400ms ease';
                card.style.opacity = '1';
            });
        });

    }, 180);
};


filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {

        filterBtns.forEach(btn => {
            btn.classList.remove('button-active');
        });

        btn.classList.add('button-active');

        const type = btn.dataset.type;
        const year = yearFilter.value;

        showFilteredImages(type, year);
    });
});


yearFilter.addEventListener('change', () => {

    const activeFilterBtn = document.querySelector(
        '.filter-button.button-active'
    );

    const type = activeFilterBtn.dataset.type;
    const year = yearFilter.value;

    showFilteredImages(type, year);
});