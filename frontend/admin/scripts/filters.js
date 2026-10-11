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

function toggleResetButton(searchQuery, filterValues) {
    const resetBtn = document.getElementById('js-reset-all-filters');
    
    if (!resetBtn) return;
    
    // Проверяем, изменен ли хотя бы один селект
    const hasActiveFilters = Object.values(filterValues).some(value => value !== '');
    const isSorted = document.getElementById('js-sort-id').value === 'desc';

    // Показываем кнопку, если есть хоть один активный фильтр или текст в поиске
    resetBtn.hidden = !(hasActiveFilters || isSorted);
}

/**
 * Применяет текстовый поиск и фильтры ко всем карточкам
 */
function applyAllFilters() {
    const searchQuery = getSearchQuery();
    const filterValues = getFilterValues();

    // Переключаем видимость общей кнопки сброса
    toggleResetButton(searchQuery, filterValues);

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

    const sortBtn = document.getElementById('js-sort-id');
    // Обработка клика по общей кнопке сброса
    const resetBtn = document.getElementById('js-reset-all-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            // 1. Сбрасываем все селекты в дефолтное состояние (первая опция "All")
            FILTER_IDS.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.value = '';
            });

            if (sortBtn) {
                sortArticlesById('asc');
                sortSelect.classList.remove('is-changed');
                sortBtn.value = 'asc';
            }

            // 2. Имитируем клик по крестику текстового поиска, чтобы очистить инпут внутри search.js
            const clearSearchBtn = document.getElementById('js-clear-search');
            if (clearSearchBtn) {
                clearSearchBtn.click();
            } else {
                // Если крестика нет, просто вызываем обновление списка вручную
                applyAllFilters();
            }
        });
    }

    // Инициализируем сортировку по ID
    const sortSelect = document.getElementById('js-sort-id');
    if (sortSelect) {
        // Сортируем первый раз сразу при загрузке
        sortArticlesById(sortSelect.value);

        // Пересортировываем при смене направления пользователем
        sortSelect.addEventListener('change', function (e) {
            sortArticlesById(e.target.value);
            applyAllFilters();
            if (e.target.value === 'desc') {
                sortSelect.classList.add('is-changed');
            } else {
                sortSelect.classList.remove('is-changed');
            }
        });
    }
});
