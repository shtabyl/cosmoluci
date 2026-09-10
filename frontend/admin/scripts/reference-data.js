import {
    getReferenceItems,
    createReferenceItem,
    updateReferenceItem,
    deleteReferenceItem,

    getOwners,
    createOwner,
    updateOwner,
    deleteOwner

} from "./reference-api.js";

const REFERENCE_TYPES = [
    "mediums",
    "surfaces",
    "statuses",
    "genres"
];

async function loadReferenceItems(referenceType) {

    const container = document.querySelector(
        `#${referenceType}-list`
    );

    try {

        const items = await getReferenceItems(referenceType);

        container.innerHTML = "";

        items.forEach(item => {

            const row = document.createElement("div");

            row.classList.add("reference-item");

            const name = document.createElement("span");
            name.textContent = item.name;


            const editButton = document.createElement("button");
            editButton.textContent = "Редактировать";
            editButton.dataset.id = item.id;


            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Удалить";
            deleteButton.dataset.id = item.id;

            row.appendChild(name);
            row.appendChild(editButton);
            row.appendChild(deleteButton);
            container.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        container.textContent =
            "Ошибка загрузки данных";

    }
}

async function loadAllReferenceData() {
    for (const referenceType of REFERENCE_TYPES) {
        await loadReferenceItems(referenceType);
    }

}

loadAllReferenceData();