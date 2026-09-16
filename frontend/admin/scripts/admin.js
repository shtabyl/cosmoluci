import { requireAdmin } from "./auth.js";

const API_URL = "http://127.0.0.1:8000";

async function load_artworks() {
    try {
        const response = await fetch(`${API_URL}/api/admin/artworks`,
            {
                method: "GET",
                credentials: "include"
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const artworks = await response.json()
        artworks.sort((a, b) => a.id - b.id);

        renderArtworks(artworks);
    } catch (error) {
        console.error("Failed to load artworks:", error);
    }
}

async function initAdmin() {

    const admin =
        await requireAdmin();


    if (!admin) {

        return;

    }


    console.log(
        "Authenticated admin"
    );


    // загрузка списка картин
    load_artworks();

}

document.addEventListener(
    "DOMContentLoaded",
    initAdmin
);


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
            
            <div class="admin-artwork__publish">
                ${artwork.is_published ? "✅" : "🟡"}
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