# Setup Instructions

## Backend Setup

1. **Install backend dependencies:**
```bash
cd backend
npm install
```

2. **Create `.env` file in backend folder:**
```bash
MONGODB_URI=mongodb://localhost:27017/pharmatrace
PORT=5000
```

3. **Start Local MongoDB:**
   - **Windows:** `net start MongoDB` (or check Services)
   - **Mac:** `brew services start mongodb-community`
   - **Linux:** `sudo systemctl start mongod`
   - See `LOCAL_MONGODB_SETUP.md` for detailed installation instructions

4. **Start the backend server:**
```bash
cd backend
npm start
```

The backend will run on `http://localhost:5000`

## Frontend Setup

1. **Install frontend dependencies (if not already done):**
```bash
cd frontend
npm install
```

2. **Create `.env` file in frontend folder (optional):**
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Start the frontend:**
```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000`

## How It Works

1. **Product Creation Flow:**
   - Supplier creates a product → Saved to blockchain + synced to MongoDB
   - Manufacturer manufactures product → Updated on blockchain + synced to MongoDB
   - Other participants update product → Synced to MongoDB

2. **Product Verification:**
   - User scans QR code or enters batch number
   - System first checks MongoDB database (fast)
   - If not found, checks blockchain (slower but authoritative)
   - If found on blockchain, syncs to MongoDB for future lookups

3. **Benefits:**
   - Faster lookups from database
   - Blockchain remains source of truth
   - Automatic synchronization
   - Better error handling and user experience

## Troubleshooting

### Product Not Found Error

If you get "Product not found" error:

1. **Check if product exists:**
   - Make sure the product was created by Supplier first
   - Then manufactured by Manufacturer
   - Use the exact batch number from the form

2. **Check backend connection:**
   - Make sure backend server is running
   - Check MongoDB connection
   - Verify API URL in frontend `.env`

3. **Check blockchain:**
   - Ensure MetaMask is connected
   - Verify you're on the correct network (Hardhat local: chainId 31337)
   - Check contract address is correct

4. **Manual sync:**
   - If product exists on blockchain but not in database, the Verify page will automatically sync it
