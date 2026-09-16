import { requireAdmin } from "./auth.js";
import { getCsrfToken } from "./auth.js";

const API_URL = "http://127.0.0.1:8000";

const params = new URLSearchParams(window.location.search);
const artworkId = params.get("id");

const isEditMode = Boolean(artworkId);

let isPublished = false;

function updatePublicationUI(isPublished) {

    const statusElement =
        document.querySelector(
            "#publication-status"
        );

    const button =
        document.querySelector(
            "#publication-button"
        );


    if (isPublished) {

        statusElement.textContent =
            "✅ Опубликована";

        button.textContent =
            "Снять с публикации";

    } else {

        statusElement.textContent =
            "🟡 Не опубликована";

        button.textContent =
            "Опубликовать";

    }

}


function setupPageMode() {

    const pageTitle = document.querySelector(".admin__header .title");
    const idElement = document.querySelector("#id");
    const imagesSection = document.querySelector(".admin-images");
    const uploadSection = document.querySelector(".admin-image-upload");
    const submitButton = document.querySelector('#artwork-form button[type="submit"]');
    const publicationStatus = document.querySelector("#publication-status");
    const publicationButton = document.querySelector("#publication-button");

    if (isEditMode) {

        pageTitle.textContent = "Редактирование картины";
        submitButton.textContent = "Сохранить";
        imagesSection.hidden = false;
        uploadSection.hidden = false;
        publicationStatus.hidden = false;
        publicationButton.hidden = false;

    } else {

        pageTitle.textContent = "Добавление картины";
        idElement.textContent = "";
        submitButton.textContent = "Создать картину";
        imagesSection.hidden = true;
        uploadSection.hidden = true;
        publicationStatus.hidden = true;
        publicationButton.hidden = true;
    }

}

const form = document.querySelector("#artwork-form");
form.addEventListener("submit", saveArtwork);

const imageUploadForm = document.querySelector('#image-upload-form');
imageUploadForm.addEventListener('submit', uploadImage);

document
    .querySelector("#publication-button")
    .addEventListener("click", togglePublication);


async function loadPage() {

    try {

        const referenceData =
            await loadReferenceData();


        fillReferenceSelects(referenceData);


        if (isEditMode) {

            const artworkResponse = await fetch(
                `${API_URL}/api/admin/artworks/${artworkId}`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

            if (!artworkResponse.ok) {

                throw new Error(
                    `Failed to load artwork: ${artworkResponse.status}`
                );

            }

            const artwork =
                await artworkResponse.json();

            isPublished = artwork.is_published;


            fillForm(
                artwork,
                referenceData
            );


            renderImages(
                artwork.images ?? []
            );

            updatePublicationUI(
                isPublished
            );

        } else {

            // CREATE MODE:
            // форма пустая

            fillGenres(
                referenceData.genres,
                []
            );

        }

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

async function initArtworkPage() {

    const admin =
        await requireAdmin();


    if (!admin) {

        return;

    }


    // Здесь существующая
    // логика загрузки artwork
    setupPageMode();
    loadPage();
    
}

initArtworkPage();

function getSelectValue(id) {
    const value = document.querySelector(`#${id}`).value;
    return value === '' ? null : Number(value);
}


function getOptionalNumber(selector) {

    const value =
        document.querySelector(selector).value;

    if (value === "") {
        return null;
    }

    return Number(value);
}


function collectArtworkData() {

    return {

        title:
            document.querySelector("#title").value.trim(),

        creation_year:
            Number(
                document.querySelector(
                    "#creation-year"
                ).value
            ),

        description:
            document.querySelector(
                "#description"
            ).value.trim() || null,

        height_cm: getOptionalNumber("#height"),

        width_cm: getOptionalNumber("#width"),

        medium_id:
            getSelectValue("medium"),

        surface_id:
            getSelectValue("surface"),

        status_id:
            getSelectValue("status"),

        owner_id:
            getSelectValue("owner"),

        genre_ids:
            getSelectedGenreIds(),

        is_copy: false

    };

}

async function saveArtwork(event) {

    event.preventDefault();

    hideMessage();

    const data =
        collectArtworkData();


    try {

        // =========================
        // CREATE MODE
        // =========================

        if (!isEditMode) {

            const newArtwork =
                await apiRequest(
                    `${API_URL}/api/admin/artworks`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify(data)
                    }
                );


            // Переходим в EDIT MODE

            window.location.href =
                `artwork.html?id=${newArtwork.id}`;


            return;

        }


        // =========================
        // EDIT MODE
        // =========================

        const updatedArtwork =
            await apiRequest(
                `${API_URL}/api/admin/artworks/${artworkId}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(data)
                }
            );


        console.log(
            "Artwork updated:",
            updatedArtwork
        );


        showMessage(
            "Изменения сохранены.",
            "success"
        );


    } catch (error) {

        console.error(
            "Failed to save artwork:",
            error
        );


        showMessage(
            `Ошибка сохранения: ${error.message}`,
            "error"
        );

    }

}


async function loadReferenceData() {
    const response = await fetch(`${API_URL}/api/admin/reference-data`,
        {
            method: "GET",
            credentials: "include"
        }
    );

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
    saveButton.classList.add('button');
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
    deleteButton.classList.add('button');
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

                credentials: "include",

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
                method: "DELETE",
                credentials: "include"
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
                credentials: "include",
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

async function togglePublication() {

    if (!isEditMode) {
        return;
    }

    hideMessage();

    const newPublicationState =
        !isPublished;


    try {

        const result = await apiRequest(

            `${API_URL}/api/admin/artworks/${artworkId}/publication`,

            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    is_published:
                        newPublicationState

                })

            }

        );

        isPublished =
            result.is_published;


        updatePublicationUI(
            isPublished
        );

        showMessage(
            isPublished
                ? "Картина опубликована."
                : "Картина снята с публикации.",
            "success"
        );


    } catch (error) {

        console.error(
            "Publication error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );

    }

}


function showMessage(message, type = "error") {
    const element =
        document.querySelector("#form-message");
    element.textContent = message;
    element.className =
        `form-message ${type}`;
    element.hidden = false;
}

function hideMessage() {
    const element =
        document.querySelector("#form-message");
    element.hidden = true;
    element.textContent = "";
}

function getApiErrorMessage(data) {

    if (!data) {
        return "Неизвестная ошибка сервера.";
    }


    if (typeof data.detail === "string") {
        return data.detail;
    }


    if (Array.isArray(data.detail)) {

        return data.detail
            .map(error => {

                const field =
                    error.loc?.[error.loc.length - 1]

                const message =
                    error.msg;

                return field ? `${field}: ${message}` : message;

            })
            .join("\n");
    }


    return "Произошла ошибка сервера.";
}


async function apiRequest(
    url,
    options = {}
) {

    const method =
        (options.method || "GET").toUpperCase();

    const headers = {
        ...(options.headers || {})
    };

    if (
        method === "POST" ||
        method === "PATCH" ||
        method === "DELETE"
    ) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            headers["X-CSRF-Token"] = csrfToken;
        }
    }

    const requestOptions = {
        ...options,
        headers,
        credentials: "include"
    };

    let response;

    try {

        response = await fetch(
            url,
            requestOptions
        );

    } catch (error) {

        throw new Error(
            "Не удалось соединиться с сервером. " +
            "Проверьте подключение и попробуйте снова."
        );

    }

    let data = null;

    try {

        data = await response.json();

    } catch {

        data = null;

    }

    if (!response.ok) {

        const message =
            getApiErrorMessage(data);

        throw new Error(message);

    }

    return data;
}