const filterBtns = document.querySelectorAll('.filter-button');
const yearFilter = document.querySelector('#year-filter');

const showFilteredImages = (type, year) => {
    const images = document.querySelectorAll('.gallery__picture');
    images.forEach(image => {
        const imageType = image.getAttribute('data-type');
        const imageYear = image.getAttribute('data-year');
        if (
        (type === 'all' || type === imageType)
        && (year === 'all' || year === imageYear)
        ) {
            image.style.display = 'block';
            setTimeout(() => {
                image.classList.remove('hide');
            }, 100);
        }
    });
}

const hideImages = () => {
    const images = document.querySelectorAll('.gallery__picture');
    images.forEach(image => {
        image.classList.add('hide');
        setTimeout(() => {
            image.style.display = 'none';
        }, 600);
    });
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(btn => btn.classList.remove('button-active'));
        btn.classList.add('button-active');
        hideImages();
        setTimeout(() => {
            const type = btn.getAttribute('data-type');
            const year = yearFilter.value;
            showFilteredImages(type, year);
        }, 600);
    });
});

yearFilter.addEventListener('change', () => {
    const activeFilterBtn = document.querySelector('.filter-button.button-active');
    hideImages();
    setTimeout(() => {
        const type = activeFilterBtn.getAttribute('data-type');
        const year = yearFilter.value;
        showFilteredImages(type, year);
    }, 600);
});

// Select filter



