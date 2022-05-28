import axios from "axios";
import React, { useEffect } from "react";
import { proxy, useSnapshot } from 'valtio';
import { BASE_URL, TOKEN_KEY } from "../constants";
import "../styles/GenerateAvatar.css";
import Generate3D from "./Generate3D";
import GenerateDetails from "./GenerateDetails";
import GenerateTrx from "./GenerateTrx";

const avatarObject = proxy({
    step: 1,
    name: "",
    photo: null,
    description: "",
    gltf: null,
    FormErrors: {},
    message: ""
})

function GenerateAvatar(props) {
    const { step, name, photo, description, gltf, FormErrors, message } = useSnapshot(avatarObject);

    useEffect(() => {
        const files = JSON.parse(localStorage.getItem("files"))
        if (files) {
            files.forEach(file => {
                if (file.status == "CREATED") {
                    avatarObject.name = file.name;
                    avatarObject.description = file.description;

                    readCachedFile(file.id).then((base64Img) => {

                    });
                }
            })
        }
    })

    const readCachedFile = async (fileId) => {
        if ('caches' in window) {
            let url = 'http://localhost:3000'
            // Opening given cache and putting our data into it
            var responses = await caches.match(url);
            if (responses.length > 0) {
                responses.forEach(response => {
                    console.log(response)
                    return response;
                })
            }
        }
        return null;
    }
    const nextStep = () => {
        if (step == 1) {
            console.log(validateDescription());
            validateDescription() ? avatarObject.step = step + 1 : avatarObject.step = step;
        } else {
            avatarObject.step = step >= 4 ? 4 : step + 1
        }
    };
    //go back
    const prevStep = () => {
        avatarObject.step = step <= 1 ? 1 : step - 1
    };

    const handleChange = input => e => {
        avatarObject[input] = e.target.value
    };
    const handleSubmit = e => {
        console.log('handleSubmit()')
        const files = JSON.parse(localStorage.getItem("files"))
        console.log(files)
        if (!files) {
            files = []
        }
        if ('caches' in window) {
            console.log('caches')
            let uniqueId = new Date().getTime().toString(36) + new Date().getUTCMilliseconds();
            let url = 'http://localhost:3000'
            console.log(uniqueId)
            getBase64(gltf, (result) => {
                console.log(result)
                storeFile(url, uniqueId, result)
                    .then(() => {
                        console.log('stored files')
                        files.push({
                            id: uniqueId,
                            name: "",
                            description: description,
                            file: "",
                            status: "GENERATED"
                        });
                        localStorage.setItem('files', JSON.stringify(files));
                    })
            });
        }
    };
    const validateDescription = () => {
        let descriptionValid = description != ""
        avatarObject.FormErrors = {
            email: descriptionValid === null ? 'Enter a valid description' : ''
        }

        return descriptionValid == null ? false : true;
    };

    const storeFile = async (url, uniqueId, data) => {
        var cache = await caches.open(uniqueId)
        cache.put(url, data);
    }

    const getBase64 = (file, cb) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            cb(reader.result)
        };
        reader.onerror = function (error) {
            console.log('Error: ', error);
        };
    }

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
                                    nextStep={nextStep}
                                    goBack={prevStep} />
                            case 3:
                                return <GenerateTrx
                                    active={true}
                                    textChange={handleChange}
                                    nextStep={nextStep}
                                    goBack={prevStep} />
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