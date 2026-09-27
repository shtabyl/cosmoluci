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
            <div id="id-view" class="admin-artwork__id row-item">
                ${artwork.id}
            </div>

            <div class="admin-artwork__image row-item">
                <img src="${artwork.thumbnail}" class="admin-row__image">
            </div>

            <div id="title" class="admin-artwork__title row-item">
                ${artwork.title}
            </div>

            <div class="admin-artwork__year row-item">
                ${artwork.creation_year ?? ""}
            </div>
            
            <div id="status" class="admin-artwork__publish row-item">
                ${artwork.is_published ? "✅" : "🟡"}
            </div>

            <div id="featured" class="admin-artwork__featured row-item">
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

// const mediaQuery = window.matchMedia('(max-width: 600px)');

// function handleTabletChange(e) {

//     const row = document.querySelector('.admin-row');
//     const textContainer = document.createElement('div');
//     textContainer.classList.add('admin-row__text-container');

//     const idView = document.querySelector('#id-view');
//     const title = document.querySelector('#title');
//     const status = document.querySelector('#status');
//     const featured = document.querySelector('#featured');

//     // e.matches вернет true, если экран мобильный/планшетный
//     if (e.matches) {
//         console.log('Переключено на мобильный вид!');
//         textContainer.appendChild(idView);
//         textContainer.appendChild(title);
//         textContainer.appendChild(status);
//         textContainer.appendChild(featured);

//         row.appendChild(textContainer);
//     // Здесь ваш код для мобильной версии (например, включить бургер-меню)
//     } else {
//         console.log('Переключено на десктопный вид!');
//     // Здесь ваш код для десктопа (например, отключить бургер-меню)
//     }
// }

// // 2. Запускаем функцию сразу при загрузке страницы
// handleTabletChange(mediaQuery);

// // 3. Вешаем слушатель событий на изменение ширины экрана
// mediaQuery.addEventListener('change', handleTabletChange);

