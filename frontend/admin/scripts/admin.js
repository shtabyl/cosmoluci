import { requireAdmin } from "./auth.js";

import { API_URL } from "../../js/config.js";

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
            <div class="admin-artwork__id row-item">
                ${artwork.id}
            </div>

            <div class="admin-artwork__image row-item">
                <img src="${artwork.thumbnail}" class="admin-row__image">
            </div>

            <div class="admin-artwork__title row-item">
                ${artwork.title}
            </div>

            <div class="admin-artwork__year row-item">
                ${artwork.creation_year ?? ""}
            </div>
            
            <div class="admin-artwork__publish row-item">
                ${artwork.is_published ? "✅" : "🟡"}
            </div>

            <div class="admin-artwork__featured row-item">
                ${artwork.is_featured ? "🧡" : ""}
            </div>

            <button class="js-edit-artwork button button_edit row-item">
                &#9998;
            </button>
        `;

        item.querySelector(".js-edit-artwork")
            .addEventListener("click", () => {
                window.location.href = `artwork.html?id=${artwork.id}`;
            });

        container.appendChild(item);
    });
}

