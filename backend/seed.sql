-- Seed Data for Luxury Restaurant App

-- 1. Insert Users
INSERT INTO users (id, name, email, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'Alice Johnson', 'alice@example.com', '+1-555-0101'),
('22222222-2222-2222-2222-222222222222', 'Bob Smith', 'bob@example.com', '+1-555-0102'),
('33333333-3333-3333-3333-333333333333', 'Charlie Davis', 'charlie@example.com', '+1-555-0103'),
('44444444-4444-4444-4444-444444444444', 'Diana Prince', 'diana@example.com', '+1-555-0104')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert Tables
INSERT INTO tables (id, table_name, capacity, is_active) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Window Seat 1', 2, true),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Window Seat 2', 2, true),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Main Hall Booth A', 4, true),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Main Hall Booth B', 4, true),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Family Table', 6, true),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'VIP Private Room', 10, true)
ON CONFLICT (table_name) DO NOTHING;

-- 3. Insert Bookings (using CURRENT_DATE so they are always relevant)
INSERT INTO bookings (id, user_id, table_id, booking_date, booking_time, guest_count, status) VALUES
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', CURRENT_DATE + INTERVAL '1 day', '19:00:00', 2, 'confirmed'),
(uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', CURRENT_DATE + INTERVAL '1 day', '20:00:00', 4, 'confirmed'),
(uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', CURRENT_DATE + INTERVAL '2 days', '18:30:00', 6, 'confirmed'),
(uuid_generate_v4(), '44444444-4444-4444-4444-444444444444', 'ffffffff-ffff-ffff-ffff-ffffffffffff', CURRENT_DATE + INTERVAL '3 days', '21:00:00', 8, 'cancelled')
ON CONFLICT DO NOTHING;

-- 4. Insert Waitlist entries
INSERT INTO waitlist (id, name, email, guest_count, booking_date, booking_time) VALUES
(uuid_generate_v4(), 'Eve Adams', 'eve@example.com', 4, CURRENT_DATE + INTERVAL '1 day', '19:00:00'),
(uuid_generate_v4(), 'Frank Wright', 'frank@example.com', 2, CURRENT_DATE + INTERVAL '1 day', '20:00:00')
ON CONFLICT ON CONSTRAINT uq_waitlist_email_date_time DO NOTHING;
