const NFTFamilyMemberAvatar = artifacts.require("NFTFamilyMemberAvatar");
export default function(deployer) {

    return deployer.then(() => deployer.deploy(NFTFamilyMemberAvatar, ""))
}