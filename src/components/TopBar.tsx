import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

require('@solana/wallet-adapter-react-ui/styles.css');

const TopBar: FC = () => {
  const { connected, disconnect, publicKey } = useWallet();
  const { setVisible } = useWalletModal();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDisconnect = async () => {
    await disconnect();
    setIsMenuOpen(false);
  };

  const handleChangeWallet = () => {
    setVisible(true);
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">AlyraSign</h1>
          </div>
          <div className="flex items-center">
            <div className="relative">
              {connected ? (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none"
                  >
                    <span className="truncate max-w-[150px]">
                      {publicKey?.toBase58().slice(0, 4)}...{publicKey?.toBase58().slice(-4)}
                    </span>
                    <ChevronDownIcon className="h-5 w-5" />
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu">
                        <button
                          onClick={handleChangeWallet}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Changer de wallet
                        </button>
                        <button
                          onClick={handleDisconnect}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Se déconnecter
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar; 