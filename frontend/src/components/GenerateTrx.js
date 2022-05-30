import React from "react";
const web3 = require("../getWeb3.js");

function GenerateTrx({ name, description, textChange, onMintPressed, active, nextStep, goBack }) {
	const proceed = e => {
		e.preventDefault();
		nextStep();
	};
	const revert = e => {
		e.preventDefault();
		goBack();
	};
	const [walletAddress, setWallet] = useState("");
	const [status, setStatus] = useState("");

	useEffect(async () => {
		const { address, status } = await getCurrentWalletConnected();

		setWallet(address);
		setStatus(status);

		addWalletListener();
	}, []);

	const connectWallet = async () => {
		if (window.ethereum) {
			try {
				const addressArray = await window.ethereum.request({
					method: "eth_requestAccounts",
				});
				const obj = {
					status: "👆🏽 Write a message in the text-field above.",
					address: addressArray[0],
				};
				return obj;
			} catch (err) {
				return {
					address: "",
					status: "😥 " + err.message,
				};
			}
		} else {
			return {
				address: "",
				status: (
					<span>
						<p>
							{" "}
							🦊{" "}
							<a target="_blank" href={`https://metamask.io/download.html`}>
								You must install Metamask, a virtual Ethereum wallet, in your
								browser.
							</a>
						</p>
					</span>
				),
			};
		}
	};

	const getCurrentWalletConnected = async () => {
		if (window.ethereum) {
			try {
				const addressArray = await window.ethereum.request({
					method: "eth_accounts",
				});
				if (addressArray.length > 0) {
					return {
						address: addressArray[0],
						status: "👆🏽 Write a message in the text-field above.",
					};
				} else {
					return {
						address: "",
						status: "🦊 Connect to Metamask using the top right button.",
					};
				}
			} catch (err) {
				return {
					address: "",
					status: "😥 " + err.message,
				};
			}
		} else {
			return {
				address: "",
				status: (
					<span>
						<p>
							{" "}
							🦊{" "}
							<a target="_blank" href={`https://metamask.io/download.html`}>
								You must install Metamask, a virtual Ethereum wallet, in your
								browser.
							</a>
						</p>
					</span>
				),
			};
		}
	};

	const addWalletListener = () => {
		if (window.ethereum) {
			window.ethereum.on("accountsChanged", (accounts) => {
				if (accounts.length > 0) {
					setWallet(accounts[0]);
					setStatus("👆🏽 Write a message in the text-field above.");
				} else {
					setWallet("");
					setStatus("🦊 Connect to Metamask using the top right button.");
				}
			});
		} else {
			setStatus(
				<p>
					{" "}
					🦊{" "}
					<a target="_blank" href={`https://metamask.io/download.html`}>
						You must install Metamask, a virtual Ethereum wallet, in your
						browser.
					</a>
				</p>
			);
		}
	}

	const connectWalletPressed = async () => {
		const walletResponse = await connectWallet();
		setStatus(walletResponse.status);
		textChange(walletResponse.address);
	};

	return (
		<div className={`form__card ${active ? 'active' : ''}`}>
			<div className="Minter">
				<button id="walletButton" onClick={connectWalletPressed}>
					{walletAddress.length > 0 ? (
						"Connected: " +
						String(walletAddress).substring(0, 6) +
						"..." +
						String(walletAddress).substring(38)
					) : (
						<span>Connect Wallet</span>
					)}
				</button>
				<p id="status" style={{ color: "red" }}>
					{status}
				</p>
				<br></br>
				<h1 id="title">🧙‍♂️ Mint the FAM Avatar</h1>
				<p>
					Simply press "Mint."
				</p>
				<div className="input__container">
					<label className="input__container--label" htmlFor="url">
						IPFS Url?
					</label>
					<input
						className="input__container--field"
						name="url"
						type="text"
						disabled
						placeholder="e.g. ipfs://gateway.pinata.cloud/ipfs/<hash>"
						onChange={textChange('url')}
						value={name}
					/>
				</div>
				<input
					className="input__container--field"
					name="address"
					type="text"
					hidden
					placeholder="e.g. ipfs://gateway.pinata.cloud/ipfs/<hash>"
					onChange={textChange('address')}
					value={walletResponse.address}
				/>
				<p>{name}</p>
				<p>{description}</p>
				<button id="mintButton" type="submit" onClick={onMintPressed}>
					Mint NFT
				</button>

			</div>

			<div className="btn__container">
				<button className="btn btn-svg reverse" onClick={revert}>
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
				</button>
				<button className="btn btn-svg" onClick={proceed}>
					<svg className="svg-icon" viewBox="0 0 20 20">
						<path
							fill="none"
							d="M1.729,9.212h14.656l-4.184-4.184c-0.307-0.306-0.307-0.801,0-1.107c0.305-0.306,0.801-0.306,1.106,0
							l5.481,5.482c0.018,0.014,0.037,0.019,0.053,0.034c0.181,0.181,0.242,0.425,0.209,0.66c-0.004,0.038-0.012,0.071-0.021,0.109
							c-0.028,0.098-0.075,0.188-0.143,0.271c-0.021,0.026-0.021,0.061-0.045,0.085c-0.015,0.016-0.034,0.02-0.051,0.033l-5.483,5.483
							c-0.306,0.307-0.802,0.307-1.106,0c-0.307-0.305-0.307-0.801,0-1.105l4.184-4.185H1.729c-0.436,0-0.788-0.353-0.788-0.788
							S1.293,9.212,1.729,9.212z"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
}

export default GenerateTrx;