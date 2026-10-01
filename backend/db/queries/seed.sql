INSERT INTO users (
    name,
    email,
    role
)
VALUES
(
    'Pizza House Owner',
    'owner@pizzahouse.test',
    'RESTAURANT'
),
(
    'Test Customer',
    'customer@test.com',
    'CUSTOMER'
),
(
    'Test Driver',
    'driver@test.com',
    'DRIVER'
);

INSERT INTO restaurants (
    owner_id,
    name,
    description,
    address_line,
    city,
    latitude,
    longitude
)
SELECT
    id,
    'Pizza House',
    'Fresh pizza and Italian food',
    '123 Main Street',
    'Kuala Lumpur',
    3.1390,
    101.6869
FROM users
WHERE email = 'owner@pizzahouse.test';

INSERT INTO menu_categories (
    restaurant_id,
    name
)
SELECT
    id,
    'Pizza'
FROM restaurants
WHERE name = 'Pizza House';

INSERT INTO menu_items (
    restaurant_id,
    category_id,
    name,
    description,
    price
)
SELECT
    r.id,
    c.id,
    'Margherita Pizza',
    'Tomato, mozzarella and basil',
    18.00
FROM restaurants r
JOIN menu_categories c
    ON c.restaurant_id = r.id
WHERE r.name = 'Pizza House'
  AND c.name = 'Pizza';
