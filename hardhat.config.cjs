require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
const { RPC_URL, PRIVATE_KEY, CHAIN_ID } = process.env;
console.log("DEBUG RPC_URL:", RPC_URL);
module.exports = {
  solidity: {
  version: "0.8.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200   // try low values like 50 or 100 if still big
    }
  }
},
  networks: {
    sonicTestnet: {
      url: RPC_URL || "",
      chainId: parseInt(CHAIN_ID || "0"),
      accounts: PRIVATE_KEY ? [`0x${PRIVATE_KEY}`] : [],
    },
  },
};
