const API_URL = "http://127.0.0.1:8000";

const params = new URLSearchParams(window.location.search);
const artworkId = params.get("id");

if (!artworkId) {
    console.error("Artwork ID not found in URL");
}

const form = document.querySelector("#artwork-form");
form.addEventListener("submit", saveArtwork);

const imageUploadForm = document.querySelector('#image-upload-form');
imageUploadForm.addEventListener('submit', uploadImage);


async function loadPage() {
    try {
        const [artworkResponse, referenceData] =
            await Promise.all([
                fetch(`${API_URL}/api/admin/artworks/${artworkId}`),
                loadReferenceData()
            ]);

        if (!artworkResponse.ok) {
            throw new Error(
                `Failed to load artwork: ${artworkResponse.status}`
            );
        }

        const artwork = await artworkResponse.json();

        fillReferenceSelects(referenceData);
        fillForm(artwork, referenceData);
        renderImages(artwork.images ?? []);

    } catch (error) {
        console.error(
            "Failed to load admin page:",
            error
        );
    }
}

function fillForm(artwork, referenceData) {

    document.querySelector("#id").textContent =
        artwork.id ?? "";

    document.querySelector("#title").value =
        artwork.title ?? "";

    document.querySelector("#creation-year").value =
        artwork.creation_year ?? "";

    document.querySelector("#description").value =
        artwork.description ?? "";

    document.querySelector("#height").value =
        artwork.height_cm ?? "";

    document.querySelector("#width").value =
        artwork.width_cm ?? "";

    document.querySelector("#medium").value =
        artwork.medium_id ?? "";

    document.querySelector("#surface").value =
        artwork.surface_id ?? "";

    document.querySelector("#status").value =
        artwork.status_id ?? "";

    document.querySelector("#owner").value =
        artwork.owner_id ?? "";

    const selectedGenreIds = (artwork.genres ?? []).map(genre => genre.id);

    fillGenres(
        referenceData.genres,
        selectedGenreIds
    );
}

loadPage();


function getSelectValue(id) {
    const value = document.querySelector(`#${id}`).value;
    return value === '' ? null : Number(value);
}


