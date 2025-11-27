import { useEffect, useState } from "react";

export default function useConfig(){
    const [config,setConfig]=useState(null);
    const [loading,setLoading]=useState(true);

    useEffect(()=>{
        let mounted=true;
        async function fetchConfig(){
            try{
                const res=await fetch('/api/config');
                if(!res.ok) throw new Error('no backend config');
                const json=await res.json();
                if(mounted){
                    setConfig({...json,configSource:'api'});
                }
            }catch(e){
                const envCfg={
                    chainId:import.meta.env.VITE_CHAIN_ID|| '0X539',
                    networkName:import.meta.env.VITE_NETWORK_NAME||'LocalGanache',
                    demoMode:(import.meta.env.VITE_DEMO_MODE==='true')|| true,
                    faucetUrl:import.meta.env.VITE_FAUCET_URL||'',
                    escrowContractAddress:import.meta.env.VITE_ESCROW_ADDR||'',
                    totalGigs:0,
                    configSource:'envFallback',
                }
                if (mounted) setConfig(envCfg);
            }finally{
                if (mounted) setLoading(false);
            }
        }
        fetchConfig();
        return()=>(mounted=false);
    },[]);
    return {config,loading};
}