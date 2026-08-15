INSERT INTO mediums (name)
VALUES
    ('Масло'),
    ('Акварель'),
    ('Акрил'),
    ('Пастель'),
    ('Темпера'),
    ('Карандаш'),
    ('Маркеры'),
    ('Графит'),
    ('Тушь'),
    ('Гуашь'),
    ('Чернила'),
    ('Цифровая живопись'),
    ('Смешанная техника');

INSERT INTO surfaces (name)
VALUES
    ('Холст'),
    ('Бумага'),
    ('Дерево'),
    ('Картон'),
    ('Металл'),
    ('Стекло'),
    ('Пластик'),
    ('Керамика'),
    ('Ткань'),
    ('Кожа'),
    ('Камень'),
    ('Цифровая поверхность');

INSERT INTO statuses (name)
VALUES
    ('В мастерской'),
    ('На выставке'),
    ('Забронирована'),
    ('Продана'),
    ('Архив');

INSERT INTO genres (name)
VALUES
    ('Портрет'),
    ('Пейзаж'),
    ('Натюрморт'),
    ('Абстракция'),
    ('Ню');

INSERT INTO owners (country, owner_type)
VALUES
    ('Россия', 'Частная коллекция'),
    ('США', 'Частная коллекция'),
    ('Германия', 'Частная коллекция'),
    ('Франция', 'Частная коллекция'),
    ('Италия', 'Частная коллекция'),
    ('Великобритания', 'Частная коллекция'),
    ('Канада', 'Частная коллекция'),
    ('Япония', 'Частная коллекция'),
    ('Аргентина', 'Частная коллекция'),
    ('Швейцария', 'Частная коллекция');

INSERT INTO paintings (
    title, slug, creation_year, description, height_cm, width_cm, medium_id, surface_id, status_id, owner_id, price, currency, catalog_number, is_published
) VALUES (
    'Портрет девушки', 'portrait-of-a-girl', 2025, 'Второй портрет Марии – веселой и жизнерадостной девушки, которая любит путешествовать и открывать для себя новые горизонты. На этом портрете она изображена в момент вдохновения, когда ее глаза сияют от радости и предвкушения новых приключений.', 50.0, 40.0, 1, 1, 1, NULL, NULL, NULL, 'P-2025-001', TRUE
)
RETURNING id;

INSERT INTO painting_genres (painting_id, genre_id)
VALUES
    (1, 1);

INSERT INTO painting_images (painting_id, image_type, is_main, alt_text, sort_order)
VALUES 
    (1, 'main', TRUE, 'Портрет девушки', 0),
    (1, 'detail', FALSE, 'Деталь портрета девушки', 1)
RETURNING id;

INSERT INTO image_variants (image_id, width, height, format, file_path)
VALUES
    (1, 2856, 3563, 'jpeg', '/images/artworks/1/original/main.jpeg'),
    (1, 1200, 1497, 'webp', '/images/artworks/1/web/main/1200.webp'),
    (1, 800, 998, 'webp', '/images/artworks/1/web/main/800.webp'),
    (1, 400, 499, 'webp', '/images/artworks/1/web/main/400.webp');

INSERT INTO image_variants (image_id, width, height, format, file_path)
VALUES
    (2, 4032, 3024, 'jpeg', '/images/artworks/1/original/detail-01.jpeg'),
    (2, 1200, 1600, 'webp', '/images/artworks/1/web/detail-01/1200.webp'),
    (2, 800, 1066, 'webp', '/images/artworks/1/web/detail-01/800.webp'),
    (2, 400, 533, 'webp', '/images/artworks/1/web/detail-01/400.webp');