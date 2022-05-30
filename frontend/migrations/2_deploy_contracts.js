const NFTFamilyMemberAvatar = artifacts.require("NFTFamilyMemberAvatar");
module.exports = function(deployer) {

    return deployer.then(() => deployer.deploy(NFTFamilyMemberAvatar, ""))
}