@echo off
echo ========================================
echo PharmaTrace - Fresh Deployment Script
echo ========================================
echo.

echo Step 1: Compiling contracts...
call npx hardhat compile
if %errorlevel% neq 0 (
    echo ERROR: Compilation failed!
    pause
    exit /b 1
)
echo ✓ Compilation successful
echo.

echo Step 2: Deploying contract to localhost...
call npx hardhat ignition deploy ignition/modules/PharmaSupplyChain.js --network localhost --reset
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)
echo ✓ Deployment successful
echo.

echo Step 3: Assigning roles to test accounts...
call npx hardhat run scripts/assignRoles.js --network localhost
if %errorlevel% neq 0 (
    echo ERROR: Role assignment failed!
    pause
    exit /b 1
)
echo ✓ Roles assigned
echo.

echo Step 4: Creating test batch '12'...
call npx hardhat run scripts/testBatch12.js --network localhost
if %errorlevel% neq 0 (
    echo ERROR: Test batch creation failed!
    pause
    exit /b 1
)
echo ✓ Test batch created
echo.

echo ========================================
echo ✓ ALL STEPS COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Your application is ready to test!
echo.
echo Frontend: http://localhost:3000
echo Verify Batch 12: http://localhost:3000/verify/12
echo.
pause
