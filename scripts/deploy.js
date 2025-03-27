// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

const path = require("path");

const h = require('hardhat')



const localTest = true;

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }

  // ethers is available in the global scope
  const [deployer, d2] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());
  const provider = new h.ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/703c33e04a1649088ed0537ef0965779");
  const wallet = new h.ethers.Wallet("046b0f39761b1667b4e29940c00eeb776358042a10354b5fe7a837a38083f2dd", provider);

  console.log('xxxx')
  // //!: Deploy contract first
  const Token = await ethers.getContractFactory("ERC721Factory");
  console.log('xxxx 1')
  const token = await Token.deploy();
  console.log('xxxx 222', token)
  const contracts = await token.deployed();
  console.log("Token address:", contracts);
  const contractAddress = contracts.deployTransaction?.creates
  console.log(`🐳 -> main -> contractAddress:`, contractAddress)
  const contract = await h.ethers.getContractAt("ERC721Factory", contractAddress);
  const connectedWallet = contract.connect(deployer);
  const txCreate = await connectedWallet.createERC721("Học Sinh", "Student", "https://google.com");
  const receipt = await txCreate.wait();
  // console.log('Transaction receipt:', receipt);
  
  let createdERC721;
  if (receipt.events && receipt.events.length > 0) {
    const event = receipt.events.find(e => e.event === 'ERC721Created');
    if (event) {
      // console.log('New token details:', event.args);
      createdERC721 = event.args[0];
    }
  }
  
  //Create first NFT  
  const collectionContract = await h.ethers.getContractAt("SampleERC721", createdERC721);
  const _connected = collectionContract.connect(deployer);
  const tx = await _connected.mint(await deployer.getAddress(), 1)
  
  await tx.wait();
  // console.log('received', await tx.wait())

  // Add verification data to NFT with token ID 1
  console.log('add verification data for NFT')
  const verificationItems = [
    { key: "name", value: "Student Certificate" },
    { key: "issuer", value: "School of Excellence" },
    { key: "date", value: "2023-06-15" },
    { key: "grade", value: "A+" }
  ];
  const txAddVerification = await _connected.addVerificationData(1, verificationItems);
  const receiptAddVerification = await txAddVerification.wait();
  console.log('txAddVerification', receiptAddVerification.hash)

  console.log('add whitelist for NFT',await d2.getAddress())
  const txAddWhitelist = await _connected.addToWhitelist(1, await d2.getAddress());
  const receiptAddWhitelist = await txAddWhitelist.wait();
  console.log('txAddWhitelist', receiptAddWhitelist)

  // use d2 to get address
  
  const signature = await d2.signMessage("Get verification")

  console.log('receive signature', signature)
  const _n2 = await h.ethers.getContractAt("SampleERC721", createdERC721);
  const _connected_n2 = _n2.connect(d2)
  const txGetVerification = await _connected_n2.getVerificationData(1, signature);
  console.log(`🐳 -> main -> txGetVerification:`, txGetVerification)
  

  // ? Create NFT Collections
  // const contractAddress = "0x3282Ad784D41F5De0fB982AB3485fc5693871B18";
  // const contract = await h.ethers.getContractAt("Factory", contractAddress);
  // const connectedWallet = contract.connect(wallet);
  // const tx = await connectedWallet.createERC721("Học Sinh", "Student", "https://google.com");
  // const receipt = await tx.wait();
  // console.log('Transaction receipt:', receipt);

  // // Extract event data if the function emits an event
  // if (receipt.events && receipt.events.length > 0) {
  //   const event = receipt.events.find(e => e.event === 'ERC721Created');
  //   if (event) {
  //     console.log('New token details:', event.args);
  //   }
  // }
  // await test.wait();
  // console.log('test', test)
  
  // ?: Create NFT on Collections
  // const collection = "0x237abcb0a8e652dcc848d88d3db8eced43d67871";
  // const collectionContract = await h.ethers.getContractAt("SampleERC721", collection);
  // const _connected = collectionContract.connect(wallet);

  // ? TX MINT NFT
  // const tx = await _connected.mint("0x6b05025374f99b762D6Cda8b0211957eB1c067be", 1)

  // console.log('add verification data for NFT')
  // // Create verification items
  // const verificationItems = [
  //   { key: "name", value: "Student Certificate" },
  //   { key: "issuer", value: "School of Excellence" },
  //   { key: "date", value: "2023-06-15" },
  //   { key: "grade", value: "A+" }
  // ];

  // // Add verification data to NFT with token ID 1
  // const tx = await _connected.addVerificationData(1, verificationItems);

  // const receipt = await tx.wait();

  // console.log('tx', receipt)

  // ? Read verification data as owner for token ID 1
  // console.log('\nReading verification data as owner for NFT #1:');
  // const verificationData = await _connected.getVerificationDataAsOwner(1);

  // // Extract the verification source address and the data items
  // const [verificationSource, items] = verificationData;

  // console.log('Verification provided by:', verificationSource);
  // console.log('Verification data:');
  // for (let i = 0; i < items.length; i++) {
  //   console.log(`- ${items[i].key}: ${items[i].value}`);
  // }

  // We also save the contract's artifacts and address in the frontend directory
  // saveFrontendFiles(token);
}

// function saveFrontendFiles(token) {
//   const fs = require("fs");
//   const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

//   if (!fs.existsSync(contractsDir)) {
//     fs.mkdirSync(contractsDir);
//   }

//   fs.writeFileSync(
//     path.join(contractsDir, "contract-address.json"),
//     JSON.stringify({ Token: token.address }, undefined, 2)
//   );

//   const TokenArtifact = artifacts.readArtifactSync("Token");

//   fs.writeFileSync(
//     path.join(contractsDir, "Token.json"),
//     JSON.stringify(TokenArtifact, null, 2)
//   );
// }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