async function saveArtwork(event) {

    event.preventDefault();

    const data = {
        title: document.querySelector("#title").value,
        creation_year:
            Number(document.querySelector("#creation-year").value),
        description:
            document.querySelector("#description").value,
        height_cm:
            Number(document.querySelector("#height").value),
        width_cm:
            Number(document.querySelector("#width").value),
        medium_id:
            getSelectValue("medium"),
        surface_id:
            getSelectValue("surface"),
        status_id:
            getSelectValue("status"),
        owner_id:
            getSelectValue("owner"),
        genres:
            getSelectedGenreIds()
    };

    try {

        const response = await fetch(`${API_URL}/api/admin/artworks/${artworkId}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const updatedArtwork = await response.json();

        console.log(
            "Artwork updated:",
            updatedArtwork
        );

        alert("Artwork updated");

    } catch (error) {

        console.error(
            "Failed to update artwork:",
            error
        );
    }
}

async function loadReferenceData() {
    const response = await fetch(`${API_URL}/api/admin/reference-data`);

    if (!response.ok) {
        throw new Error(
            `Failed to load reference data: ${response.status}`
        );
    }

    return await response.json();
}


function fillSelect(selectId, items) {

    const select = document.querySelector(`#${selectId}`);

    items.forEach(item => {

        const option = document.createElement("option");

        option.value = item.id;
        if (selectId === 'owner') {
            option.textContent = `${item.country}, ${item.owner_type}`
        } else {
            option.textContent = item.name
        }

        select.appendChild(option);
    });
}

function fillReferenceSelects(data) {

    fillSelect("medium", data.mediums);
    fillSelect("surface", data.surfaces);
    fillSelect("status", data.statuses);
    fillSelect("owner", data.owners);
}


function fillGenres(genres, selectedGenreIds = []) {
    const container = document.querySelector("#genres");

    container.innerHTML = "";

    genres.forEach(genre => {
        const label = document.createElement("label");

        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.value = genre.id;
        checkbox.dataset.genreId = genre.id;

        if (selectedGenreIds.includes(genre.id)) {
            checkbox.checked = true;
        }

        label.appendChild(checkbox);
        label.appendChild(
            document.createTextNode(` ${genre.name}`)
        );

        container.appendChild(label);
    });
}

function getSelectedGenreIds() {
    const checkboxes = document.querySelectorAll(
        '#genres input[type="checkbox"]:checked'
    );

    return Array.from(checkboxes).map(
        checkbox => Number(checkbox.value)
    );
}


function getPreviewVariant(image) {

    const webpVariants = image.variants
        .filter(variant => variant.format === "webp")
        .sort((a, b) => a.width - b.width);

    if (webpVariants.length === 0) {
        return null;
    }

    return (
        webpVariants.find(
            variant => variant.width >= 400
        )
        ?? webpVariants[webpVariants.length - 1]
    );
}

function renderImages(images) {

    const container =
        document.querySelector("#images-container");

    container.innerHTML = "";

    images.forEach(image => {
        const imageCard = createImageCard(image);

        container.appendChild(imageCard);
    });
}


function createImageCard(image) {

    const card = document.createElement("article");
    card.classList.add("admin-image-card");
    card.dataset.imageId = image.id;

    const preview = getPreviewVariant(image);
    const img = document.createElement("img");
    if (preview) {
        img.src = preview.file_path;
    }
    img.alt = image.alt_text || "";
    img.loading = "lazy";

    const type = document.createElement("div");
    type.classList.add("admin-image-card__type");
    type.textContent = image.type;

    const altLabel = document.createElement("label");
    altLabel.textContent = "Alt text";
    const altInput = document.createElement("textarea");
    // altInput.type = "text";
    altInput.value = image.alt ?? "";
    altInput.maxLength = 500;
    altLabel.appendChild(altInput);

    const orderLabel = document.createElement("label");
    orderLabel.textContent = "Порядок";
    const orderInput = document.createElement("input");
    orderInput.type = "number";
    orderInput.value = image.sort_order ?? 0;
    orderLabel.appendChild(orderInput);

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "Сохранить картинку";
    saveButton.addEventListener("click", () => {

        updateImage(
            image.id,
            altInput.value,
            Number(orderInput.value)
        );

    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Удалить картинку";
    deleteButton.addEventListener("click", () => {
        
        deleteImage(image.id);

    });

    card.appendChild(img);
    card.appendChild(type);
    card.appendChild(altLabel);
    card.appendChild(orderLabel);
    card.appendChild(saveButton);
    card.appendChild(deleteButton);

    return card;
}


async function updateImage(
    imageId,
    altText,
    sortOrder
) {

    try {

        const response = await fetch(`${API_URL}/api/admin/images/${imageId}`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    alt_text: altText,
                    sort_order: sortOrder
                })
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to update image: ${response.status}`
            );
        }

        await loadPage();

    } catch (error) {

        console.error(
            "Failed to update image:",
            error
        );
    }
}


async function deleteImage(imageId) {

    const confirmed = confirm("Удалить изображение?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/admin/images/${imageId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to delete image: ${response.status}`);
        }

        await loadPage();
    
    } catch (error) {

        console.error("Failed to delete image:", error);

    }
}


async function uploadImage(event) {

    event.preventDefault();

    const fileInput = document.querySelector("#image-file");
    const imageType = document.querySelector("#image-type").value;
    const file = fileInput.files[0];

    if (!file) {
        return;
    }

    const formData = new FormData();

    formData.append("image", file);

    formData.append("image_type", imageType);

    try {

        const response = await fetch(
            `${API_URL}/api/admin/artworks/${artworkId}/images`,
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(error);
        }

        fileInput.value = "";

        await loadPage();

    } catch (error) {

        console.error(
            "Failed to upload image:",
            error
        );
    }
}