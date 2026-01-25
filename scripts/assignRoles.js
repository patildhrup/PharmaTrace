const hre = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

    console.log("Assigning roles to accounts...");

    const PharmaSupplyChain = await hre.ethers.getContractAt("PharmaSupplyChain", contractAddress);
    const accounts = await hre.ethers.getSigners();

    // Assign roles
    // Role enum: None=0, Supplier=1, Manufacturer=2, Distributor=3, Transporter=4, Retailer=5

    console.log("Account 0 (Supplier):", accounts[0].address);
    await PharmaSupplyChain.connect(accounts[0]).assignRole(accounts[0].address, 1);

    console.log("Account 1 (Manufacturer):", accounts[1].address);
    await PharmaSupplyChain.connect(accounts[0]).assignRole(accounts[1].address, 2);

    console.log("Account 2 (Distributor):", accounts[2].address);
    await PharmaSupplyChain.connect(accounts[0]).assignRole(accounts[2].address, 3);

    console.log("Account 3 (Transporter):", accounts[3].address);
    await PharmaSupplyChain.connect(accounts[0]).assignRole(accounts[3].address, 4);

    console.log("Account 4 (Retailer):", accounts[4].address);
    await PharmaSupplyChain.connect(accounts[0]).assignRole(accounts[4].address, 5);

    console.log("\n✅ All roles assigned successfully!");
    console.log("\nRole Summary:");
    console.log("- Supplier:", accounts[0].address);
    console.log("- Manufacturer:", accounts[1].address);
    console.log("- Distributor:", accounts[2].address);
    console.log("- Transporter:", accounts[3].address);
    console.log("- Retailer:", accounts[4].address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
