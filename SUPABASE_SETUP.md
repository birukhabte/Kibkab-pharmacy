# Supabase Setup Guide for Pharmacy App

## Overview

This project has been configured to use Supabase PostgreSQL database. Supabase provides a free PostgreSQL database with 500MB storage, perfect for development and small production apps.

## Step 1: Create Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free)
3. Click "New Project"
4. Fill in the details:
   - **Name**: `pharmacy-app` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine
5. Click "Create new project"
6. Wait 2-3 minutes for project to be ready

## Step 2: Get Database Connection Details

1. In your Supabase dashboard, click on your project
2. Go to **Settings** (gear icon in sidebar)
3. Click **Database** in the settings menu
4. Scroll to **Connection string** section
5. Select **URI** tab and copy the connection string

It will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## Step 3: Configure Backend Environment

Update `backend/.env` with your Supabase credentials:

```env
# Supabase PostgreSQL Database Configuration
DB_USER=postgres
DB_PASSWORD=your_actual_supabase_password
DB_HOST=db.abcdefghijklmnop.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_SSLMODE=require

# JWT Secret (generate a random string)
JWT_SECRET=your_secure_random_jwt_secret_here

# Server Port
PORT=8080

# Frontend URLs for CORS
FRONTEND=http://localhost:5173
FRONTEND2=http://localhost:3000
```

**Important Notes:**
- Replace `your_actual_supabase_password` with the password you set when creating the project
- Replace `db.abcdefghijklmnop.supabase.co` with your actual Supabase host
- Keep `DB_SSLMODE=require` for Supabase (it requires SSL)
- Generate a secure JWT_SECRET (you can use: `openssl rand -base64 32`)

## Step 4: Enable Database Migrations

Edit `backend/cmd/server/main.go` and uncomment the migration line:

```go
func init() {
    // config.LoadEnvVariable()  // Optional: uncomment for strict env validation
    db.ConnectToDb()
    db.MigrateTables()  // ← UNCOMMENT THIS LINE
}
```

This will automatically create all necessary tables on first run.

## Step 5: Install Backend Dependencies

```bash
cd backend
go mod tidy
```

## Step 6: Start the Backend

```bash
cd backend
make run
```

You should see:
```
Successfully connected to PostgreSQL DB
Successfully migrated model:...
Server starting ...
```

The backend will be running on http://localhost:8080

## Step 7: Start the Frontend

```bash
cd client
npm run dev
```

The frontend will be running on http://localhost:5173

## Verify Connection

1. Open http://localhost:5173 in your browser
2. The app should load (not stuck on "Loading...")
3. Check Supabase dashboard > Table Editor to see created tables

## Supabase Dashboard Features

### Table Editor
- View and edit data directly
- Located at: Dashboard > Table Editor
- You'll see all your pharmacy tables here

### SQL Editor
- Run custom SQL queries
- Located at: Dashboard > SQL Editor
- Useful for seeding initial data

### Database Backups
- Automatic daily backups (paid plans)
- Manual backups available
- Located at: Settings > Database > Backups

## Seeding Initial Data (Optional)

You can add initial data through Supabase SQL Editor:

1. Go to Dashboard > SQL Editor
2. Click "New query"
3. Add your seed data, for example:

```sql
-- Create initial admin role
INSERT INTO roles (id, name, commission, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Admin',
  0.00,
  NOW(),
  NOW()
);

-- Create initial permissions
INSERT INTO permissions (id, name, description, created_at)
VALUES 
  (gen_random_uuid(), 'manage_employees', 'Can create, update, and delete employees', NOW()),
  (gen_random_uuid(), 'manage_inventory', 'Can manage medicine inventory', NOW()),
  (gen_random_uuid(), 'create_sales', 'Can create sales transactions', NOW()),
  (gen_random_uuid(), 'view_reports', 'Can view reports and analytics', NOW());
```

4. Click "Run" to execute

## Troubleshooting

### "Unable to connect to DB" error
- Verify your DB_PASSWORD is correct
- Check DB_HOST matches your Supabase project
- Ensure DB_SSLMODE=require (not disable)
- Check if your IP is allowed (Supabase allows all by default)

### Frontend stuck on "Loading..."
- Ensure backend is running on port 8080
- Check `client/.env` has `VITE_API_BASE_URL=http://localhost:8080/api`
- Restart frontend after changing .env
- Check browser console for errors

### Tables not created
- Make sure `db.MigrateTables()` is uncommented in `main.go`
- Check backend logs for migration errors
- Verify database connection is successful

### SSL/TLS errors
- Always use `DB_SSLMODE=require` for Supabase
- Don't use `disable` or `prefer`

## Connection Limits

Supabase Free Tier:
- **Direct connections**: Limited (use connection pooling for production)
- **Pooled connections**: Unlimited
- For production, consider using Supabase's connection pooler

To use connection pooler, update your connection string:
```env
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=6543
```

## Monitoring

Monitor your database usage:
1. Go to Dashboard > Database
2. Check **Database Health** section
3. Monitor:
   - Storage usage
   - Connection count
   - Query performance

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use strong passwords** - For both database and JWT secret
3. **Enable Row Level Security (RLS)** in Supabase for production
4. **Rotate JWT secrets** periodically
5. **Use environment variables** for production deployment

## Production Deployment

When deploying to production:

1. **Update CORS origins** in `backend/router/router.go`:
   ```go
   AllowOrigins: []string{
       os.Getenv("FRONTEND"),
       os.Getenv("FRONTEND2"),
       "https://your-production-domain.com",
   },
   ```

2. **Set production environment variables** on your hosting platform

3. **Consider upgrading Supabase plan** for:
   - More storage
   - Better performance
   - Automatic backups
   - Point-in-time recovery

## Useful Supabase Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [GORM Documentation](https://gorm.io/docs/)

## Need Help?

- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
- Supabase Support: support@supabase.io
- Check backend logs for detailed error messages
