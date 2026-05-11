"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface SolanaWallet {
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
}

const WalletContext = createContext<SolanaWallet>({
  publicKey: null,
  connected: false,
  connecting: false,
  connect: async () => {},
  disconnect: async () => {},
  signTransaction: async () => { throw new Error("Not connected"); },
  signAllTransactions: async () => { throw new Error("Not connected"); },
});

export function useSolanaWallet() {
  return useContext(WalletContext);
}

interface WalletProviderProps {
  children: ReactNode;
}

export function SolanaWalletProvider({ children }: WalletProviderProps) {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    const checkExisting = async () => {
      const solana = (window as any).solana;
      const phantom = (window as any).phantom?.solana;
      const provider = phantom || solana;

      if (provider?.isPhantom || provider?.isSolflare) {
        setWallet(provider);
        if (provider.isConnected && provider.publicKey) {
          setPublicKey(provider.publicKey.toString());
          setConnected(true);
        }
      }
    };

    checkExisting();
  }, []);

  const connect = useCallback(async () => {
    const solana = (window as any).solana;
    const phantom = (window as any).phantom?.solana;
    const provider = phantom || solana;

    if (!provider) {
      window.open("https://phantom.app/", "_blank");
      return;
    }

    setConnecting(true);
    try {
      const resp = await provider.connect();
      const pk = resp.publicKey?.toString?.() || provider.publicKey?.toString?.();
      if (pk) {
        setPublicKey(pk);
        setConnected(true);
        setWallet(provider);
      }
    } catch (err) {
      console.error("Wallet connection failed:", err);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    if (wallet?.disconnect) {
      await wallet.disconnect();
    }
    setPublicKey(null);
    setConnected(false);
    setWallet(null);
  }, [wallet]);

  const signTransaction = useCallback(
    async (transaction: any) => {
      if (!wallet) throw new Error("Wallet not connected");
      return wallet.signTransaction(transaction);
    },
    [wallet]
  );

  const signAllTransactions = useCallback(
    async (transactions: any[]) => {
      if (!wallet) throw new Error("Wallet not connected");
      return wallet.signAllTransactions(transactions);
    },
    [wallet]
  );

  return (
    <WalletContext.Provider
      value={{
        publicKey,
        connected,
        connecting,
        connect,
        disconnect,
        signTransaction,
        signAllTransactions,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}
