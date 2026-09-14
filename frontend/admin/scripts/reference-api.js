const API_URL = "http://127.0.0.1:8000/api/admin";


export async function getReferenceItems(referenceType) {

    const response = await fetch(
        `${API_URL}/reference-data/${referenceType}`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to load reference data");
    }

    return response.json();
}


export async function createReferenceItem(
    referenceType,
    name
) {

    const response = await fetch(
        `${API_URL}/reference-data/${referenceType}`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name
            })
        }
    );

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.detail || "Failed to create item"
        );
    }

    return response.json();
}


export async function updateReferenceItem(
    referenceType,
    itemId,
    name
) {

    const response = await fetch(
        `${API_URL}/reference-data/${referenceType}/${itemId}`,
        {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name
            })
        }
    );

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.detail || "Failed to update item"
        );
    }

    return response.json();
}


export async function deleteReferenceItem(
    referenceType,
    itemId
) {

    const response = await fetch(
        `${API_URL}/reference-data/${referenceType}/${itemId}`,
        {
            method: "DELETE",
            credentials: "include"
        }
    );

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.detail || "Failed to delete item"
        );
    }

    return response.json();
}


export async function getOwners() {

    const response = await fetch(
        `${API_URL}/owners`,
        {
            method: "GET",
            credentials: "include"
        }
    );

    if (!response.ok) {
        throw new Error("Failed to load owners");
    }

    return response.json();
}


export async function createOwner(
    country,
    ownerType
) {

    const response = await fetch(
        `${API_URL}/owners`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                country,
                owner_type: ownerType
            })
        }
    );

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.detail || "Failed to create owner"
        );
    }

    return response.json();
}


export async function updateOwner(
    ownerId,
    country,
    ownerType
) {

    const response = await fetch(
        `${API_URL}/owners/${ownerId}`,
        {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                country,
                owner_type: ownerType
            })
        }
    );

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.detail || "Failed to update owner"
        );
    }

    return response.json();
}


export async function deleteOwner(ownerId) {

    const response = await fetch(
        `${API_URL}/owners/${ownerId}`,
        {
            method: "DELETE",
            credentials: "include"
        }
    );

    if (!response.ok) {

        const error = await response.json();

        throw new Error(
            error.detail || "Failed to delete owner"
        );
    }

    return response.json();
}