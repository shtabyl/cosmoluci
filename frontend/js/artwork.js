import { getArtwork } from "./api.js";

async function loadArtwork() {
    const params = new URLSearchParams(window.location.search);
    const artworkId = params.get("id");

    if (!artworkId) {
        console.error("Artwork ID not found in URL");
        return;
    }
    
    try {
        const artwork = await getArtwork(artworkId);

        const paintingTitle = document.querySelector("#painting-title");
        paintingTitle.textContent = artwork.title;

        const paintingStatus = document.querySelector("#painting-status");
        paintingStatus.textContent = artwork.status;

        const paintingSupport = document.querySelector("#painting-support");
        paintingSupport.textContent = artwork.support;

        const paintingYear = document.querySelector("#painting-year");
        paintingYear.textContent = artwork.year;

        const paintingDescription = document.querySelector("#painting-description");
        paintingDescription.textContent = artwork.description;
        
        const paintingImage = document.querySelector("#painting-image");
        paintingImage.src = artwork.image_large;
        paintingImage.alt = artwork.title;

    } catch (error) {
        console.error(error);
    }

}

loadArtwork();