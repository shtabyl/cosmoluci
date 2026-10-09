/**
 * Функция сортировки карточек по ID
 * @param {string} order - направление сортировки ('asc' или 'desc')
 */
export function sortArticlesById(order = 'asc') {
    const articles = document.querySelectorAll('.js-admin-row');
    if (articles.length === 0) return;

    // Берем родительский контейнер у первой карточки списка
    const container = articles[0].parentNode;
    const articlesArray = Array.from(articles);

    articlesArray.sort((a, b) => {
        const idAElement = a.querySelector('.admin-artwork__id');
        const idBElement = b.querySelector('.admin-artwork__id');

        // Приводим к числам для правильного порядка (2 перед 10)
        const idA = parseInt(idAElement?.textContent.trim(), 10) || 0;
        const idB = parseInt(idBElement?.textContent.trim(), 10) || 0;

        return order === 'asc' ? idA - idB : idB - idA;
    });

    // В одну строчку перестраиваем элементы в DOM без их дублирования
    container.append(...articlesArray);
}
