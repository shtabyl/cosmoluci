CREATE TABLE mediums (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE surfaces (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE statuses (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE genres (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE owners (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    country VARCHAR(100),
    owner_type VARCHAR(100) NOT NULL
);

CREATE TABLE paintings (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    creation_year SMALLINT,
    description TEXT,
    height_cm NUMERIC(8,2),
    width_cm NUMERIC(8,2),
    medium_id INTEGER REFERENCES mediums(id),
    surface_id INTEGER REFERENCES surfaces(id),
    status_id INTEGER REFERENCES statuses(id),
    owner_id INTEGER REFERENCES owners(id),
    price NUMERIC(12,2),
    currency CHAR(3),
    catalog_number VARCHAR(100) UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_published BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE painting_genres (
    painting_id INTEGER NOT NULL REFERENCES paintings(id) ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (painting_id, genre_id)
);

CREATE TABLE painting_images (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    painting_id INTEGER NOT NULL REFERENCES paintings(id) ON DELETE CASCADE,
    image_type VARCHAR(50) NOT NULL,
    is_main BOOLEAN NOT NULL DEFAULT FALSE,
    alt_text VARCHAR(500),
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE image_variants (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    image_id INTEGER NOT NULL REFERENCES painting_images(id) ON DELETE CASCADE,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    format VARCHAR(10) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER NOT NULL,
    UNIQUE (image_id, width, height, format)
);

CREATE UNIQUE INDEX one_main_image_per_painting
ON painting_images (painting_id)
WHERE is_main = TRUE;

