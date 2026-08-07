const accordionItems = document.querySelectorAll('.about__accordion-item');

const openAccordion = (accordion) => {
    const accordionText = accordion.querySelector('.about__text-box');
    const listIconClosed = accordion.querySelector('.list-icon-closed');
    const listIconOpened = accordion.querySelector('.list-icon-opened');
    accordion.classList.add('active_accordion');
    accordionText.style.maxHeight = accordionText.scrollHeight + 'px';
    listIconClosed.style.opacity = '0';
    listIconOpened.style.opacity = '1';
}

const closeAccordion = (accordion) => {
    const accordionText = accordion.querySelector('.about__text-box');
    const listIconClosed = accordion.querySelector('.list-icon-closed');
    const listIconOpened = accordion.querySelector('.list-icon-opened');
    accordion.classList.remove('active_accordion');
    accordionText.style.maxHeight = null;
    listIconClosed.style.opacity = '1';
    listIconOpened.style.opacity = '0';
}

accordionItems.forEach((accordion) => {
    const accordionTitle = accordion.querySelector('.about__title-box');
    const accordionText = accordion.querySelector('.about__text-box');

    accordionTitle.addEventListener('click', () => {
        if (accordionText.style.maxHeight) {
            closeAccordion(accordion);
        } else {
            accordionItems.forEach((accordion) => closeAccordion(accordion));
            openAccordion(accordion);
        }
    });
});