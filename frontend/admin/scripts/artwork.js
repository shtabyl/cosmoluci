const API_URL = "http://127.0.0.1:8000";

const params = new URLSearchParams(window.location.search);
const artworkId = params.get("id");

if (!artworkId) {
    console.error("Artwork ID not found in URL");
}

async function loadArtwork() {

    try {

        const response = await fetch(`${API_URL}/api/admin/artworks/${artworkId}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const artwork = await response.json();

        fillForm(artwork);

    } catch (error) {

        console.error(
            "Failed to load artwork:",
            error
        );

    }
}

function fillForm(artwork) {

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

}

loadArtwork();

document
    .querySelector("#artwork-form")
    .addEventListener("submit", saveArtwork);

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
            Number(document.querySelector("#width").value)
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