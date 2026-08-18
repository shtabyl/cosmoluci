import { getArtworks } from "./api.js";

async function loadGallery() {
    try {
        const artworks = await getArtworks();

        const galleryContainer = document.querySelector("#gallery-container");

        artworks.forEach(artwork => {
            const pictureLink = document.createElement("a");
            pictureLink.href = `artwork.html?id=${artwork.id}`;
            pictureLink.classList.add("gallery__picture-link");

            const picture = document.createElement("picture");
            picture.classList.add("gallery__picture", "picture", "picture_gallery");
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
            pictureLink.appendChild(picture);
            galleryContainer.appendChild(pictureLink);


        });
    } catch (error) {
        console.error(error);
    }
}

loadGallery();