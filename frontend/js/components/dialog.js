const imageContainer = document.querySelector('#painting-details');
const dialog = document.querySelector('#lightbox');
const closeDialogBtn = document.querySelector('#lightbox-close-button');
const lightboxImage = document.querySelector('#lightbox-image');

imageContainer.addEventListener('click', (e) => {
    const targetImage = e.target.closest('.detail-image');

    if (!targetImage) {
        return;
    }

    const targetImageSrc = targetImage.getAttribute('src');
    lightboxImage.setAttribute('src', targetImageSrc);
    dialog.showModal();
});

closeDialogBtn.addEventListener('click', (e) => {
    lightboxImage.setAttribute('src', "");
    dialog.close();
});

dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
        dialog.close();
        lightboxImage.setAttribute('src', "");
    }
});