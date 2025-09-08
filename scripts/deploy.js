import dotenv from "dotenv";
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with account:", deployer.address);

  // Deploy libraries first
  const KYCLib = await ethers.deployContract("KYCLib");
  await KYCLib.waitForDeployment();
  console.log("KYCLib deployed to:", KYCLib.target);

  const LimitLib = await ethers.deployContract("LimitLib");
  await LimitLib.waitForDeployment();
  console.log("LimitLib deployed to:", LimitLib.target);

  // Link libraries when deploying Remittance
  const RemittanceFactory = await ethers.getContractFactory("Remittance", {
    libraries: {
      KYCLib: KYCLib.target,
      LimitLib: LimitLib.target,
    },
  });

  const contract = await RemittanceFactory.deploy();
  await contract.waitForDeployment();

  console.log("Remittance deployed to:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});