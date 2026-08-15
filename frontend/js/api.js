const API_URL = "http://127.0.0.1:8000";

export async function getArtworks() {
    const response = await fetch(`${API_URL}/api/artworks`);

    if (!response.ok) {
        throw new Error("Failed to load artworks");
    }

    return await response.json();
}

export async function getArtwork(id) {
    const response = await fetch(`${API_URL}/api/artworks/${id}`);
    
    if (!response.ok) {
        throw new Error("Artwork not found");
    }

    return await response.json();
}