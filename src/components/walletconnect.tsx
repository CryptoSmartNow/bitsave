import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useChainId, useConfig } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useSwitchChain } from 'wagmi';
import { useState } from 'react';
import { Modal, Button, Spin } from 'antd/lib';
import styles from '../styles/button.module.css';

const WalletConnect = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const config = useConfig();
  const { openConnectModal } = useConnectModal();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { disconnect } = useDisconnect();
  const [modalOpen, setModalOpen] = useState(false);

  const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
  const LSK_ADDRESS = '0xac485391EB2d7D88253a7F1eF18C37f4242D1A24';

  // Get USDC balance on Base
  const { data: usdcBalance, isLoading: isLoadingUsdc } = useBalance({
    address,
    token: USDC_ADDRESS,
    chainId: 8453, // Base chain ID
  });

  // Get LSK balance on Lisk
  const { data: lskBalance, isLoading: isLoadingLsk } = useBalance({
    address,
    token: LSK_ADDRESS,
    chainId: 1135, // Lisk chain ID
  });

  const loading = isLoadingUsdc || isLoadingLsk;

  const getDisplayBalance = () => {
    if (loading) return <Spin size="small" />;
    if (chainId === 8453) {
      return `${usdcBalance?.value ? (Number(usdcBalance.value) / 1e6).toFixed(2) : '0'} USDC`;
    }
    if (chainId === 1135) {
      return `${lskBalance?.value ? (Number(lskBalance.value) / 1e18).toFixed(2) : '0'} LSK`;
    }
    return '0';
  };

  const handleNetworkSwitch = async (newChainId: number) => {
    try {
      await switchChain({ chainId: newChainId });
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setModalOpen(false);
  };

  return (
    <div>
      {!isConnected ? (
        <Button 
          onClick={openConnectModal} 
          className={styles.connectWalletBtn} 
          style={{ width: '100%' }}
        >
          Connect Wallet
        </Button>
      ) : (
        <div className={styles.buttonContainer} style={{ display: 'flex', gap: '10px' }}>
          <Button 
            onClick={() => setModalOpen(true)} 
            className={styles.connectWalletBtn} 
            style={{ width: '45%' }}
          >
            {config.chains.find(c => c.id === chainId)?.name || 'Select Network'}
          </Button>
          <Button 
            className={styles.walletBalanceBtn} 
            style={{ width: 'auto', padding: '0 10px' }}
          >
            <span>
              {address?.substring(0, 5)}...{address?.substring(address.length - 4)}
            </span>
            <span style={{ marginLeft: '8px' }}>
              {getDisplayBalance()}
            </span>
          </Button>
        </div>
      )}

      <Modal
        title="Select Network"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        centered
        className={styles.networkModal}
      >
        <Button 
          onClick={() => handleNetworkSwitch(8453)} 
          block 
          className={styles.networkButton}
          loading={isSwitching}
          disabled={isSwitching}
        >
          Base
        </Button>
        <Button 
          onClick={() => handleNetworkSwitch(1135)} 
          block 
          className={styles.networkButton}
          loading={isSwitching}
          disabled={isSwitching}
        >
          Lisk
        </Button>
        <Button 
          onClick={handleDisconnect} 
          block 
          danger 
          disabled={isSwitching}
          className={styles.networkButton}
          style={{ 
            marginTop: '16px',
            backgroundColor: 'white',
            color: '#ff4d4f',
            borderColor: '#ff4d4f'
          }}
        >
          Disconnect Wallet
        </Button>
      </Modal>
    </div>
  );
};

export default WalletConnect;