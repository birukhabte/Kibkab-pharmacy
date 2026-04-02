# Get Your Supabase Database Password

You provided the Supabase URL and publishable key, but we need the **database password** to connect from the backend.

## How to Get Database Password

### Option 1: From Your Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Click on your project: `xvdtsooamkwcjlirnoug`
3. Click **Settings** (⚙️) in the left sidebar
4. Click **Database**
5. Scroll to **Connection string** section
6. Look for **Connection pooling** or **Direct connection**
7. You'll see a connection string like:

```
postgresql://postgres:[YOUR-PASSWORD]@db.xvdtsooamkwcjlirnoug.supabase.co:5432/postgres
```

The `[YOUR-PASSWORD]` part is what we need!

### Option 2: Reset Database Password

If you don't remember the password:

1. Go to Settings > Database
2. Scroll to **Database password** section
3. Click **Reset database password**
4. Enter a new password
5. Click **Save**
6. Copy the new password

## Update .env File

Once you have the password, update `backend/.env`:

```env
DB_PASSWORD=your_actual_database_password_here
```

## Then Start Backend

```bash
cd backend
go mod tidy
make run
```

## Already Configured

I've already set up:
- ✅ DB_HOST=db.xvdtsooamkwcjlirnoug.supabase.co
- ✅ DB_USER=postgres
- ✅ DB_NAME=postgres
- ✅ DB_PORT=5432
- ✅ DB_SSLMODE=require

You just need to add the correct DB_PASSWORD!
