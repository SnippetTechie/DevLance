import React,{useState} from "react";
import {ethers} from "ethers";

const WalletCard = () => {

     const [errorMessage,setErrorMessage]=useState(null);
     const [defaultAccount,setDefaultAccount]=useState(null);
     const [userBalance,setUserBalance]=useState(null);
     const [connButtonText,setConnButtonText]=useState('Connect Wallet');

     const connectWalletHandler=()=>{
          if(window.ethereum){
              window.ethereum.request({method:'eth_requestAccounts'})
              .then(result=>{
                accountChangedHandler(result[0]);
              })
          }else{
                setErrorMessage("Install MetaMask");
          }
     }
     const accountChangedHandler=(newAccount)=>{
        setDefaultAccount(newAccount);
        getUserBalance(newAccount.toString());
     }

    const getUserBalance = (address) => {
  if (!window.ethereum) {
    setErrorMessage("No Ethereum provider found.");
    setUserBalance("0");
    return;
  }

  window.ethereum.request({ method: 'eth_getBalance', params: [address, 'latest'] })
  .then(balance => {
    if (balance) {
      const formatEtherFn =
        (typeof ethers.formatEther === "function" && ethers.formatEther) ||
        (ethers.utils && typeof ethers.utils.formatEther === "function" && ethers.utils.formatEther) ||
        null;

      try {
        if (formatEtherFn) {
          const formatted =
            formatEtherFn === ethers.formatEther ? formatEtherFn(BigInt(balance)) : formatEtherFn(balance);
          setUserBalance(formatted);
        } else {
          setUserBalance(String(Number(BigInt(balance)) / 1e18));
        }
      } catch (err) {
        console.error("format error:", err);
        
        try {
          setUserBalance(String(Number(BigInt(balance)) / 1e18));
        } catch (_e) {
          setUserBalance("0");
        }
      }
    } else {
      setUserBalance("0");
    }
  })
  .catch(error => {
    console.error("Error fetching balance:", error);
    setErrorMessage("Failed to fetch balance. Please try again.");
  });
}
const chainChangedHandler=()=>{ window.location.reload(); }
     window.ethereum.on('accountsChanged',accountChangedHandler);
     window.ethereum.on('chainChanged',chainChangedHandler)
     
     return (
        <div className='walletCard'>
            <h4>
                {"Connection to MetaMask using window.ethereum methods"}
            </h4>
            <button onClick={connectWalletHandler}>{connButtonText}</button>
            <div className='accountDisplay'>
                <h3>Address:{defaultAccount}</h3>
            </div>
            <div className='balanceDisplay'>
                <h3>Balance:{userBalance}</h3>
            </div>
            {errorMessage}
        </div>
     )
}

export default WalletCard;

