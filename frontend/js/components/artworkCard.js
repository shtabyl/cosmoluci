export function createArtworkCard(artwork) {
    const article = document.createElement("article");

    article.className = "artwork-card";

    article.innerHTML = `
        <a href="artwork.html?id=${artwork.id}">
            <img src="${artwork.image}" alt="${artwork.title}">
            <h2>${artwork.title}</h2>
            <p>${artwork.year}</p>
        </a>
    `;

    return article;
}