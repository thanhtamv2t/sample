const  { ethers } = require("ethers");
(async () => {

    console.log('first',ethers.utils.verifyMessage("Get verification", "0x3ca53d90b82c2b61814a255298a0bacb502b705555c0fd1f8a73dad8ab7593e317a26896b44e4bb949c06595373a31da1e8d6bbf1633d87937eb2e681775b4161b"))

})();