import { useMemo } from 'react'
import { BrowserProvider, JsonRpcSigner } from 'ethers'
import { useWalletClient } from 'wagmi'
import { type WalletClient } from 'viem'

export function clientToSigner(client: WalletClient) {
    const { account, chain, transport } = client
    const network = {
        chainId: chain?.id,
        name: chain?.name,
        ensAddress: chain?.contracts?.ensRegistry?.address,
    }
    const provider = new BrowserProvider(transport, network)
    const signer = new JsonRpcSigner(provider, account?.address ?? '') // Fallback or handle undefined
    return signer
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
    const { data: walletClient } = useWalletClient({ chainId })
    return useMemo(
        () => (walletClient ? clientToSigner(walletClient) : undefined),
        [walletClient],
    )
}
