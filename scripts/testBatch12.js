const hre = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    console.log("🧪 Testing Supply Chain Flow with Batch '12'\n");

    const PharmaSupplyChain = await hre.ethers.getContractAt("PharmaSupplyChain", contractAddress);
    const accounts = await hre.ethers.getSigners();

    // Account roles (already assigned)
    const supplier = accounts[0];
    const manufacturer = accounts[1];
    const distributor = accounts[2];
    const transporter = accounts[3];
    const retailer = accounts[4];

    const batchNumber = "12";
    const productId = hre.ethers.id(batchNumber);

    console.log("📦 Step 1: Supplier creates product");
    console.log("   Batch Number:", batchNumber);
    console.log("   Product ID:", productId);

    try {
        const tx1 = await PharmaSupplyChain.connect(supplier).createProduct(
            productId,
            "Test Medicine Batch 12",
            JSON.stringify({
                rawMaterial: "Active Pharmaceutical Ingredient",
                quantity: "1000kg",
                supplier: "Test Supplier Co."
            })
        );
        await tx1.wait();
        console.log("   ✅ Product created! Status: PENDING\n");

        // Check status
        const [status1, participant1, location1, stage1] = await PharmaSupplyChain.getProductStatus(productId);
        console.log("   Current Status:", ["Pending", "InProgress", "Completed"][status1]);
        console.log("   Current Location:", location1);
        console.log("   Current Stage:", ["Created", "Manufactured", "WithDistributor", "InTransport", "WithRetailer", "Sold"][stage1]);

    } catch (error) {
        console.error("   ❌ Error:", error.message);
    }

    console.log("\n🚚 Step 2: Transporter picks up from Supplier");
    try {
        const tx2 = await PharmaSupplyChain.connect(transporter).transporterPickup(
            productId,
            "Supplier Facility",
            "Manufacturing Facility",
            JSON.stringify({
                vehicleId: "TR-001",
                departureTime: new Date().toISOString()
            })
        );
        await tx2.wait();
        console.log("   ✅ Pickup recorded! Status: IN_PROGRESS\n");

        const [status2, participant2, location2, stage2] = await PharmaSupplyChain.getProductStatus(productId);
        console.log("   Current Status:", ["Pending", "InProgress", "Completed"][status2]);
        console.log("   Current Location:", location2);

    } catch (error) {
        console.error("   ❌ Error:", error.message);
    }

    console.log("\n🎯 Step 3: Transporter delivers to Manufacturer");
    try {
        const tx3 = await PharmaSupplyChain.connect(transporter).transporterDeliver(
            productId,
            "Manufacturing Facility",
            JSON.stringify({
                vehicleId: "TR-001",
                arrivalTime: new Date().toISOString()
            })
        );
        await tx3.wait();
        console.log("   ✅ Delivery completed! Status: COMPLETED\n");

        const [status3, participant3, location3, stage3] = await PharmaSupplyChain.getProductStatus(productId);
        console.log("   Current Status:", ["Pending", "InProgress", "Completed"][status3]);
        console.log("   Current Location:", location3);

    } catch (error) {
        console.error("   ❌ Error:", error.message);
    }

    console.log("\n⚗️ Step 4: Manufacturer processes the batch");
    try {
        const tx4 = await PharmaSupplyChain.connect(manufacturer).manufacture(
            productId,
            JSON.stringify({
                drugName: "Paracetamol 500mg",
                manufacturingDate: "2024-01-25",
                expiryDate: "2026-01-25",
                quantity: "10000",
                unit: "tablets",
                ingredients: "Paracetamol 500mg, Microcrystalline Cellulose",
                manufacturerName: "PharmaCorp Industries",
                licenseNumber: "MFG-LIC-2024-001",
                qualityGrade: "A"
            })
        );
        await tx4.wait();
        console.log("   ✅ Manufacturing completed! Status: PENDING\n");

        const [status4, participant4, location4, stage4] = await PharmaSupplyChain.getProductStatus(productId);
        console.log("   Current Status:", ["Pending", "InProgress", "Completed"][status4]);
        console.log("   Current Location:", location4);
        console.log("   Current Stage:", ["Created", "Manufactured", "WithDistributor", "InTransport", "WithRetailer", "Sold"][stage4]);

    } catch (error) {
        console.error("   ❌ Error:", error.message);
    }

    console.log("\n✅ Test Complete!");
    console.log("\n📱 Now you can verify batch '12' at:");
    console.log("   http://localhost:3000/verify/12");
    console.log("\n   The QR code should work and show all batch information!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
