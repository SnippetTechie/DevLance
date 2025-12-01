import { ethers, network } from "hardhat";

async function main() {
  console.log(" Deploying DevLance contract...\n");

  const [deployer] = await ethers.getSigners();
  console.log(` Deploying with account: ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(` Account balance: ${ethers.formatEther(balance)} ETH\n`);

  const DevLance = await ethers.getContractFactory("DevLance");
  const devLance = await DevLance.deploy();
  await devLance.waitForDeployment();

  const address = await devLance.getAddress();
  console.log(` DevLance deployed to: ${address}\n`);

  const fs = require("fs");
  const networkName = network.name;
  const deploymentsPath = `./deployments.json`;
  fs.writeFileSync(
    deploymentsPath,
    JSON.stringify(
      {
        network: networkName,
        contractAddress: address,
        deployedAt: new Date().toISOString(),
        deployer: deployer.address,
      },
      null,
      2
    )
  );

  console.log(` Deployment saved to: ${deploymentsPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });