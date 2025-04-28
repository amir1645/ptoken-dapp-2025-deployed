import React, { useState, useEffect } from "react";
 import { ethers } from "ethers";
 import detectEthereumProvider from "@metamask/detect-provider";
 import "./App.css";
 const PTOKEN_ADDRESS = "0x7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6";
 const MOCKERC20_ADDRESS = "0x9B0C1D2E3F4A5B6C7D8E9F0A1B2C3D4E5F6A7B8";
 const PTOKEN_ABI = [
 "function join(uint256 parentIndex) external payable",
 "function charge() external payable",
 "function chargeWithToken(uint256 amount) external",
 "function withdraw() external", 
"function getBalance(address user) external view returns (uint256)",
 ];
 const MOCKERC20_ABI = [ 
"function approve(address spender, uint256 amount) external returns (bool)",
 "function allowance(address owner, address spender) external view returns (uint256)",
 "function balanceOf(address account) external view returns (uint256)",
 ];
 function App() {
 const [account, setAccount] = useState(null);
 const [provider, setProvider] = useState(null); 
const [signer, setSigner] = useState(null);
 const [pTokenContract, setPTokenContract] = useState(null); 
const [mockERC20Contract, setMockERC20Contract] = useState(null);
 const [parentIndex, setParentIndex] = useState("11151"); 
const [ethAmount, setEthAmount] = useState("0.01");
 const [tokenAmount, setTokenAmount] = useState("10");
 const [balance, setBalance] = useState("0");
 const [tokenBalance, setTokenBalance] = useState("0");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);
 useEffect(() => {
    const init = async () => {
      try { 
const ethProvider = await detectEthereumProvider();
 if (ethProvider) {
 const web3Provider = new ethers.providers.Web3Provider(ethProvider);
 setProvider(web3Provider);
 const signer = web3Provider.getSigner();
 setSigner(signer);
 const pToken = new ethers.Contract(PTOKEN_ADDRESS, PTOKEN_ABI, signer); 
const mockERC20 = new ethers.Contract(MOCKERC20_ADDRESS, MOCKERC20_ABI, signer);
 setPTokenContract(pToken);
 setMockERC20Contract(mockERC20);
 ethProvider.on("accountsChanged", async (accounts) => {
 setAccount(accounts[0]); 
if (accounts[0]) {
 updateBalances(accounts[0], pToken, mockERC20);
 }
 });
 ethProvider.on("chainChanged", () => { window.location.reload();
 });
 const accounts = await ethProvider.request({ method: "eth_accounts" });
 if (accounts.length > 0) { setAccount(accounts[0]); updateBalances(accounts[0], pToken, mockERC20);
 } 
} else {
setError("Please install MetaMask!");
 }
 } catch (err) {
 setError("Error initializing: " + err.message);
 } 
};
 init(); 
}, []);
 const updateBalances = async (userAddress, pToken, mockERC20) => {
 try { 
const ethBalance = await pToken.getBalance(userAddress)
; setBalance(ethers.utils.formatEther(ethBalance));
 const tokenBal = await mockERC20.balanceOf(userAddress);
 setTokenBalance(ethers.utils.formatUnits(tokenBal, 18));
 } catch (err) {
 setError("Error fetching balances: " + err.message); }
 };
 const connectWallet = async () => { 
try { 
const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
 setAccount(accounts[0]);
 setError(""); 
updateBalances(accounts[0], pTokenContract, mockERC20Contract); 
}
 catch (err) {
 setError("Failed to connect wallet: " + err.message); } 
};
 const join = async () => { if (!pTokenContract) return; setLoading(true);
 try {
   const tx = await pTokenContract.join(parentIndex, { value: ethers.utils.parseEther(ethAmount),
 });
 await tx.wait();
 alert("Join successful!");
 updateBalances(account, pTokenContract, mockERC20Contract);
 } catch (err) {
 setError("Join failed: " + err.message);
 } finally {
 setLoading(false); }
 };
 const charge = async () => { 
if (!pTokenContract) return;
 setLoading(true);
 try {
 const tx = await pTokenContract.charge({
 value: ethers.utils.parseEther(ethAmount),
 }); 
await tx.wait();
 alert("Charge successful!");
 updateBalances(account, pTokenContract, mockERC20Contract); 
} catch (err) {
 setError("Charge failed: " + err.message);
 } finally {
 setLoading(false); 
}
 };
 const chargeWithToken = async () => { 
if (!pTokenContract || !mockERC20Contract) return; setLoading(true); 
try { const amount = ethers.utils.parseUnits(tokenAmount, 18);
 constapproveTx = await mockERC20Contract.approve(PTOKEN_ADDRESS, amount);
 await approveTx.wait();
 const chargeTx = await pTokenContract.chargeWithToken(amount);
 await chargeTx.wait();
 alert("Charge with token successful!");
 updateBalances(account, pTokenContract, mockERC20Contract); 
} catch (err) {
 setError("Charge with token failed: " + err.message);
 } finally {
 setLoading(false);
 } 
};
 const withdraw = async () => {
 if (!pTokenContract) return;
 setLoading(true);
 try {
 const tx = await pTokenContract.withdraw();
 await tx.wait(); 
alert("Withdraw successful!");
 updateBalances(account, pTokenContract, mockERC20Contract);
 } catch (err) {
 setError("Withdraw failed: " + err.message); 
} finally {
 setLoading(false);
 }
 };
 return (
 <div className="App">
 <header className="App-header">
 <h1>PToken DApp</h1>
 </header>
 <main> 
{error && <p className="error">{error}</p>}
 {loading && <p className="loading">Loading...</p>}
 {!account ? ( 
<button onClick={connectWallet}>Connect Wallet</button> 
) : (
 <div className="dashboard">
 <div className="account-info"> 
<p>Connected: {account}</p>
 <p>ETH Balance in Contract: {balance} ETH</p>
 <p>MockERC20 Balance: {tokenBalance} Tokens</p>
 </div> 
<div className="action-section">
 <h2>Join</h2>
 <input
 type="text"
 value={parentIndex}
 onChange={(e) => setParentIndex(e.target.value)}
 placeholder="Parent Index"
 />
 <input type="text"
 value={ethAmount} 
onChange={(e) => setEthAmount(e.target.value)}
 placeholder="ETH Amount" 
/>
 <button onClick={join} disabled={loading}>Join</button>
 </div>
 <div className="action-section">
 <h2>Charge</h2> 
<input
 type="text"
 value={ethAmount}
 onChange={(e) => setEthAmount(e.target.value)}
placeholder="ETH Amount"
 />
 <button onClick={charge} disabled={loading}>Charge</button>
 </div>
 <div className="action-section"> 
<h2>Charge with Token</h2> 
<input
 type="text"
 value={tokenAmount} 
onChange={(e) => setTokenAmount(e.target.value)}
 placeholder="Token Amount"
 /> 
<button onClick={chargeWithToken} disabled={loading}>Charge with Token</button>
 </div>
 <div className="action-section">
 <h2>Withdraw</h2> 
<button onClick={withdraw} disabled={loading}>Withdraw</button>
 </div> 
</div> 
)}
 </main> 
</div>
 );
 }
 export default App;