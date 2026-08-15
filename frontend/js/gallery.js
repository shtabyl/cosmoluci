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
            picture.dataset.type = artwork.type;
            picture.dataset.year = artwork.year;

            const source = document.createElement("source");
            source.media = "(min-width: 1200px)";
            source.srcset = artwork.image_large;
            
            const img = document.createElement("img");
            img.src = artwork.image_small;
            img.alt = artwork.title;
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