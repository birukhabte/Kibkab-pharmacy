# Pharmacy Management System API Documentation 🚀

Welcome to the **Pharmacy Management System API**! This API provides endpoints to manage pharmacy operations, including branches, customers, employees, medicines, stock, purchases, sales, recurring purchases, supplier credits, employee payments, reports, and logs. Each endpoint is designed to be intuitive and RESTful, with clear inputs and outputs. Let's dive in! 🧪

---

## Table of Contents 📋
- [Branches](#branches-🏬)
- [Customers](#customers-👥)
- [Admins](#admins-🔒)
- [Employees](#employees-👷)
- [Medicines](#medicines-💊)
- [Medicine Stock](#medicine-stock-📦)
- [Suppliers](#suppliers-🚚)
- [Purchases](#purchases-🛒)
- [Purchase Items](#purchase-items-📋)
- [Sales](#sales-💸)
- [Sale Items](#sale-items-📋)
- [Recurring Purchases](#recurring-purchases-🔄)
- [Supplier Credits](#supplier-credits-💳)
- [Credit Payments](#credit-payments-💰)
- [Employee Payments](#employee-payments-💵)
- [Reports](#reports-📊)
- [Logs](#logs-📜)

---

## Authentication 🔑
- All endpoints require authentication via an **API token** (e.g., JWT) passed in the `Authorization` header.
- Admin-only endpoints are marked with 🔐, requiring admin privileges.
- Employee-only endpoints are marked with 👷, requiring employee privileges.

**Example Header**:
```
Authorization: Bearer <your-token>
```

---

## Branches 🏬

### GET /branches
**Description**: Retrieve a list of all pharmacy branches.  
**Parameters**: None  
**Returns**: Array of branch objects.  
**Response**:
```json
[
  {
    "branch_id": 1,
    "branch_name": "Main Pharmacy",
    "branch_location": "123 Health St",
    "branch_phone": "555-1234",
    "created_at": "2025-07-01T10:00:00Z"
  },
  ...
]
```

### GET /branches/:id
**Description**: Get details of a specific branch by ID.  
**Parameters**: 
- `id` (path, integer): Branch ID  
**Returns**: Single branch object or 404 if not found.  
**Response**:
```json
{
  "branch_id": 1,
  "branch_name": "Main Pharmacy",
  "branch_location": "123 Health St",
  "branch_phone": "555-1234",
  "created_at": "2025-07-01T10:00:00Z"
}
```

### POST /branches 🔐
**Description**: Create a new branch (admin only).  
**Body**:
```json
{
  "branch_name": "Downtown Pharmacy",
  "branch_location": "456 Wellness Ave",
  "branch_phone": "555-5678"
}
```
**Returns**: Created branch object with ID.  
**Response**:
```json
{
  "branch_id": 2,
  "branch_name": "Downtown Pharmacy",
  "branch_location": "456 Wellness Ave",
  "branch_phone": "555-5678",
  "created_at": "2025-07-15T14:46:00Z"
}
```

### PUT /branches/:id 🔐
**Description**: Update an existing branch (admin only).  
**Parameters**: 
- `id` (path, integer): Branch ID  
**Body**:
```json
{
  "branch_name": "Updated Pharmacy",
  "branch_location": "789 Health Rd",
  "branch_phone": "555-9012"
}
```
**Returns**: Updated branch object.  
**Response**:
```json
{
  "branch_id": 1,
  "branch_name": "Updated Pharmacy",
  "branch_location": "789 Health Rd",
  "branch_phone": "555-9012",
  "created_at": "2025-07-01T10:00:00Z",
  "updated_at": "2025-07-15T14:46:00Z"
}
```

### DELETE /branches/:id 🔐
**Description**: Delete a branch (admin only).  
**Parameters**: 
- `id` (path, integer): Branch ID  
**Returns**: Success message or 404 if not found.  
**Response**:
```json
{
  "message": "Branch deleted successfully"
}
```

---

## Customers 👥

### GET /customers
**Description**: Retrieve a list of all customers.  
**Parameters**: None  
**Returns**: Array of customer objects.  
**Response**:
```json
[
  {
    "customer_id": 1,
    "customer_first_name": "John",
    "customer_last_name": "Doe",
    "customer_phone": "555-0101",
    "created_at": "2025-07-01T12:00:00Z"
  },
  ...
]
```

### GET /customers/:id
**Description**: Get details of a specific customer by ID.  
**Parameters**: 
- `id` (path, integer): Customer ID  
**Returns**: Single customer object or 404 if not found.  
**Response**:
```json
{
  "customer_id": 1,
  "customer_first_name": "John",
  "customer_last_name": "Doe",
  "customer_phone": "555-0101",
  "created_at": "2025-07-01T12:00:00Z"
}
```

### POST /customers 👷
**Description**: Create a new customer (employee or admin).  
**Body**:
```json
{
  "customer_first_name": "Jane",
  "customer_last_name": "Smith",
  "customer_phone": "555-0202"
}
```
**Returns**: Created customer object with ID.  
**Response**:
```json
{
  "customer_id": 2,
  "customer_first_name": "Jane",
  "customer_last_name": "Smith",
  "customer_phone": "555-0202",
  "created_at": "2025-07-15T14:46:00Z"
}
```

### PUT /customers/:id 👷
**Description**: Update an existing customer (employee or admin).  
**Parameters**: 
- `id` (path, integer): Customer ID  
**Body**:
```json
{
  "customer_first_name": "Jane",
  "customer_last_name": "Doe",
  "customer_phone": "555-0303"
}
```
**Returns**: Updated customer object.  
**Response**:
```json
{
  "customer_id": 2,
  "customer_first_name": "Jane",
  "customer_last_name": "Doe",
  "customer_phone": "555-0303",
  "created_at": "2025-07-15T14:46:00Z",
  "updated_at": "2025-07-15T14:46:00Z"
}
```

### DELETE /customers/:id 🔐
**Description**: Delete a customer (admin only).  
**Parameters**: 
- `id` (path, integer): Customer ID  
**Returns**: Success message or 404 if not found.  
**Response**:
```json
{
  "message": "Customer deleted successfully"
}
```

---

## Admins 🔒

### POST /admins/login 🔐
**Description**: Authenticate an admin user.  
**Body**:
```json
{
  "username": "admin1",
  "password": "securepassword"
}
```
**Returns**: JWT token for authentication.  
**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /admins 🔐
**Description**: Create a new admin (admin only).  
**Body**:
```json
{
  "username": "admin2",
  "password": "securepassword"
}
```
**Returns**: Created admin object (without password).  
**Response**:
```json
{
  "admin_id": 1,
  "username": "admin2",
  "created_at": "2025-07-15T14:46:00Z"
}
```

---

## Employees 👷

### GET /employees
**Description**: Retrieve a list of all employees.  
**Parameters**: None  
**Returns**: Array of employee objects.  
**Response**:
```json
[
  {
    "employee_id": 1,
    "branch_id": 1,
    "email": "employee1@example.com",
    "first_name": "Alice",
    "last_name": "Brown",
    "phone": "555-0404",
    "active": 1,
    "added_at": "2025-07-01T12:00:00Z"
  },
  ...
]
```

### GET /employees/:id
**Description**: Get details of a specific employee by ID.  
**Parameters**: 
- `id` (path, integer): Employee ID  
**Returns**: Single employee object or 404 if not found.  
**Response**:
```json
{
  "employee_id": 1,
  "branch_id": 1,
  "email": "employee1@example.com",
  "first_name": "Alice",
  "last_name": "Brown",
  "phone": "555-0404",
  "active": 1,
  "added_at": "2025-07-01T12:00:00Z"
}
```

### POST /employees 🔐
**Description**: Create a new employee (admin only).  
**Body**:
```json
{
  "branch_id": 1,
  "email": "employee2@example.com",
  "first_name": "Bob",
  "last_name": "Smith",
  "phone": "555-0505",
  "password": "securepassword",
  "active": 1
}
```
**Returns**: Created employee object (without password).  
**Response**:
```json
{
  "employee_id": 2,
  "branch_id": 1,
  "email": "employee2@example.com",
  "first_name": "Bob",
  "last_name": "Smith",
  "phone": "555-0505",
  "active": 1,
  "added_at": "2025-07-15T14:46:00Z"
}
```

### PUT /employees/:id 🔐
**Description**: Update an existing employee (admin only).  
**Parameters**: 
- `id` (path, integer): Employee ID  
**Body**:
```json
{
  "branch_id": 1,
  "email": "employee2updated@example.com",
  "first_name": "Bob",
  "last_name": "Smith",
  "phone": "555-0606",
  "active": 1
}
```
**Returns**: Updated employee object.  
**Response**:
```json
{
  "employee_id": 2,
  "branch_id": 1,
  "email": "employee2updated@example.com",
  "first_name": "Bob",
  "last_name": "Smith",
  "phone": "555-0606",
  "active": 1,
  "added_at": "2025-07-15T14:46:00Z",
  "updated_at": "2025-07-15T14:46:00Z"
}
```

### DELETE /employees/:id 🔐
**Description**: Delete an employee (admin only).  
**Parameters**: 
- `id` (path, integer): Employee ID  
**Returns**: Success message or 404 if not found.  
**Response**:
```json
{
  "message": "Employee deleted successfully"
}
```

### POST /employees/login 👷
**Description**: Authenticate an employee user.  
**Body**:
```json
{
  "email": "employee1@example.com",
  "password": "securepassword"
}
```
**Returns**: JWT token for authentication.  
**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Medicines 💊

### GET /medicines
**Description**: Retrieve a list of all medicines.  
**Parameters**: None  
**Returns**: Array of medicine objects.  
**Response**:
```json
[
  {
    "medicine_id": 1,
    "name": "Paracetamol",
    "brand": "Generic",
    "category": "Analgesic",
    "description": "Pain reliever",
    "created_at": "2025-07-01T12:00:00Z"
  },
  ...
]
```

### GET /medicines/:id
**Description**: Get details of a specific medicine by ID.  
**Parameters**: 
- `id` (path, integer): Medicine ID  
**Returns**: Single medicine object or 404 if not found.  
**Response**:
```json
{
  "medicine_id": 1,
  "name": "Paracetamol",
  "brand": "Generic",
  "category": "Analgesic",
  "description": "Pain reliever",
  "created_at": "2025-07-01T12:00:00Z"
}
```

### POST /medicines 🔐
**Description**: Create a new medicine (admin only).  
**Body**:
```json
{
  "name": "Ibuprofen",
  "brand": "Advil",
  "category": "Analgesic",
  "description": "Anti-inflammatory pain reliever"
}
```
**Returns**: Created medicine object with ID.  
**Response**:
```json
{
  "medicine_id": 2,
  "name": "Ibuprofen",
  "brand": "Advil",
  "category": "Analgesic",
  "description": "Anti-inflammatory pain reliever",
  "created_at": "2025-07-15T14:46:00Z"
}
```

### PUT /medicines/:id 🔐
**Description**: Update an existing medicine (admin only).  
**Parameters**: 
- `id` (path, integer): Medicine ID  
**Body**:
```json
{
  "name": "Ibuprofen",
  "brand": "Advil",
  "category": "NSAID",
  "description": "Updated description"
}
```
**Returns**: Updated medicine object.  
**Response**:
```json
{
  "medicine_id": 2,
  "name": "Ibuprofen",
  "brand": "Advil",
  "category": "NSAID",
  "description": "Updated description",
  "created_at": "2025-07-15T14:46:00Z",
  "updated_at": "2025-07-15T14:46:00Z"
}
```

### DELETE /medicines/:id 🔐
**Description**: Delete a medicine (admin only).  
**Parameters**: 
- `id` (path, integer): Medicine ID  
**Returns**: Success message or 404 if not found.  
**Response**:
```json
{
  "message": "Medicine deleted successfully"
}
```

---

## Medicine Stock 📦

### GET /medicine-stock
**Description**: Retrieve all medicine stock entries.  
**Parameters**: 
- `branch_id` (query, integer, optional): Filter by branch ID  
**Returns**: Array of stock objects.  
**Response**:
```json
[
  {
    "stock_id": 1,
    "branch_id": 1,
    "medicine_id": 1,
    "batch_number": "B123",
    "expiry_date": "2026-12-31",
    "purchase_price": 5.00,
    "selling_price": 7.50,
    "quantity": 100,
    "added_at": "2025-07-01T12:00:00Z"
  },
  ...
]
```

### GET /medicine-stock/:id
**Description**: Get details of a specific stock entry by ID.  
**Parameters**: 
- `id` (path, integer): Stock ID  
**Returns**: Single stock object or 404 if not found.  
**Response**:
```json
{
  "stock_id": 1,
  "branch_id": 1,
  "medicine_id": 1,
  "batch_number": "B123",
  "expiry_date": "2026-12-31",
  "purchase_price": 5.00,
  "selling_price": 7.50,
  "quantity": 100,
  "added_at": "2025-07-01T12:00:00Z"
}
```

### POST /medicine-stock 👷
**Description**: Add a new stock entry (employee or admin).  
**Body**:
```json
{
  "branch_id": 1,
  "medicine_id": 1,
  "batch_number": "B124",
  "expiry_date": "2026-12-31",
  "purchase_price": 5.50,
  "selling_price": 8.00,
  "quantity": 50
}
```
**Returns**: Created stock object with ID.  
**Response**:
```json
{
  "stock_id": 2,
  "branch_id": 1,
  "medicine_id": 1,
  "batch_number": "B124",
  "expiry_date": "2026-12-31",
  "purchase_price": 5.50,
  "selling_price": 8.00,
  "quantity": 50,
  "added_at": "2025-07-15T14:46:00Z"
}
```

### PUT /medicine-stock/:id 👷
**Description**: Update an existing stock entry (employee or admin).  
**Parameters**: 
- `id` (path, integer): Stock ID  
**Body**:
```json
{
  "quantity": 75,
  "selling_price": 8.50
}
```
**Returns**: Updated stock object.  
**Response**:
```json
{
  "stock_id": 2,
  "branch_id": 1,
  "medicine_id": 1,
  "batch_number": "B124",
  "expiry_date": "2026-12-31",
  "purchase_price": 5.50,
  "selling_price": 8.50,
  "quantity": 75,
  "added_at": "2025-07-15T14:46:00Z",
  "updated_at": "2025-07-15T14:46:00Z"
}
```

---

## Suppliers 🚚

### GET /suppliers
**Description**: Retrieve a list of all suppliers.  
**Parameters**: None  
**Returns**: Array of supplier objects.  
**Response**:
```json
[
  {
    "supplier_id": 1,
    "supplier_name": "MediCorp",
    "supplier_phone": "555-0707",
    "supplier_email": "contact@medicorp.com",
    "supplier_address": "123 Supply Rd",
    "created_at": "2025-07-01T12:00:00Z"
  },
  ...
]
```

### GET /suppliers/:id
**Description**: Get details of a specific supplier by ID.  
**Parameters**: 
- `id` (path, integer): Supplier ID  
**Returns**: Single supplier object or 404 if not found.  
**Response**:
```json
{
  "supplier_id": 1,
  "supplier_name": "MediCorp",
  "supplier_phone": "555-0707",
  "supplier_email": "contact@medicorp.com",
  "supplier_address": "123 Supply Rd",
  "created_at": "2025-07-01T12:00:00Z"
}
```

### POST /suppliers 🔐
**Description**: Create a new supplier (admin only).  
**Body**:
```json
{
  "supplier_name": "PharmaCo",
  "supplier_phone": "555-0808",
  "supplier_email": "info@pharmaco.com",
  "supplier_address": "456 Supply St"
}
```
**Returns**: Created supplier object with ID.  
**Response**:
```json
{
  "supplier_id": 2,
  "supplier_name": "PharmaCo",
  "supplier_phone": "555-0808",
  "supplier_email": "info@pharmaco.com",
  "supplier_address": "456 Supply St",
  "created_at": "2025-07-15T14:46:00Z"
}
```

### PUT /suppliers/:id 🔐
**Description**: Update an existing supplier (admin only).  
**Parameters**: 
- `id` (path, integer): Supplier ID  
**Body**:
```json
{
  "supplier_name": "PharmaCo Updated",
  "supplier_phone": "555-0909",
  "supplier_email": "info@pharmaco.com",
  "supplier_address": "789 Supply Ave"
}
```
**Returns**: Updated supplier object.  
**Response**:
```json
{
  "supplier_id": 2,
  "supplier_name": "PharmaCo Updated",
  "supplier_phone": "555-0909",
  "supplier_email": "info@pharmaco.com",
  "supplier_address": "789 Supply Ave",
  "created_at": "2025-07-15T14:46:00Z",
  "updated_at": "2025-07-15T14:46:00Z"
}
```

### DELETE /suppliers/:id 🔐
**Description**: Delete a supplier (admin only).  
**Parameters**: 
- `id` (path, integer): Supplier ID  
**Returns**: Success message or 404 if not found.  
**Response**:
```json
{
  "message": "Supplier deleted successfully"
}
```

---

## Purchases 🛒

### GET /purchases
**Description**: Retrieve all purchase records.  
**Parameters**: 
- `branch_id` (query, integer, optional): Filter by branch ID  
**Returns**: Array of purchase objects.  
**Response**:
```json
[
  {
    "purchase_id": 1,
    "supplier_id": 1,
    "branch_id": 1,
    "employee_id": 1,
    "purchase_date": "2025-07-01T12:00:00Z",
    "total_cost": 500.00
  },
  ...
]
```

### GET /purchases/:id
**Description**: Get details of a specific purchase by ID.  
**Parameters**: 
- `id` (path, integer): Purchase ID  
**Returns**: Single purchase object with items or 404 if not found.  
**Response**:
```json
{
  "purchase_id": 1,
  "supplier_id": 1,
  "branch_id": 1,
  "employee_id": 1,
  "purchase_date": "2025-07-01T12:00:00Z",
  "total_cost": 500.00,
  "items": [
    {
      "purchase_item_id": 1,
      "medicine_id": 1,
      "batch_number": "B123",
      "expiry_date": "2026-12-31",
      "purchase_price": 5.00,
      "quantity": 100
    }
  ]
}
```

### POST /purchases 👷
**Description**: Create a new purchase and update stock (employee or admin).  
**Body**:
```json
{
  "supplier_id": 1,
  "branch_id": 1,
  "employee_id": 1,
  "total_cost": 500.00,
  "items": [
    {
      "medicine_id": 1,
      "batch_number": "B123",
      "expiry_date": "2026-12-31",
      "purchase_price": 5.00,
      "quantity": 100
    }
  ]
}
```
**Returns**: Created purchase object with items.  
**Response**:
```json
{
  "purchase_id": 1,
  "supplier_id": 1,
  "branch_id": 1,
  "employee_id": 1,
  "purchase_date": "2025-07-15T14:46:00Z",
  "total_cost": 500.00,
  "items": [
    {
      "purchase_item_id": 1,
      "medicine_id": 1,
      "batch_number": "B123",
      "expiry_date": "2026-12-31",
      "purchase_price": 5.00,
      "quantity": 100
    }
  ]
}
```

---

## Purchase Items 📋

### GET /purchase-items
**Description**: Retrieve all purchase items.  
**Parameters**: 
- `purchase_id` (query, integer, optional): Filter by purchase ID  
**Returns**: Array of purchase item objects.  
**Response**:
```json
[
  {
    "purchase_item_id": 1,
    "purchase_id": 1,
    "medicine_id": 1,
    "batch_number": "B123",
    "expiry_date": "2026-12-31",
    "purchase_price": 5.00,
    "quantity": 100
  },
  ...
]
```

### GET /purchase-items/:id
**Description**: Get details of a specific purchase item by ID.  
**Parameters**: 
- `id` (path, integer): Purchase Item ID  
**Returns**: Single purchase item object or 404 if not found.  
**Response**:
```json
{
  "purchase_item_id": 1,
  "purchase_id": 1,
  "medicine_id": 1,
  "batch_number": "B123",
  "expiry_date": "2026-12-31",
  "purchase_price": 5.00,
  "quantity": 100
}
```

---

## Sales 💸

### GET /sales
**Description**: Retrieve all sales records.  
**Parameters**: 
- `branch_id` (query, integer, optional): Filter by branch ID  
- `customer_id` (query, integer, optional): Filter by customer ID  
**Returns**: Array of sale objects.  
**Response**:
```json
[
  {
    "sale_id": 1,
    "branch_id": 1,
    "employee_id": 1,
    "customer_id": 1,
    "sale_date": "2025-07-01T12:00:00Z",
    "total_price": 75.00
  },
  ...
]
```

### GET /sales/:id
**Description**: Get details of a specific sale by ID.  
**Parameters**: 
- `id` (path, integer): Sale ID  
**Returns**: Single sale object with items or 404 if not found.  
**Response**:
```json
{
  "sale_id": 1,
  "branch_id": 1,
  "employee_id": 1,
  "customer_id": 1,
  "sale_date": "2025-07-01T12:00:00Z",
  "total_price": 75.00,
  "items": [
    {
      "sale_item_id": 1,
      "medicine_id": 1,
      "quantity": 10,
      "selling_price": 7.50
    }
  ]
}
```

### POST /sales 👷
**Description**: Create a new sale and update stock (employee or admin).  
**Body**:
```json
{
  "branch_id": 1,
  "employee_id": 1,
  "customer_id": 1,
  "total_price": 75.00,
  "items": [
    {
      "medicine_id": 1,
      "quantity": 10,
      "selling_price": 7.50
    }
  ]
}
```
**Returns**: Created sale object with items.  
**Response**:
```json
{
  "sale_id": 1,
  "branch_id": 1,
  "employee_id": 1,
  "customer_id": 1,
  "sale_date": "2025-07-15T14:46:00Z",
  "total_price": 75.00,
  "items": [
    {
      "sale_item_id": 1,
      "medicine_id": 1,
      "quantity": 10,
      "selling_price": 7.50
    }
  ]
}
```

---

## Sale Items 📋

### GET /sale-items
**Description**: Retrieve all sale items.  
**Parameters**: 
- `sale_id` (query, integer, optional): Filter by sale ID  
**Returns**: Array of sale item objects.  
**Response**:
```json
[
  {
    "sale_item_id": 1,
    "sale_id": 1,
    "medicine_id": 1,
    "quantity": 10,
    "selling_price": 7.50
  },
  ...
]
```

### GET /sale-items/:id
**Description**: Get details of a specific sale item by ID.  
**Parameters**: 
- `id` (path, integer): Sale Item ID  
**Returns**: Single sale item object or 404 if not found.  
**Response**:
```json
{
  "sale_item_id": 1,
  "sale_id": 1,
  "medicine_id": 1,
  "quantity": 10,
  "selling_price": 7.50
}
```

---

## Recurring Purchases 🔄

### GET /recurring-purchases
**Description**: Retrieve all recurring purchase schedules.  
**Parameters**: 
- `customer_id` (query, integer, optional): Filter by customer ID  
**Returns**: Array of recurring purchase objects.  
**Response**:
```json
[
  {
    "recurring_id": 1,
    "customer_id": 1,
    "medicine_id": 1,
    "interval_days": 30,
    "start_date": "2025-07-01",
    "last_purchase_date": "2025-07-01T12:00:00Z",
    "active": 1,
    "created_at": "2025-07-01T12:00:00Z"
  },
  ...
]
```

### GET /recurring-purchases/:id
**Description**: Get details of a specific recurring purchase by ID.  
**Parameters**: 
- `id` (path, integer): Recurring Purchase ID  
**Returns**: Single recurring purchase object or 404 if not found.  
**Response**:
```json
{
  "recurring_id": 1,
  "customer_id": 1,
  "medicine_id": 1,
  "interval_days": 30,
  "start_date": "2025-07-01",
  "last_purchase_date": "2025-07-01T12:00:00Z",
  "active": 1,
  "created_at": "2025-07-01T12:00:00Z"
}
```

### POST /recurring-purchases 👷
**Description**: Create a new recurring purchase schedule (employee or admin).  
**Body**:
```json
{
  "customer_id": 1,
  "medicine_id": 1,
  "interval_days": 30,
  "start_date": "2025-07-15",
  "active": 1
}
```
**Returns**: Created recurring purchase object with ID.  
**Response**:
```json
{
  "recurring_id": 1,
  "customer_id": 1,
  "medicine_id": 1,
  "interval_days": 30,
  "start_date": "2025-07-15",
  "last_purchase_date": null,
  "active": 1,
  "created_at": "2025-07-15T14:46:00Z"
}
```

### PUT /recurring-purchases/:id 👷
**Description**: Update an existing recurring purchase schedule (employee or admin).  
**Parameters**: 
- `id` (path, integer): Recurring Purchase ID  
**Body**:
```json
{
  "interval_days": 60,
  "active": 0
}
```
**Returns**: Updated recurring purchase object.  
**Response**:
```json
{
  "recurring_id": 1,
  "customer_id": 1,
  "medicine_id": 1,
  "interval_days": 60,
  "start_date": "2025-07-15",
  "last_purchase_date": null,
  "active": 0,
  "created_at": "2025-07-15T14:46:00Z",
  "updated_at": "2025-07-15T14:46:00Z"
}
```

### DELETE /recurring-purchases/:id 🔐
**Description**: Delete a recurring purchase schedule (admin only).  
**Parameters**: 
- `id` (path, integer): Recurring Purchase ID  
**Returns**: Success message or 404 if not found.  
**Response**:
```json
{
  "message": "Recurring purchase deleted successfully"
}
```

---

## Supplier Credits 💳

### GET /supplier-credits
**Description**: Retrieve all supplier credit records.  
**Parameters**: 
- `supplier_id` (query, integer, optional): Filter by supplier ID  
- `branch_id` (query, integer, optional): Filter by branch ID  
**Returns**: Array of supplier credit objects.  
**Response**:
```json
[
  {
    "credit_id": 1,
    "supplier_id": 1,
    "purchase_id": 1,
    "branch_id": 1,
    "credit_amount": 500.00,
    "credit_date": "2025-07-01T12:00:00Z",
    "due_date": "2025-08-01",
    "paid_amount": 200.00,
    "status": "partially_paid",
    "created_at": "2025-07-01T12:00:00Z",
    "updated_at": "2025-07-15T14:46:00Z"
  },
  ...
]
```

### GET /supplier-credits/:id
**Description**: Get details of a specific supplier credit by ID.  
**Parameters**: 
- `id` (path, integer): Credit ID  
**Returns**: Single supplier credit object with payment details or 404 if not found.  
**Response**:
```json
{
  "credit_id": 1,
  "supplier_id": 1,
  "purchase_id": 1,
  "branch_id": 1,
  "credit_amount": 500.00,
  "credit_date": "2025-07-01T12:00:00Z",
  "due_date": "2025-08-01",
  "paid_amount": 200.00,
  "status": "partially_paid",
  "created_at": "2025-07-01T12:00:00Z",
  "updated_at": "2025-07-15T14:46:00Z",
  "payments": [
    {
      "payment_id": 1,
      "payment_amount": 200.00,
      "payment_date": "2025-07-10T12:00:00Z",
      "created_at": "2025-07-10T12:00:00Z"
    }
  ]
}
```

### POST /supplier-credits 👷
**Description**: Create a new supplier credit (employee or admin).  
**Body**:
```json
{
  "supplier_id": 1,
  "purchase_id": 1,
  "branch_id": 1,
  "credit_amount": 500.00,
  "credit_date": "2025-07-15T14:46:00Z",
  "due_date": "2025-08-15",
  "status": "pending"
}
```
**Returns**: Created supplier credit object.  
**Response**:
```json
{
  "credit_id": 1,
  "supplier_id": 1,
  "purchase_id": 1,
  "branch_id": 1,
  "credit_amount": 500.00,
  "credit_date": "2025-07-15T14:46:00Z",
  "due_date": "2025-08-15",
  "paid_amount": 0.00,
  "status": "pending",
  "created_at": "2025-07-15T14:46:00Z",
  "updated_at": "2025-07-15T14:46:00Z"
}
```

---

## Credit Payments 💰

### GET /credit-payments
**Description**: Retrieve all credit payment records.  
**Parameters**: 
- `credit_id` (query, integer, optional): Filter by credit ID  
**Returns**: Array of credit payment objects.  
**Response**:
```json
[
  {
    "payment_id": 1,
    "credit_id": 1,
    "payment_amount": 200.00,
    "payment_date": "2025-07-10T12:00:00Z",
    "created_at": "2025-07-10T12:00:00Z"
  },
  ...
]
```

### GET /credit-payments/:id
**Description**: Get details of a specific credit payment by ID.  
**Parameters**: 
- `id` (path, integer): Payment ID  
**Returns**: Single credit payment object or 404 if not found.  
**Response**:
```json
{
  "payment_id": 1,
  "credit_id": 1,
  "payment_amount": 200.00,
  "payment_date": "2025-07-10T12:00:00Z",
  "created_at": "2025-07-10T12:00:00Z"
}
```

### POST /credit-payments 👷
**Description**: Record a new payment toward a supplier credit (employee or admin).  
**Body**:
```json
{
  "credit_id": 1,
  "payment_amount": 200.00,
  "payment_date": "2025-07-15T14:46:00Z"
}
```
**Returns**: Created credit payment object and updated supplier credit status.  
**Response**:
```json
{
  "payment_id": 1,
  "credit_id": 1,
  "payment_amount": 200.00,
  "payment_date": "2025-07-15T14:46:00Z",
  "created_at": "2025-07-15T14:46:00Z",
  "credit_status": {
    "credit_id": 1,
    "paid_amount": 200.00,
    "status": "partially_paid"
  }
}
```

---

## Employee Payments 💵

### GET /employee-payments
**Description**: Retrieve all employee payment records.  
**Parameters**: 
- `employee_id` (query, integer, optional): Filter by employee ID  
- `branch_id` (query, integer, optional): Filter by branch ID  
**Returns**: Array of employee payment objects.  
**Response**:
```json
[
  {
    "payment_id": 1,
    "employee_id": 1,
    "branch_id": 1,
    "payment_amount": 1500.00,
    "payment_type": "salary",
    "payment_date": "2025-07-01T12:00:00Z",
    "description": "Salary for July 2025",
    "created_at": "2025-07-01T12:00:00Z",
    "updated_at": null
  },
  ...
]
```

### GET /employee-payments/:id
**Description**: Get details of a specific employee payment by ID.  
**Parameters**: 
- `id` (path, integer): Payment ID  
**Returns**: Single employee payment object or 404 if not found.  
**Response**:
```json
{
  "payment_id": 1,
  "employee_id": 1,
  "branch_id": 1,
  "payment_amount": 1500.00,
  "payment_type": "salary",
  "payment_date": "2025-07-01T12:00:00Z",
  "description": "Salary for July 2025",
  "created_at": "2025-07-01T12:00:00Z",
  "updated_at": null
}
```

### POST /employee-payments 🔐
**Description**: Record a new employee payment (admin only).  
**Body**:
```json
{
  "employee_id": 1,
  "branch_id": 1,
  "payment_amount": 1500.00,
  "payment_type": "salary",
  "payment_date": "2025-07-15T14:46:00Z",
  "description": "Salary for July 2025"
}
```
**Returns**: Created employee payment object.  
**Response**:
```json
{
  "payment_id": 1,
  "employee_id": 1,
  "branch_id": 1,
  "payment_amount": 1500.00,
  "payment_type": "salary",
  "payment_date": "2025-07-15T14:46:00Z",
  "description": "Salary for July 2025",
  "created_at": "2025-07-15T14:46:00Z",
  "updated_at": null
}
```

### PUT /employee-payments/:id 🔐
**Description**: Update an existing employee payment (admin only).  
**Parameters**: 
- `id` (path, integer): Payment ID  
**Body**:
```json
{
  "payment_amount": 1600.00,
  "description": "Updated salary for July 2025"
}
```
**Returns**: Updated employee payment object.  
**Response**:
```json
{
  "payment_id": 1,
  "employee_id": 1,
  "branch_id": 1,
  "payment_amount": 1600.00,
  "payment_type": "salary",
  "payment_date": "2025-07-15T14:46:00Z",
  "description": "Updated salary for July 2025",
  "created_at": "2025-07-15T14:46:00Z",
  "updated_at": "2025-07-15T14:46:00Z"
}
```

### DELETE /employee-payments/:id 🔐
**Description**: Delete an employee payment (admin only).  
**Parameters**: 
- `id` (path, integer): Payment ID  
**Returns**: Success message or 404 if not found.  
**Response**:
```json
{
  "message": "Employee payment deleted successfully"
}
```

---

## Reports 📊

### GET /reports
**Description**: Retrieve all reports.  
**Parameters**: 
- `branch_id` (query, integer, optional): Filter by branch ID  
- `report_type` (query, string, optional): Filter by report type (e.g., 'daily_sales')  
**Returns**: Array of report objects.  
**Response**:
```json
[
  {
    "report_id": 1,
    "branch_id": 1,
    "report_type": "daily_sales",
    "generated_at": "2025-07-01T12:00:00Z",
    "notes": "Sales report for 2025-07-01"
  },
  ...
]
```

### GET /reports/:id
**Description**: Get details of a specific report by ID.  
**Parameters**: 
- `id` (path, integer): Report ID  
**Returns**: Single report object or 404 if not found.  
**Response**:
```json
{
  "report_id": 1,
  "branch_id": 1,
  "report_type": "daily_sales",
  "generated_at": "2025-07-01T12:00:00Z",
  "notes": "Sales report for 2025-07-01"
}
```

### POST /reports 🔐
**Description**: Generate a new report (admin only).  
**Body**:
```json
{
  "branch_id": 1,
  "report_type": "daily_sales",
  "notes": "Sales report for 2025-07-15"
}
```
**Returns**: Created report object.  
**Response**:
```json
{
  "report_id": 1,
  "branch_id": 1,
  "report_type": "daily_sales",
  "generated_at": "2025-07-15T14:46:00Z",
  "notes": "Sales report for 2025-07-15"
}
```

---

## Logs 📜

### GET /logs
**Description**: Retrieve all log entries (admin only).  
**Parameters**: 
- `user_type` (query, string, optional): Filter by user type ('admin', 'employee')  
- `user_id` (query, integer, optional): Filter by user ID  
**Returns**: Array of log objects.  
**Response**:
```json
[
  {
    "log_id": 1,
    "user_type": "admin",
    "user_id": 1,
    "action": "employee_payment_added",
    "description": "Added payment of 1500.00 for employee ID 1",
    "created_at": "2025-07-15T14:46:00Z"
  },
  ...
]
```

### GET /logs/:id
**Description**: Get details of a specific log entry by ID (admin only).  
**Parameters**: 
- `id` (path, integer): Log ID  
**Returns**: Single log object or 404 if not found.  
**Response**:
```json
{
  "log_id": 1,
  "user_type": "admin",
  "user_id": 1,
  "action": "employee_payment_added",
  "description": "Added payment of 1500.00 for employee ID 1",
  "created_at": "2025-07-15T14:46:00Z"
}
```

---

## Error Responses 🚨
All endpoints return standard error responses for invalid requests or server issues:
- **400 Bad Request**:
  ```json
  {
    "error": "Invalid input: missing required field"
  }
  ```
- **401 Unauthorized**:
  ```json
  {
    "error": "Authentication required"
  }
  ```
- **403 Forbidden**:
  ```json
  {
    "error": "Insufficient permissions"
  }
  ```
- **404 Not Found**:
  ```json
  {
    "error": "Resource not found"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "error": "Internal server error"
  }
  ```

---

## Notes 📝
- **Timestamps**: All `created_at` and `updated_at` fields are in UTC (ISO 8601 format).
- **Validation**: Ensure valid foreign keys (e.g., `branch_id`, `employee_id`) and positive quantities/prices.
- **Stock Updates**: POST `/purchases` and POST `/sales` automatically update `medicine_stock.quantity`.
- **Credit Status**: POST `/credit-payments` updates `supplier_credits.paid_amount` and `status`.
- **Logging**: All POST, PUT, and DELETE operations are logged in the `logs` table.

Happy coding and managing your pharmacy! 🌟
