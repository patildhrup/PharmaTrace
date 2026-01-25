# Troubleshooting Guide

## Common Errors and Solutions

### 1. "Cannot find module" errors

**Error:** `Cannot find module 'dotenv'` or `Cannot find module 'ethers'`

**Solution:**
```bash
cd backend
npm install
```

### 2. MongoDB Connection Error

**Error:** `❌ MongoDB connection error: ...`

**Solutions:**

**Option A: Use Local MongoDB**
1. Make sure MongoDB is installed and running:
```bash
# Windows
net start MongoDB

# Or check if it's running
mongod
```

2. Update `.env` file in backend folder:
```
MONGODB_URI=mongodb://localhost:27017/pharmatrace
```

**Note:** This project uses **local MongoDB** by default. See `LOCAL_MONGODB_SETUP.md` for installation and setup instructions.

### 3. Backend Server Not Starting

**Error:** `Port 5000 already in use` or server won't start

**Solution:**
1. Change port in `backend/.env`:
```
PORT=5001
```

2. Update frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5001/api
```

### 4. Frontend API Call Errors

**Error:** `Failed to fetch` or `Network error`

**Solutions:**
1. Make sure backend is running:
```bash
cd backend
npm start
```

2. Check CORS - backend should have CORS enabled (already configured)

3. Check API URL in frontend:
   - Default: `http://localhost:5000/api`
   - Can be set in `frontend/.env` as `REACT_APP_API_URL`

4. Check browser console for specific error

### 5. "Product not found" Error

**Possible causes:**
1. Product was never created on blockchain
2. Product exists but not synced to database
3. Wrong batch number

**Solutions:**
1. **Create product first:**
   - Login as Supplier → Create product
   - Login as Manufacturer → Manufacture product

2. **Check if product exists:**
   - Go to Recent Activities
   - Look for the batch number used

3. **Manual sync:**
   - The Verify page will auto-sync from blockchain to database
   - Just visit the verify page with correct batch number

### 6. TypeScript/Import Errors in Frontend

**Error:** `Cannot find module '../services/api'`

**Solution:**
1. Make sure `frontend/src/services/api.ts` exists
2. Restart frontend dev server:
```bash
cd frontend
npm start
```

### 7. Blockchain Connection Errors

**Error:** `Please connect your MetaMask wallet`

**Solutions:**
1. Make sure MetaMask is installed
2. Connect to Hardhat local network (chainId: 31337)
3. Make sure Hardhat node is running:
```bash
npx hardhat node
```

### 8. Module Resolution Errors

**Error:** `Module not found` or `Cannot resolve`

**Solution:**
```bash
# In backend
cd backend
npm install

# In frontend  
cd frontend
npm install
```

## Quick Health Checks

### Check Backend:
```bash
curl http://localhost:5000/api/health
# Should return: {"status":"OK","message":"PharmaTrace API is running"}
```

### Check MongoDB:
```bash
# Try connecting with mongo shell
mongo mongodb://localhost:27017/pharmatrace
```

### Check Frontend API Service:
- Open browser console
- Check Network tab for API calls
- Look for 404 or CORS errors

## Step-by-Step Startup

1. **Start MongoDB:**
```bash
# Local MongoDB
mongod

# Or ensure MongoDB service is running (Windows)
```

2. **Start Backend:**
```bash
cd backend
npm install  # If not done already
npm start
# Should see: ✅ Connected to MongoDB
# Should see: 🚀 Server running on port 5000
```

3. **Start Frontend:**
```bash
cd frontend
npm start
# Should open http://localhost:3000
```

4. **Test:**
- Visit: http://localhost:3000/verify/TEST-BATCH-001
- Should show "Product not found" (expected if not created)
- Create a product first, then verify

## Still Having Issues?

1. **Check all error messages** in:
   - Backend console (terminal where backend is running)
   - Frontend console (browser DevTools)
   - Browser Network tab

2. **Verify all services are running:**
   - MongoDB ✓
   - Backend server ✓
   - Frontend dev server ✓
   - Hardhat node (for blockchain) ✓

3. **Check file structure:**
```
backend/
  ├── server.js
  ├── models/
  │   └── Product.js
  ├── routes/
  │   ├── products.js
  │   └── batches.js
  └── package.json

frontend/
  └── src/
      └── services/
          └── api.ts
```
