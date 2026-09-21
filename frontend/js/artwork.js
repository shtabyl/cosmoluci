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

        // Текстовые данные
        document.querySelector("#painting-title").textContent = artwork.title;

        document.querySelector("#painting-status").textContent = artwork.status;

        document.querySelector("#painting-support").textContent =
            artwork.surface + ", " + artwork.medium.toLowerCase();

        document.querySelector("#painting-year").textContent =
            artwork.creation_year;

        document.querySelector("#painting-description").textContent =
            artwork.description;

        // Picture
        const picture = document.querySelector("#painting-image");

        picture.dataset.type = artwork.genres;
        picture.dataset.year = artwork.creation_year;

        // Главное изображение
        const mainImage = artwork.images?.find(image => image.is_main);

        if (!mainImage) {
            console.error("Main image not found");
            return;
        }

        const variants = mainImage.variants ?? [];

        // Только WebP для отображения
        const webpVariants = variants
            .filter(variant => variant.format === "webp")
            .sort((a, b) => a.width - b.width);

        if (webpVariants.length === 0) {
            console.error("WebP variants not found");
            return;
        }

        // srcset
        const srcset = webpVariants
            .map(variant => `${variant.file_path} ${variant.width}w`)
            .join(", ");

        // <source>
        const source = document.createElement("source");

        source.type = "image/webp";
        source.srcset = srcset;

        source.sizes = `
            (min-width: 1200px) 25vw,
            (min-width: 768px) 33vw,
            50vw
        `;

        // <img>
        const img = document.createElement("img");

        // Самая большая WebP как fallback внутри img
        img.src = webpVariants[webpVariants.length - 1].file_path;

        img.srcset = srcset;
        img.sizes = source.sizes;

        img.alt = mainImage.alt_text || artwork.title;

        img.loading = "lazy";

        // Очищаем picture перед добавлением
        picture.innerHTML = "";

        picture.appendChild(source);
        picture.appendChild(img);

        loadDetails(artwork);
    } catch (error) {
        console.error("Failed to load artwork:", error);
    }
}

function loadDetails(artwork) {

    try {

        const detailsContainer =
            document.querySelector("#painting-details");


            
            
            
            
            // Find details
            const paintingDetails =
            artwork.images?.filter(image => !image.is_main);
            
            if (!paintingDetails) {
                console.error(
                    `Details not found for artwork ${artwork.id}`
                );
                return;
            }
            
            // Loop through details            
            paintingDetails.forEach(detail => {
                
                // Создаём <picture>
                const picture = document.createElement("picture");
                
                picture.classList.add("detail");
                
                // Только WebP
                const webpVariants = detail.variants
                    .filter(variant => variant.format === "webp")
                    .sort((a, b) => a.width - b.width);

                if (webpVariants.length === 0) {
                    console.error(
                        `WebP variants not found for detail ${detail.id}`
                    );
                    return;
                }

                // Создаём srcset
                const srcset = webpVariants
                    .map(
                        variant =>
                            `${variant.file_path} ${variant.width}w`
                    )
                    .join(", ");


                // Создаём <img>
                const img = document.createElement("img");

                // Самая большая версия — базовый src
                img.classList.add("detail-image");
                img.src =
                    webpVariants[webpVariants.length - 1].file_path;

                img.srcset = srcset;

                img.sizes = `
                    (min-width: 1200px) 25vw,
                    (min-width: 768px) 33vw,
                    50vw
                `;

                img.alt =
                    detail.alt_text || artwork.title;

                img.loading = "lazy";

                // Собираем DOM
                picture.appendChild(img);
                detailsContainer.appendChild(picture);
        });

    } catch (error) {

        console.error("Failed to load artwork:", error);

    }
}

loadArtwork();