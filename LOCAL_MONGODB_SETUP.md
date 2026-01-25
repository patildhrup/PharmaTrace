# Local MongoDB Setup Guide

This guide will help you set up and use **local MongoDB** for the PharmaTrace backend.

## Step 1: Install MongoDB Community Edition

### Windows:

1. **Download MongoDB:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI, and your Windows version
   - Download and run the installer

2. **Install MongoDB:**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service (recommended)
   - Install MongoDB Compass (optional GUI tool)

3. **Verify Installation:**
   ```bash
   # Check if MongoDB service is running
   net start MongoDB
   
   # Or check in Services (services.msc)
   # Look for "MongoDB" service
   ```

### Mac (using Homebrew):

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community
```

### Linux (Ubuntu/Debian):

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Step 2: Verify MongoDB is Running

### Windows:
```bash
# Check service status
net start MongoDB

# Or test connection
mongosh mongodb://localhost:27017
```

### Mac/Linux:
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Or test connection
mongosh mongodb://localhost:27017
```

If MongoDB is running, you should see a MongoDB shell prompt.

## Step 3: Configure Backend

1. **Create `.env` file in `backend` folder:**
   ```bash
   cd backend
   ```

2. **Create `.env` file with this content:**
   ```
   MONGODB_URI=mongodb://localhost:27017/pharmatrace
   PORT=5000
   ```

   The `.env` file is already created with these settings!

## Step 4: Test MongoDB Connection

```bash
cd backend
node check-setup.js
```

You should see:
```
✅ MongoDB connection successful!
✅ All checks passed! Backend should work correctly.
```

## Step 5: Start Backend Server

```bash
cd backend
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

## Troubleshooting

### MongoDB Service Won't Start (Windows)

1. **Check if MongoDB is installed:**
   ```bash
   # Look for MongoDB in Program Files
   dir "C:\Program Files\MongoDB"
   ```

2. **Start MongoDB manually:**
   ```bash
   # Navigate to MongoDB bin directory
   cd "C:\Program Files\MongoDB\Server\7.0\bin"
   
   # Start MongoDB
   mongod --dbpath "C:\data\db"
   ```
   
   Note: Create `C:\data\db` folder if it doesn't exist

3. **Install as Windows Service:**
   ```bash
   mongod --install --serviceName "MongoDB" --serviceDisplayName "MongoDB" --serviceDescription "MongoDB Database Server"
   net start MongoDB
   ```

### Connection Refused Error

**Error:** `MongoServerError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions:**
1. Make sure MongoDB is running:
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```

2. Check if port 27017 is available:
   ```bash
   # Windows
   netstat -an | findstr 27017
   
   # Mac/Linux
   lsof -i :27017
   ```

3. Verify MongoDB configuration:
   - Default port: 27017
   - Default host: localhost (127.0.0.1)

### Database Not Found

**Note:** MongoDB will automatically create the `pharmatrace` database when you first save data. You don't need to create it manually.

### Check MongoDB Data

You can use MongoDB Compass (GUI tool) to view your data:
1. Download: https://www.mongodb.com/try/download/compass
2. Connect to: `mongodb://localhost:27017`
3. View `pharmatrace` database and `products` collection

Or use MongoDB shell:
```bash
mongosh mongodb://localhost:27017/pharmatrace
> show dbs
> use pharmatrace
> db.products.find()
```

## Quick Commands Reference

### Start MongoDB:
```bash
# Windows (as service)
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Manual start (any OS)
mongod --dbpath /path/to/data/db
```

### Stop MongoDB:
```bash
# Windows
net stop MongoDB

# Mac
brew services stop mongodb-community

# Linux
sudo systemctl stop mongod
```

### Check MongoDB Status:
```bash
# Windows
sc query MongoDB

# Mac/Linux
sudo systemctl status mongod
```

## Default Settings

- **Host:** localhost (127.0.0.1)
- **Port:** 27017
- **Database:** pharmatrace
- **Connection String:** `mongodb://localhost:27017/pharmatrace`

## Next Steps

Once MongoDB is running:
1. ✅ Backend will automatically connect
2. ✅ Products will be saved to local MongoDB
3. ✅ Verify page will check database first
4. ✅ All data stored locally on your machine

No need for MongoDB Atlas or cloud services! Everything runs locally.
