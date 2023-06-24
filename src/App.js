import { useState } from 'react';
import { ethers } from 'ethers';
import Notification from './Notification';

function App() {

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(null);
  const [notification, setNotification] = useState({ message: '', show: false });

  const connect = async () => {
    setLoading(true);
    try {
      let provider;
      if (window.ethereum == null) {
        console.log("MetaMask not installed");
        provider = ethers.getDefaultProvider();
        console.log(provider)
      } else {
        provider = new ethers.BrowserProvider(window.ethereum)
  
        const network = await provider.getNetwork();
        const desiredChainId = '0x14A33';
        if (network.chainId !== parseInt(desiredChainId, 16)) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: desiredChainId }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: desiredChainId,
                    chainName: 'Base Goerli',
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18
                    },
                    rpcUrls: ['https://goerli.base.org'],
                    blockExplorerUrls: ['https://goerli.basescan.org'],
                  }],
                });
              } catch (addError) {
                throw addError;
              }
            } else {
              throw switchError;
            }
          }
        }
        provider = new ethers.BrowserProvider(window.ethereum);

        const signer = await provider.getSigner();
        const message = "hello world!";
        const sig = await signer.signMessage(message);
        const address = await signer.getAddress();
        const balance = await provider.getBalance(address);
        const parsed = ethers.formatEther(balance);
        console.log(parsed);
        const verify = ethers.verifyMessage(message, sig);
        console.log(verify);
        setConnected(true);
  
        const { ethereum } = window;
        if (ethereum) {
          const ensProvider = new ethers.InfuraProvider('mainnet');
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const displayAddress = address?.substr(0, 6) + "...";
          const ens = await ensProvider.lookupAddress(address);
          if (ens !== null) {
            setName(ens)
            showNotification("Welcome " + ens);
          } else {
            setName(displayAddress)
            showNotification(displayAddress);
          }
        } else {
          alert('no wallet detected!')
        }
      }
      setLoading(false)
    } catch (error) {
      setConnected(false);
      setLoading(false);
      showNotification(error.message);
      console.log(error)
    }
  }

  const showNotification = (message) => {
    setNotification({ message, show: true });
  };

  const installMetamask = () => {
    window.open('https://metamask.io/download.html', '_blank');
  };

  const disconnect = () => {
    setName(null)
    setConnected(false)
  }

  return (
    <div className="app">
      <header className="header">
      <div className={`loading ${loading ? 'show' : ''}`}>
        <div className="loader"></div>
      </div>
        {typeof window.ethereum !== 'undefined' ? (
          <div>
          {!connected && (
            <button className='connect' onClick={connect}>CONNECT</button>
          )}
          {connected && (
            <section>
            <button className='disconnect' onClick={disconnect}>{name}</button>
            <h1>Hello World!</h1>
            </section>
          )}
          </div>
        ) : (
          <button onClick={installMetamask}>
            Install Metamask
          </button>
        )}

        <Notification
          message={notification.message}
          show={notification.show}
          setShow={(show) => setNotification({ ...notification, show })} />
      </header>
    </div>
  );
}

export default App;
