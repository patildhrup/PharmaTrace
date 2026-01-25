# Quick Fix Guide

## Issue
The Hardhat node is running with the old contract that doesn't have the `getProductStatus()` function. This causes the "BAD_DATA" errors.

## Solution

### Step 1: Stop the Current Hardhat Node
In the terminal running `npx hardhat node`, press `Ctrl+C` to stop it.

### Step 2: Restart Hardhat Node
```bash
npx hardhat node
```

### Step 3: Redeploy the Contract
In a new terminal:
```bash
npx hardhat ignition deploy ignition/modules/PharmaSupplyChain.js --network localhost --reset
```

### Step 4: Assign Roles
```bash
npx hardhat run scripts/assignRoles.js --network localhost
```

### Step 5: Test the Flow
```bash
npx hardhat run scripts/testBatch12.js --network localhost
```

### Step 6: Verify in Browser
Visit: `http://localhost:3000/verify/12`

---

## Why This Happened
The Hardhat node keeps the blockchain state in memory. When we updated the contract code, the running node still had the old contract deployed. Restarting the node gives us a fresh blockchain to deploy the new contract.

## After Redeployment
- ✅ `getProductStatus()` will work
- ✅ Status tracking will display correctly
- ✅ BatchStatusTracker component will show real-time updates
- ✅ QR code verification will show complete information
