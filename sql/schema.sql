-- Create database
CREATE DATABASE attendance_db;
\c attendance_db;

-- =====================
-- Table: departments
-- =====================
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- Table: users
-- =====================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employee',
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- Table: attendance
-- =====================
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    in_time TIMESTAMPTZ,
    out_time TIMESTAMPTZ,
    in_lat NUMERIC,
    in_lng NUMERIC,
    out_lat NUMERIC,
    out_lng NUMERIC,
    status TEXT DEFAULT 'present',
    note TEXT,
    face_image_url TEXT,
    face_verified BOOLEAN DEFAULT FALSE,
    verification_score NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- Table: leaves
-- =====================
CREATE TABLE leaves (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    type TEXT,
    status TEXT DEFAULT 'pending',
    applied_at TIMESTAMPTZ DEFAULT now(),
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ
);

-- =====================
-- Table: locations
-- =====================
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lat NUMERIC NOT NULL,
    lng NUMERIC NOT NULL,
    accuracy NUMERIC,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- Table: payroll_records
-- =====================
CREATE TABLE payroll_records (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    gross NUMERIC,
    deductions NUMERIC,
    net NUMERIC,
    generated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================
-- Table: settings
-- =====================
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
