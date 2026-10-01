-- +goose Up

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    phone VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_role_check
        CHECK (role IN (
            'CUSTOMER',
            'RESTAURANT',
            'DRIVER',
            'ADMIN'
        ))
);

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    label VARCHAR(50) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id),

    name VARCHAR(150) NOT NULL,
    description TEXT,
    address_line TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    image_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT restaurants_status_check
        CHECK (status IN (
            'OPEN',
            'CLOSED',
            'SUSPENDED'
        ))
);

CREATE TABLE restaurant_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL
        REFERENCES restaurants(id)
        ON DELETE CASCADE,

    day_of_week SMALLINT NOT NULL,
    open_time TIME,
    close_time TIME,

    CONSTRAINT restaurant_hours_day_check
        CHECK (day_of_week BETWEEN 0 AND 6)
);

CREATE TABLE menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL
        REFERENCES restaurants(id)
        ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL
        REFERENCES restaurants(id)
        ON DELETE CASCADE,

    category_id UUID
        REFERENCES menu_categories(id)
        ON DELETE SET NULL,

    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT menu_items_price_check
        CHECK (price >= 0)
);

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    restaurant_id UUID NOT NULL
        REFERENCES restaurants(id),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT carts_user_unique
        UNIQUE (user_id)
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL
        REFERENCES carts(id)
        ON DELETE CASCADE,

    menu_item_id UUID NOT NULL
        REFERENCES menu_items(id),

    quantity INTEGER NOT NULL,

    CONSTRAINT cart_items_quantity_check
        CHECK (quantity > 0),

    CONSTRAINT cart_items_unique
        UNIQUE (cart_id, menu_item_id)
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id),

    restaurant_id UUID NOT NULL
        REFERENCES restaurants(id),

    delivery_address_id UUID NOT NULL
        REFERENCES addresses(id),

    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total NUMERIC(10, 2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT orders_status_check
        CHECK (status IN (
            'PENDING',
            'CONFIRMED',
            'PREPARING',
            'READY',
            'DRIVER_ASSIGNED',
            'PICKED_UP',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'CANCELLED',
            'REJECTED'
        )),

    CONSTRAINT orders_payment_status_check
        CHECK (payment_status IN (
            'PENDING',
            'PAID',
            'FAILED',
            'REFUNDED'
        ))
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    menu_item_id UUID
        REFERENCES menu_items(id),

    name_snapshot VARCHAR(150) NOT NULL,
    price_snapshot NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,

    CONSTRAINT order_items_quantity_check
        CHECK (quantity > 0)
);

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES users(id),

    vehicle_type VARCHAR(30),
    vehicle_number VARCHAR(50),

    status VARCHAR(20) NOT NULL DEFAULT 'OFFLINE',

    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT drivers_status_check
        CHECK (status IN (
            'OFFLINE',
            'AVAILABLE',
            'BUSY',
            'PAUSED'
        ))
);

CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL UNIQUE
        REFERENCES orders(id)
        ON DELETE CASCADE,

    driver_id UUID
        REFERENCES drivers(id),

    status VARCHAR(30) NOT NULL DEFAULT 'UNASSIGNED',

    pickup_latitude DOUBLE PRECISION,
    pickup_longitude DOUBLE PRECISION,

    dropoff_latitude DOUBLE PRECISION,
    dropoff_longitude DOUBLE PRECISION,

    assigned_at TIMESTAMPTZ,
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT deliveries_status_check
        CHECK (status IN (
            'UNASSIGNED',
            'ASSIGNED',
            'PICKED_UP',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'CANCELLED'
        ))
);

CREATE TABLE driver_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    driver_id UUID NOT NULL
        REFERENCES drivers(id)
        ON DELETE CASCADE,

    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,

    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_addresses_user_id
    ON addresses(user_id);

CREATE INDEX idx_restaurants_owner_id
    ON restaurants(owner_id);

CREATE INDEX idx_menu_categories_restaurant_id
    ON menu_categories(restaurant_id);

CREATE INDEX idx_menu_items_restaurant_id
    ON menu_items(restaurant_id);

CREATE INDEX idx_menu_items_category_id
    ON menu_items(category_id);

CREATE INDEX idx_orders_user_id
    ON orders(user_id);

CREATE INDEX idx_orders_restaurant_id
    ON orders(restaurant_id);

CREATE INDEX idx_orders_status
    ON orders(status);

CREATE INDEX idx_order_items_order_id
    ON order_items(order_id);

CREATE INDEX idx_deliveries_driver_id
    ON deliveries(driver_id);

CREATE INDEX idx_deliveries_status
    ON deliveries(status);

CREATE INDEX idx_driver_locations_driver_time
    ON driver_locations(driver_id, recorded_at DESC);


-- +goose Down

DROP TABLE driver_locations;
DROP TABLE deliveries;
DROP TABLE drivers;
DROP TABLE order_items;
DROP TABLE orders;
DROP TABLE cart_items;
DROP TABLE carts;
DROP TABLE menu_items;
DROP TABLE menu_categories;
DROP TABLE restaurant_hours;
DROP TABLE restaurants;
DROP TABLE addresses;
DROP TABLE users;
