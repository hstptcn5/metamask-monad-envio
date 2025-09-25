import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying DelegationManager to Monad testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy DelegationManager
  const DelegationManager = await ethers.getContractFactory("DelegationManager");
  const delegationManager = await DelegationManager.deploy();
  
  await delegationManager.waitForDeployment();
  const delegationManagerAddress = await delegationManager.getAddress();

  console.log("✅ DelegationManager deployed to:", delegationManagerAddress);

  // Save deployment info
  const deploymentInfo = {
    network: "monad-testnet",
    chainId: 10143,
    contracts: {
      DelegationManager: {
        address: delegationManagerAddress,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
        transactionHash: delegationManager.deploymentTransaction()?.hash
      }
    }
  };

  // Save to deployment file
  const deploymentPath = path.join(__dirname, "..", "deployments", "monad-testnet.json");
  const deploymentDir = path.dirname(deploymentPath);
  
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("📄 Deployment info saved to:", deploymentPath);

  // Update environment file
  const envPath = path.join(__dirname, "..", "..", "env.example");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    
    // Add or update DELEGATION_MANAGER_ADDRESS
    const delegationManagerLine = `DELEGATION_MANAGER_ADDRESS=${delegationManagerAddress}`;
    
    if (envContent.includes("DELEGATION_MANAGER_ADDRESS=")) {
      envContent = envContent.replace(
        /DELEGATION_MANAGER_ADDRESS=.*/,
        delegationManagerLine
      );
    } else {
      envContent += `\n# DelegationManager Contract\n${delegationManagerLine}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("🔧 Updated env.example with DelegationManager address");
  }

  console.log("\n🎉 Deployment completed successfully!");
  console.log("📋 Next steps:");
  console.log("1. Copy the address to your .env file:");
  console.log(`   DELEGATION_MANAGER_ADDRESS=${delegationManagerAddress}`);
  console.log("2. Update your frontend to use the real contract address");
  console.log("3. Test delegation creation and redemption");

  return {
    delegationManagerAddress,
    deploymentInfo
  };
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
