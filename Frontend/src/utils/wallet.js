export function isEthereumAvailable(){
    return typeof window !== 'undefined' && Boolean(window.ethereum);
}

export async function requestAccounts(){
    if(!isEthereumAvailable()) throw new Error("No injected wallet found (MetaMask).");
    const accounts=await window.ethereum.request({method:'eth_requestAccounts'});
    return accounts;
}

export async function getAccounts(){
    if(!isEthereumAvailable()) return [];
    const accounts=await window.ethereum.request({method:'eth_accounts'});
    return accounts;
}

export async function getChainId(){
    if(!isEthereumAvailable()) return null;
    return await window.ethereum.request({method:'eth_chainId'});
}

export async function switchNetwork(chainIdHex){
    if(!isEthereumAvailable()) throw new Error('No injected wallet found');
    await window.ethereum.request({
        method:'wallet_switchEthereumChain',
        params:[{chainId:chainIdHex}],
    });
    return true;
}