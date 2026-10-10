import { getSearchQuery, initSearch } from './artwork-search.js';
import { sortArticlesById } from './artworks-sort.js';

// Константы для конфигурации
const FILTER_IDS = ['js-filter-year', 'js-filter-status', 'js-filter-featured'];
const FILTER_TO_DATA_MAP = {
    'js-filter-year': 'data-year',
    'js-filter-status': 'data-status',
    'js-filter-featured': 'data-featured'
};

/**
 * Собирает выбранные значения из всех селектов фильтрации
 * @return {Object}
 */
function getFilterValues() {
    const values = {};
    FILTER_IDS.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            const currentValue = element.value;
            values[id] = element.value;

            if (currentValue !== '') {
                element.classList.add('is-changed');
            } else {
                element.classList.remove('is-changed');
            }
        }
    });
    return values;
}

/**
 * Применяет текстовый поиск и фильтры ко всем карточкам
 */
function applyAllFilters() {
    const searchQuery = getSearchQuery();
    const filterValues = getFilterValues();
    const articles = document.querySelectorAll('.js-admin-row');

    articles.forEach(article => {
        // 1. Проверка по названию
        const titleElement = article.querySelector('.admin-artwork__title');
        const titleText = titleElement?.textContent.toLowerCase().trim() || '';
        const matchesSearch = !searchQuery || titleText.includes(searchQuery);

        // 2. Проверка по выпадающим спискам
        let matchesFilters = true;
        for (const [filterId, selectedValue] of Object.entries(filterValues)) {
            if (!selectedValue) continue; // Пропускаем вариант (All)

            const dataAttributeName = FILTER_TO_DATA_MAP[filterId];
            const articleValue = article.getAttribute(dataAttributeName) || '';

            if (articleValue !== selectedValue) {
                matchesFilters = false;
                break; 
            }
        }

        // Используем скрытие через нативный атрибут hidden
        article.hidden = !(matchesSearch && matchesFilters);
    });
}

// Инициализация при полной готовности DOM
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем текстовый поиск
    initSearch(applyAllFilters);

    // Подключаем события изменения к селектам фильтров
    FILTER_IDS.forEach(id => {
        const filterElement = document.getElementById(id);
        if (filterElement) {
            filterElement.addEventListener('change', applyAllFilters);
        }
    });

    // Инициализируем сортировку по ID
    const sortSelect = document.getElementById('js-sort-id');
    if (sortSelect) {
        // Сортируем первый раз сразу при загрузке
        sortArticlesById(sortSelect.value);

        // Пересортировываем при смене направления пользователем
        sortSelect.addEventListener('change', function (e) {
            sortArticlesById(e.target.value);
            if (e.target.value === 'desc') {
                sortSelect.classList.add('is-changed');
            } else {
                sortSelect.classList.remove('is-changed');
            }
        });
    }
});
