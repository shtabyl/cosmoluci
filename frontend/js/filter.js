const filterBtns = document.querySelectorAll('.filter-button');
const yearFilter = document.querySelector('#year-filter');

let fadeTimer = null;

const showFilteredImages = (type, year) => {
    const cards = [
        ...document.querySelectorAll('.gallery__picture-link')
    ];

    const matchingCards = cards.filter(card => {
        // Получаем массив типов карточки, разделяя строку по пробелу (или по запятой, если оставите её)
        const cardTypes = card.dataset.type ? card.dataset.type.split(',') : [];
        
        // Проверяем, совпадает ли выбранный тип или входит ли он в массив типов карточки
        const isTypeMatch =
            type === 'all' || cardTypes.includes(type);

        const isYearMatch =
            year === 'all' || year === card.dataset.year;

        return isTypeMatch && isYearMatch;
    });

    clearTimeout(fadeTimer);

    // Сначала плавно скрываем все карточки
    cards.forEach(card => {
        card.classList.remove('is-visible');
        card.classList.add('is-fading');
    });

    // После завершения fade-out меняем состав галереи
    fadeTimer = setTimeout(() => {

        cards.forEach(card => {
            card.style.display =
                matchingCards.includes(card) ? '' : 'none';
        });

        // Принудительно фиксируем состояние opacity: 0
        void document.body.offsetWidth;

        // Затем плавно показываем подходящие карточки
        matchingCards.forEach(card => {
            card.classList.remove('is-fading');
            card.classList.add('is-visible');
        });

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
