const API_URL = "http://127.0.0.1:8000";

async function load_artworks() {
    try {
        const response = await fetch(`${API_URL}/api/admin/artworks`);

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const artworks = await response.json();

        renderArtworks(artworks);
    } catch (error) {
        console.error("Failed to load artworks:", error);
    }
}

load_artworks();


function renderArtworks(artworks) {
    const container = document.querySelector('#artworks-list');

    container.innerHTML = '';

    artworks.forEach(artwork => {
        
        const item = document.createElement('article');
        item.classList.add('admin-row');
        item.innerHTML = `
            <div class="admin-artwork__id">
                ${artwork.id}
            </div>

            <div class="admin-artwork__title">
                ${artwork.title}
            </div>

            <div class="admin-artwork__year">
                ${artwork.creation_year ?? ""}
            </div>

            <div class="admin-artwork__status">
                ${artwork.status ?? ""}
            </div>

            <button class="js-edit-artwork button">
                Редактировать
            </button>
        `;

        item.querySelector(".js-edit-artwork")
            .addEventListener("click", () => {
                window.location.href = `artwork.html?id=${artwork.id}`;
            });

        container.appendChild(item);
    });
}