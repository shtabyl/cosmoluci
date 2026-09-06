const API_URL = "http://127.0.0.1:8000";

const params = new URLSearchParams(window.location.search);
const artworkId = params.get("id");

if (!artworkId) {
    console.error("Artwork ID not found in URL");
}

const form = document.querySelector("#artwork-form");
form.addEventListener("submit", saveArtwork);


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