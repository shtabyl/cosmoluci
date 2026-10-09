// Переменная для хранения текущего значения поиска
let currentSearchQuery = '';

/**
 * Получить текущее очищенное значение поиска
 * @return {string}
 */
export function getSearchQuery() {
    return currentSearchQuery;
}

/**
 * Инициализация компонента поиска
 * @param {Function} onSearchChangeCallback - функция, вызываемая при изменении текста
 */
export function initSearch(onSearchChangeCallback) {
    const searchInput = document.getElementById('js-search-article');
    const clearBtn = document.getElementById('js-clear-search');

    if (!searchInput || !clearBtn) return;

    // Внутренняя функция для переключения атрибута hidden у крестика
    function toggleClearButton(value) {
        clearBtn.hidden = value.length === 0;
    }

    // Обработчик ввода текста (работает мгновенно)
    searchInput.addEventListener('input', function (e) {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        toggleClearButton(e.target.value);
        onSearchChangeCallback();
    });

    // Обработчик клика по кнопке очистки
    clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        currentSearchQuery = '';
        toggleClearButton('');
        onSearchChangeCallback();
        searchInput.focus();
    });
}
