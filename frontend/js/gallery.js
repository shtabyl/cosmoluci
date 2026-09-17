import { getArtworks } from "./api.js";
import { getYears } from "./api.js";

async function loadGallery() {

    try {

        const artworks = await getArtworks();

        const galleryContainer =
            document.querySelector("#gallery-container");

        artworks.forEach(artwork => {

            // Создаём ссылку на страницу картины
            const pictureLink = document.createElement("a");

            pictureLink.href = `artwork.html?id=${artwork.id}`;
            pictureLink.classList.add("gallery__picture-link");


            // Создаём <picture>
            const picture = document.createElement("picture");

            picture.classList.add(
                "gallery__picture",
                "picture",
                "picture_gallery"
            );

            pictureLink.dataset.type = artwork.genres;
            pictureLink.dataset.year = artwork.creation_year;


            // Находим главное изображение
            const mainImage =
                artwork.images?.find(image => image.is_main);

            if (!mainImage) {
                console.error(
                    `Main image not found for artwork ${artwork.id}`
                );
                return;
            }


            // Берём только WebP
            const webpVariants = (mainImage.variants ?? [])
                .filter(variant => variant.format === "webp")
                .sort((a, b) => a.width - b.width);

            if (webpVariants.length === 0) {
                console.error(
                    `WebP variants not found for artwork ${artwork.id}`
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
            img.src =
                webpVariants[webpVariants.length - 1].file_path;

            img.srcset = srcset;

            img.sizes = `
                (min-width: 1200px) 25vw,
                (min-width: 768px) 33vw,
                50vw
            `;

            img.alt =
                mainImage.alt_text || artwork.title;

            img.loading = "lazy";


            // Собираем DOM
            picture.appendChild(img);

            pictureLink.appendChild(picture);

            galleryContainer.appendChild(pictureLink);

        });

    } catch (error) {

        console.error("Failed to load gallery:", error);

    }
}

loadGallery();

async function loadYearOptions() {

    try {

        const years = await getYears();

        const yearFilterContainer =
            document.querySelector("#year-filter-options");
        const yearFilterNativeWrapper = document.querySelector("#year-filter");

        years.forEach(year => {

            const option = document.createElement("div");

            option.classList.add("select-custom-option");
            option.dataset.value = year;
            option.textContent = year;

            yearFilterContainer.appendChild(option);

            const optionNative = document.createElement("option");
            optionNative.value = year;
            optionNative.textContent = year;
            yearFilterNativeWrapper.appendChild(optionNative);
        });

    } catch (error) {

        console.error("Failed to load reference data:", error);

    }
}

loadYearOptions();