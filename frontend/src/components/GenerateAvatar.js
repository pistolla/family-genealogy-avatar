import React, { useEffect } from "react";
import { proxy, useSnapshot } from 'valtio';
import "../styles/GenerateAvatar.css";
import Generate3D from "./Generate3D";
import GenerateDetails from "./GenerateDetails";
import GenerateTrx from "./GenerateTrx";
import { TOKEN_KEY, contractABI, contractAddress } from "../constants";
import useIpfsFactory from '../hooks/use-ipfs-factory.js';
const web3 = require("../getWeb3.js");

const avatarObject = proxy({
    step: 1,
    name: "",
    photo: null,
    description: "",
    gltf: null,
    FormErrors: {},
    message: "",
    url: "",
    loaded: false,
})

function GenerateAvatar(props) {
    const { step, name, photo, description, gltf, FormErrors, message, url, loaded } = useSnapshot(avatarObject);
    const { ipfs, ipfsInitError } = useIpfsFactory({ commands: ['id'] })
    useEffect(() => {
        if (!loaded) {
            const files = JSON.parse(localStorage.getItem("files"))
            if (files) {
                files.forEach(file => {
                    if (file.status == "CREATED") {
                        avatarObject.name = file.name;
                        avatarObject.description = file.description;
                        let url = 'http://localhost:3000'
                        avatarObject.photo = file.file
                        avatarObject.loaded = true
                    }
                })
            }
        }
    })


    const nextStep = () => {
        try {
            if (step == 1) {
                console.log(validateDescription());
                validateDescription() ? avatarObject.step = step + 1 : avatarObject.step = step;
            } else {
                avatarObject.step = step >= 4 ? 4 : step + 1
            }
        } catch (e) {
            console.log(e)
        }
    };
    //go back
    const prevStep = () => {
        avatarObject.step = step <= 1 ? 1 : step - 1
    };

    const handleChange = input => e => {
        avatarObject[input] = e.target.value
    };
    const handleGltfGenerated = (model) => {
        avatarObject.gltf = model
    }
    const handleSubmit = async e => {
        console.log('handleSubmit()')
        const { success, status } = await mintNFT(url, name, description);
        avatarObject.message = status;
        if (success) {
            const files = JSON.parse(localStorage.getItem("files"))
            console.log(files)
            if (!files) {
                return;
            }
            files.forEach(file => {
                if (file.name === name) {
                    file.status = "GENERATED"
                }
            })
            localStorage.setItem('files', JSON.stringify(files));
        }
    };
    const validateDescription = () => {
        // let descriptionValid = description != ""
        // avatarObject.FormErrors = {
        //     email: descriptionValid === null ? 'Enter a valid description' : ''
        // }

        // return descriptionValid == null ? false : true;
        return true;
    };

    // const storeFile = async (url, uniqueId, data) => {
    //     var cache = await caches.open(uniqueId)
    //     cache.put(url, data);
    // }
    const loadContract = async () => {
		return new web3.eth.Contract(contractABI, contractAddress);
	}

    const mintNFT = async (url, name, description) => {
        if (url.trim() == "" || name.trim() == "" || description.trim() == "") {
            return {
                success: false,
                status: "❗Please make sure all fields are completed before minting.",
            };
        }

        //make metadata
        const metadata = new Object();
        metadata.name = name;
        metadata.image = url;
        metadata.description = description;
        const tokenURI = addFile("metadata.json", JSON.stringify(metadata));

        window.contract = await new web3.eth.Contract(contractABI, contractAddress);

        const transactionParameters = {
            to: contractAddress, // Required except during contract publications.
            from: window.ethereum.selectedAddress, // must match user's active address.
            data: window.contract.methods
                .mintNFT(window.ethereum.selectedAddress, tokenURI)
                .encodeABI(),
        };

        try {
            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [transactionParameters],
            });
            return {
                success: true,
                status:
                    "✅ Check out your transaction on Etherscan: https://ropsten.etherscan.io/tx/" +
                    txHash,
            };
        } catch (error) {
            return {
                success: false,
                status: "😥 Something went wrong: " + error.message,
            };
        }
    };

    const addFile = async (fileName, json) => {
        
        const filesAdded = await ipfs.add({ path: fileName, content: json }, {
            cidVersion: 1,
            hashAlg: 'sha2-256',
            wrapWithDirectory: true,
            progress: (len) => console.log("Uploading file..." + len)
        });
        console.log(filesAdded);
        const fileHash = filesAdded.cid.string;

        return fileHash;
    };

    return (
        <div className="form__container">
            <div className="form__container--box">
                <h2>Generate an Avatar and Mint to Human Genealogy </h2>
                <p className="description">
                    {step == 1 ? "Add personal details" : step == 2 ? "Convert image to 3d image" : step == 3 ? "Connect to Metamask and complete the minting" : "Done"}
                </p>
                <ul className="form__container--steps" style={{ display: step >= 4 ? 'none' : '' }}>
                    <li className="active">PERSONAL DETAIL</li>
                    <li className={`${step >= 2 ? 'active' : ''}`}>DESIGN AVATAR</li>
                    <li className={`${step >= 3 ? 'active' : ''}`}>MINT NFT</li>
                </ul>
                {step === 4 ? 'Thank you for your input' : null}
                <hr />

                <form className="form" name="contact" method="post" onSubmit={handleSubmit}>
                    <DisplayFormErrors errors={FormErrors} />
                    {(() => {
                        switch (step) {
                            case 1:
                                return <GenerateDetails
                                    active={true}
                                    name={name}
                                    description={description}
                                    textChange={handleChange}
                                    nextStep={nextStep} />
                            case 2:
                                return <Generate3D
                                    active={true}
                                    image={photo}
                                    onModelGenerated={handleGltfGenerated}
                                    nextStep={nextStep}
                                    goBack={prevStep} />
                            case 3:
                                return <GenerateTrx
                                    name={name}
                                    image={gltf}
                                    description={description}
                                    active={true}
                                    textChange={handleChange}
                                    nextStep={nextStep}
                                    goBack={prevStep}
                                    onMintPressed={handleSubmit}
                                />
                            default:
                                return <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>Return! <button className="btn btn-svg reverse" onClick={prevStep}>
                                    <svg className="svg-icon" viewBox="0 0 20 20">
                                        <path
                                            fill="none"
                                            d="M18.271,9.212H3.615l4.184-4.184c0.306-0.306,0.306-0.801,0-1.107c-0.306-0.306-0.801-0.306-1.107,0
                                        L1.21,9.403C1.194,9.417,1.174,9.421,1.158,9.437c-0.181,0.181-0.242,0.425-0.209,0.66c0.005,0.038,0.012,0.071,0.022,0.109
                                        c0.028,0.098,0.075,0.188,0.142,0.271c0.021,0.026,0.021,0.061,0.045,0.085c0.015,0.016,0.034,0.02,0.05,0.033l5.484,5.483
                                        c0.306,0.307,0.801,0.307,1.107,0c0.306-0.305,0.306-0.801,0-1.105l-4.184-4.185h14.656c0.436,0,0.788-0.353,0.788-0.788
                                        S18.707,9.212,18.271,9.212z"
                                        />
                                    </svg>
                                </button></div>
                        }
                    })()}
                </form>
            </div>
        </div>
    );
}

function DisplayFormErrors({ errors }) {
    return (
        <div className="form__error--container">
            {Object.keys(errors).map((fieldName, i) => {
                if (errors[fieldName] !== '') {
                    return (
                        <p key={i} className="form__error--item">
                            {fieldName} {errors[fieldName]}
                        </p>
                    );
                } else {
                    return '';
                }
            })}
        </div>
    );
}

export default GenerateAvatar;