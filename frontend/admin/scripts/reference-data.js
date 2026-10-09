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
            saveButton.textContent = "Save";
            saveButton.classList.add('button');
            let currentName = item.name;

            saveButton.addEventListener(
                "click",
                async () => {

                    const name = input.value.trim();

                    if (!name) {

                        alert(
                            "Title could not be empty"
                        );

                        return;
                    }

                    if (name === currentName) {

                        return;
                    }

                    try {

                        saveButton.disabled = true;

                        saveButton.textContent =
                            "Saving...";

                        const updatedItem =
                            await updateReferenceItem(
                                referenceType,
                                item.id,
                                name
                            );

                        currentName = updatedItem.name;

                        input.value = updatedItem.name;

                        saveButton.textContent =
                            "Saved";

                        setTimeout(() => {

                            saveButton.textContent =
                                "Save";

                            saveButton.disabled = false;

                        }, 1000);

                    } catch (error) {

                        console.error(error);

                        alert(error.message);

                        saveButton.textContent =
                            "Save";

                        saveButton.disabled = false;

                    }

                }
            );

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add('button');

            deleteButton.addEventListener(
                "click",
                async () => {

                    const confirmed = confirm(
                        `Delete "${item.name}"?`
                    );

                    if (!confirmed) {
                        return;
                    }

                    try {

                        deleteButton.disabled = true;

                        deleteButton.textContent =
                            "Deleting...";

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
                            "Delete";

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
            "Error loading reference items";

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
                        "Enter a valid reference item"
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
                        "Adding...";

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
                        "Add";

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

            countryInput.placeholder = "Country";


            // Тип владельца

            const ownerTypeInput =
                document.createElement("input");

            ownerTypeInput.type = "text";

            ownerTypeInput.value =
                owner.owner_type || "";

            ownerTypeInput.placeholder =
                "Owner type";


            // Сохранить

            const saveButton =
                document.createElement("button");

            saveButton.type = "button";

            saveButton.textContent =
                "Save";
            saveButton.classList.add('button');

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

                        alert("Enter country");

                        return;

                    }

                    if (!ownerType) {

                        alert(
                            "Enter owner type"
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
                            "Saving...";


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
                            "Saved";


                        setTimeout(() => {

                            saveButton.textContent =
                                "Save";

                            saveButton.disabled = false;

                        }, 1000);

                    } catch (error) {

                        console.error(error);

                        alert(error.message);

                        saveButton.disabled = false;

                        saveButton.textContent =
                            "Save";

                    }

                }
            );
            // Удалить

            const deleteButton =
                document.createElement("button");

            deleteButton.type = "button";

            deleteButton.textContent =
                "Delete";
            deleteButton.classList.add('button');

            deleteButton.addEventListener(
                "click",
                async () => {

                    const description =
                        `${owner.country} — ${owner.owner_type}`;

                    const confirmed = confirm(
                        `Delete owner"${description}"?`
                    );

                    if (!confirmed) {
                        return;
                    }

                    try {

                        deleteButton.disabled = true;

                        deleteButton.textContent =
                            "Deleting...";


                        await deleteOwner(owner.id);

                        await loadOwners();

                    } catch (error) {

                        console.error(error);

                        alert(error.message);

                        deleteButton.disabled = false;

                        deleteButton.textContent =
                            "Delete";

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
            "Error loading owners";

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

                alert("Enter country");

                return;

            }


            if (!ownerType) {

                alert(
                    "Enter owner type"
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
                    "Adding...";


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
                    "Add";

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