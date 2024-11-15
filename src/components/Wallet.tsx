import React, { useState } from 'react';
import useWallet from '../hooks/useWallet';

interface WalletProps {
    onWalletConnected: (address: string) => void;
}

const Wallet: React.FC<WalletProps> = ({ onWalletConnected }) => {
    const { wallet, createNewWallet, importWallet, error } = useWallet();
    const [importKey, setImportKey] = useState('');

    React.useEffect(() => {
        if (wallet.address) onWalletConnected(wallet.address);
    }, [wallet.address, onWalletConnected]);

    return (
        <div className="wallet-checker">
            <h1>City Wallet</h1>
            <button onClick={createNewWallet}>Create Wallet</button>
            <input
                type="text"
                placeholder="Enter your private key"
                value={importKey}
                onChange={(e) => setImportKey(e.target.value)}
            />
            <button onClick={() => importWallet(importKey)}>Import Wallet</button>
            {wallet.address && <p>Wallet Address: {wallet.address}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Wallet;
