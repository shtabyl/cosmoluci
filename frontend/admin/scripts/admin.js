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
                ${artwork.is_published
                ? `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 12L8.94975 16.9497L19.5572 6.34326" stroke="#34C759" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                `
                : `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4Z" stroke="#D5AD5C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <g clip-path="url(#clip0_41_56)">
                        <mask id="mask0_41_56" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="8" y="8" width="8" height="8">
                        <path d="M15 9V15H9V9H15Z" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </mask>
                        <g mask="url(#mask0_41_56)">
                        <path d="M9 9L15 15M9 15L15 9" stroke="#D5AD5C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                        </g>
                        <defs>
                        <clipPath id="clip0_41_56">
                        <rect width="8" height="8" fill="white" transform="translate(8 8)"/>
                        </clipPath>
                        </defs>
                    </svg>
                `
                }
            </div>

            <div id="featured" class="admin-artwork__featured row-item">
                ${artwork.is_featured 
                ? `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 7.69428C10 2.99984 3 3.49984 3 9.49987C3 15.4999 12 20.5001 12 20.5001C12 20.5001 21 15.4999 21 9.49987C21 3.49984 14 2.99984 12 7.69428Z" stroke="#D5AD5C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                ` 
                : ""
            }
            </div>

            <button class="js-edit-artwork button button_edit row-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 16.0001V20.0001L8 20.0001L18.8686 9.13146L18.8695 9.13061C19.265 8.73516 19.4628 8.53736 19.5369 8.3092C19.6021 8.10835 19.6022 7.89201 19.5369 7.69117C19.4627 7.46284 19.2646 7.26474 18.8686 6.86872L17.1288 5.12892C16.7345 4.7346 16.5369 4.53704 16.3091 4.46301C16.1082 4.39775 15.8919 4.39775 15.691 4.46301C15.463 4.53709 15.2652 4.73488 14.8704 5.12976L14.8686 5.13146L4 16.0001Z" stroke="#D5AD5C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
        `;

        item.querySelector(".js-edit-artwork")
            .addEventListener("click", () => {
                window.location.href = `artwork.html?id=${artwork.id}`;
            });

        container.appendChild(item);
    });
}

