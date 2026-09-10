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

            const input = document.createElement("input");
            input.type = "text";
            input.value = item.name;
            input.classList.add("reference-item__input");

            const saveButton = document.createElement("button");
            saveButton.textContent = "Сохранить";
            let currentName = item.name;

            saveButton.addEventListener(
                "click",
                async () => {

                    const name = input.value.trim();

                    if (!name) {

                        alert(
                            "Название не может быть пустым"
                        );

                        return;
                    }

                    if (name === currentName) {

                        return;
                    }

                    try {

                        saveButton.disabled = true;

                        saveButton.textContent =
                            "Сохранение...";

                        const updatedItem =
                            await updateReferenceItem(
                                referenceType,
                                item.id,
                                name
                            );

                        currentName = updatedItem.name;

                        input.value = updatedItem.name;

                        saveButton.textContent =
                            "Сохранено";

                        setTimeout(() => {

                            saveButton.textContent =
                                "Сохранить";

                            saveButton.disabled = false;

                        }, 1000);

                    } catch (error) {

                        console.error(error);

                        alert(error.message);

                        saveButton.textContent =
                            "Сохранить";

                        saveButton.disabled = false;

                    }

                }
            );

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Удалить";

            deleteButton.addEventListener(
                "click",
                async () => {

                    const confirmed = confirm(
                        `Удалить "${item.name}"?`
                    );

                    if (!confirmed) {
                        return;
                    }

                    try {

                        deleteButton.disabled = true;

                        deleteButton.textContent =
                            "Удаление...";

                        await deleteReferenceItem(
                            referenceType,
                            item.id
                        );

                        // После успешного удаления
                        // заново загружаем список

                        await loadReferenceItems(
                            referenceType
                        );

                    } catch (error) {

                        console.error(error);

                        alert(error.message);

                        deleteButton.disabled = false;

                        deleteButton.textContent =
                            "Удалить";

                    }

                }
            );
            row.appendChild(input);
            row.appendChild(saveButton);
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


function setupReferenceForms() {

    const forms = document.querySelectorAll(
        ".reference-form"
    );

    forms.forEach(form => {

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();

                const referenceType =
                    form.dataset.referenceType;

                const input =
                    form.querySelector(
                        'input[name="name"]'
                    );

                const name =
                    input.value.trim();

                if (!name) {

                    alert(
                        "Введите название"
                    );

                    return;
                }

                const submitButton =
                    form.querySelector(
                        'button[type="submit"]'
                    );

                try {

                    submitButton.disabled = true;

                    submitButton.textContent =
                        "Добавление...";

                    await createReferenceItem(
                        referenceType,
                        name
                    );

                    // Очищаем поле

                    input.value = "";

                    // Обновляем список

                    await loadReferenceItems(
                        referenceType
                    );

                } catch (error) {

                    console.error(error);

                    alert(error.message);

                } finally {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        "Добавить";

                }

            }
        );

    });

}


async function initReferenceDataAdmin() {

    setupReferenceForms();

    await loadAllReferenceData();

}

initReferenceDataAdmin();