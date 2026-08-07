// Burger
const burger = document.querySelector('.burger');
const navbar = document.querySelector('.navbar');
const headerLogo = document.querySelector('.header__logo');
const headerNavbar = document.querySelector('.header__navbar');

burger.addEventListener('click', (e) => {
        e.stopPropagation(); 
        e.preventDefault();
        if (navbar.classList.contains('active')) {
            navbar.classList.add('hide');
        } else {
            navbar.classList.remove('hide');
        }
        navbar.classList.toggle('active');
        burger.classList.toggle('burger_close');
});

document.addEventListener('click', (e) => {
    if (burger.classList.contains('burger_close')) {
        burger.classList.remove('burger_close');
        navbar.classList.toggle('active');
        navbar.classList.add('hide');
    }
});

// Make navbar full width on mobile
window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
        navbar.classList.add('full-width');
        headerNavbar.appendChild(headerLogo);
    } else {
        navbar.classList.remove('full-width');
        navbar.prepend(headerLogo);
    }
});

if (window.innerWidth < 768) {
    navbar.classList.add('full-width');
    headerNavbar.appendChild(headerLogo);
} else {
    navbar.classList.remove('full-width');
    navbar.prepend(headerLogo);
}
