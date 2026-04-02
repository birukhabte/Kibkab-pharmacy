-- Create Admin User for Pharmacy App
-- Username: admin
-- Password: admin123

-- Step 1: Create all permissions
INSERT INTO permissions (id, name, description, created_at) VALUES
  (gen_random_uuid(), 'manage_employees', 'Can manage employees', NOW()),
  (gen_random_uuid(), 'manage_branches', 'Can manage branches', NOW()),
  (gen_random_uuid(), 'manage_customers', 'Can manage customers', NOW()),
  (gen_random_uuid(), 'manage_roles', 'Can manage roles', NOW()),
  (gen_random_uuid(), 'manage_inventory', 'Can manage inventory', NOW()),
  (gen_random_uuid(), 'create_sales', 'Can create sales', NOW()),
  (gen_random_uuid(), 'approve_sales', 'Can approve sales', NOW()),
  (gen_random_uuid(), 'view_reports', 'Can view reports', NOW()),
  (gen_random_uuid(), 'manage_suppliers', 'Can manage suppliers', NOW()),
  (gen_random_uuid(), 'adjust_stock', 'Can adjust stock', NOW()),
  (gen_random_uuid(), 'create_orders', 'Can create orders', NOW()),
  (gen_random_uuid(), 'pay_orders', 'Can pay orders', NOW()),
  (gen_random_uuid(), 'pay_commissions', 'Can pay commissions', NOW()),
  (gen_random_uuid(), 'view_alerts', 'Can view alerts', NOW())
ON CONFLICT (name) DO NOTHING;

-- Step 2: Create Admin Role
INSERT INTO roles (id, name, commission, threshold, description, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Admin',
  0.00,
  0.00,
  'Administrator with full access',
  NOW(),
  NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Step 3: Assign all permissions to Admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'Admin'),
  id
FROM permissions
ON CONFLICT DO NOTHING;

-- Step 4: Create Admin User
-- Password: admin123 (bcrypt hash: $2a$10$N9qo.8YvI3qZ8Z8Z8Z8Z8uJ5YxGzQJeK5YxGzQJeK5YxGzQJeK5Yx)
-- You'll need to replace this hash with a real one
INSERT INTO employees (id, branch_id, role_id, email, username, first_name, last_name, phone, password_hashed, active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  NULL,
  (SELECT id FROM roles WHERE name = 'Admin'),
  'admin@pharmacy.com',
  'admin',
  'System',
  'Administrator',
  '1234567890',
  '$2a$10$YourBcryptHashHere',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE SET
  password_hashed = EXCLUDED.password_hashed,
  updated_at = NOW();
