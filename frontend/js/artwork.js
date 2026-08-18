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
        paintingSupport.textContent = artwork.surface + ", " + artwork.medium.toLowerCase();

        const paintingYear = document.querySelector("#painting-year");
        paintingYear.textContent = artwork.creation_year;

        const paintingDescription = document.querySelector("#painting-description");
        paintingDescription.textContent = artwork.description;
        
        const picture = document.querySelector("#painting-image");
        picture.dataset.type = artwork.genres;
        picture.dataset.year = artwork.creation_year;

        const mainImage = artwork.images.find(image => image.is_main);
        const variants = mainImage.variants;
        const webpVariants = variants.filter(variant => variant.format === "webp");
        const jpegVariants = variants.filter(variant => variant.format === "jpeg");

        const srcset = webpVariants
            .sort((a, b) => a.width - b.width)
            .map(variant => `${variant.file_path} ${variant.width}w`)
            .join(", ");

        const fallback = jpegVariants.sort((a, b) => b.width - a.width)[0];

        const source = document.createElement("source");
        source.type = "image/webp";
        source.srcset = srcset;

        source.sizes = `
            (min-width: 1200px) 25vw,
            (min-width: 768px) 33vw,
            50vw
        `;
        
        const img = document.createElement("img");
        img.src = fallback.file_path;
        img.alt = mainImage.alt || artwork.title;
        img.loading = "lazy";

        picture.appendChild(source);
        picture.appendChild(img);

    } catch (error) {
        console.error(error);
    }

}

loadArtwork();