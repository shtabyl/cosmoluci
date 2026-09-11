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

async function loadOwners() {

    const container = document.querySelector(
        "#owners-list"
    );

    try {

        const owners = await getOwners();

        container.innerHTML = "";

        owners.forEach(owner => {

            const row = document.createElement("div");

            row.classList.add(
                "reference-item",
                "owner-item"
            );


            // Страна

            const countryInput =
                document.createElement("input");

            countryInput.type = "text";

            countryInput.value = owner.country || "";

            countryInput.placeholder = "Страна";


            // Тип владельца

            const ownerTypeInput =
                document.createElement("input");

            ownerTypeInput.type = "text";

            ownerTypeInput.value =
                owner.owner_type || "";

            ownerTypeInput.placeholder =
                "Тип владельца";


            // Сохранить

            const saveButton =
                document.createElement("button");

            saveButton.type = "button";

            saveButton.textContent =
                "Сохранить";

            let currentCountry = owner.country || "";

            let currentOwnerType =
                owner.owner_type || "";

            saveButton.addEventListener(
                "click",
                async () => {

                    const country =
                        countryInput.value.trim();

                    const ownerType =
                        ownerTypeInput.value.trim();

                    if (!country) {

                        alert("Введите страну");

                        return;

                    }

                    if (!ownerType) {

                        alert(
                            "Введите тип владельца"
                        );

                        return;

                    }


                    // Ничего не изменилось

                    if (
                        country === currentCountry &&
                        ownerType === currentOwnerType
                    ) {

                        return;

                    }

                    try {

                        saveButton.disabled = true;

                        saveButton.textContent =
                            "Сохранение...";


                        const updatedOwner =
                            await updateOwner(
                                owner.id,
                                country,
                                ownerType
                            );


                        // Обновляем локальное состояние

                        currentCountry =
                            updatedOwner.country;

                        currentOwnerType =
                            updatedOwner.owner_type;


                        // На всякий случай обновляем inputs

                        countryInput.value =
                            updatedOwner.country;

                        ownerTypeInput.value =
                            updatedOwner.owner_type;


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

                        saveButton.disabled = false;

                        saveButton.textContent =
                            "Сохранить";

                    }

                }
            );
            // Удалить

            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";

            deleteButton.textContent =
                "Удалить";

            deleteButton.addEventListener(
                "click",
                async () => {

                    const description =
                        `${owner.country} — ${owner.owner_type}`;

                    const confirmed = confirm(
                        `Удалить запись "${description}"?`
                    );

                    if (!confirmed) {
                        return;
                    }

                    try {

                        deleteButton.disabled = true;

                        deleteButton.textContent =
                            "Удаление...";


                        await deleteOwner(owner.id);


                        // Загружаем актуальный список

                        await loadOwners();

                    } catch (error) {

                        console.error(error);

                        alert(error.message);

                        deleteButton.disabled = false;

                        deleteButton.textContent =
                            "Удалить";

                    }

                }
        );  

            // Добавляем элементы

            row.appendChild(countryInput);

            row.appendChild(ownerTypeInput);

            row.appendChild(saveButton);

            row.appendChild(deleteButton);

            container.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        container.textContent =
            "Ошибка загрузки владельцев";

    }
}

function setupOwnerForm() {

    const form = document.querySelector(
        "#owner-form"
    );

    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const countryInput =
                form.querySelector(
                    'input[name="country"]'
                );

            const ownerTypeInput =
                form.querySelector(
                    'input[name="owner_type"]'
                );


            const country =
                countryInput.value.trim();

            const ownerType =
                ownerTypeInput.value.trim();


            if (!country) {

                alert("Введите страну");

                return;

            }


            if (!ownerType) {

                alert(
                    "Введите тип владельца"
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


                await createOwner(
                    country,
                    ownerType
                );


                // Очищаем форму

                countryInput.value = "";

                ownerTypeInput.value = "";


                // Обновляем список

                await loadOwners();

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
}


async function initReferenceDataAdmin() {

    // Простые справочники

    setupReferenceForms();

    await loadAllReferenceData();


    // Owners

    setupOwnerForm();

    await loadOwners();

}

initReferenceDataAdmin();