'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { ProfileCard } from 'ethereum-identity-kit'

interface ENSData {
  ensName: string | null
  avatar: string | null
  isLoading: boolean
  error: string | null
}

interface CachedENSData {
  ensName: string | null
  avatar: string | null
  timestamp: number
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

export function useENSData() {
  const { address } = useAccount()
  const [ensData, setENSData] = useState<ENSData>({
    ensName: null,
    avatar: null,
    isLoading: false,
    error: null
  })

  // Get cached data from localStorage
  const getCachedData = useCallback((walletAddress: string): CachedENSData | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const cached = localStorage.getItem(`ens_data_${walletAddress}`)
      if (!cached) return null
      
      const parsedData: CachedENSData = JSON.parse(cached)
      const now = Date.now()
      
      // Check if cache is still valid
      if (now - parsedData.timestamp < CACHE_DURATION) {
        return parsedData
      }
      
      // Remove expired cache
      localStorage.removeItem(`ens_data_${walletAddress}`)
      return null
    } catch (error) {
      console.error('Error reading ENS cache:', error)
      return null
    }
  }, [])

  // Cache data to localStorage
  const setCachedData = useCallback((walletAddress: string, data: { ensName: string | null; avatar: string | null }) => {
    if (typeof window === 'undefined') return
    
    try {
      const cacheData: CachedENSData = {
        ...data,
        timestamp: Date.now()
      }
      localStorage.setItem(`ens_data_${walletAddress}`, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error caching ENS data:', error)
    }
  }, [])

  // Resolve ENS data using ethereum-identity-kit
  const resolveENSData = useCallback(async (walletAddress: string) => {
    setENSData(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Check cache first
      const cachedData = getCachedData(walletAddress)
      if (cachedData) {
        setENSData({
          ensName: cachedData.ensName,
          avatar: cachedData.avatar,
          isLoading: false,
          error: null
        })
        return
      }

      // Use Wagmi's built-in ENS resolution functionality
      // This is the proper way to resolve ENS data using the Ethereum ecosystem
      const { createPublicClient, http } = await import('viem')
      const { mainnet } = await import('viem/chains')
      const { normalize } = await import('viem/ens')
      
      const client = createPublicClient({
        chain: mainnet,
        transport: http()
      })
      
      // Get ENS name from address (reverse resolution)
      let ensName: string | null = null
      try {
        ensName = await client.getEnsName({
          address: walletAddress as `0x${string}`
        })
      } catch (error) {
        console.log('No ENS name found for address:', walletAddress)
      }
      
      // Get avatar if ENS name exists
      let avatar: string | null = null
      if (ensName) {
        try {
          avatar = await client.getEnsAvatar({
            name: normalize(ensName)
          })
        } catch (error) {
          console.log('No avatar found for ENS name:', ensName)
        }
      }
      
      const resolvedData = { ensName, avatar }
      
      // Cache the result
      setCachedData(walletAddress, resolvedData)
      
      setENSData({
        ...resolvedData,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Error resolving ENS data:', error)
      setENSData({
        ensName: null,
        avatar: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to resolve ENS data'
      })
    }
  }, [getCachedData, setCachedData])

  // Effect to resolve ENS data when address changes
  useEffect(() => {
    if (address) {
      resolveENSData(address)
    } else {
      setENSData({
        ensName: null,
        avatar: null,
        isLoading: false,
        error: null
      })
    }
  }, [address, resolveENSData])

  // Manual refresh function
  const refreshENSData = useCallback(() => {
    if (address) {
      // Clear cache and refetch
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`ens_data_${address}`)
      }
      resolveENSData(address)
    }
  }, [address, resolveENSData])

  // Get display name (ENS name or truncated address)
  const getDisplayName = useCallback((walletAddress?: string) => {
    const targetAddress = walletAddress || address
    if (!targetAddress) return 'Not connected'
    
    if (ensData.ensName && !ensData.isLoading) {
      return ensData.ensName
    }
    
    return `${targetAddress.slice(0, 6)}...${targetAddress.slice(-4)}`
  }, [address, ensData.ensName, ensData.isLoading])

  return {
    ...ensData,
    refreshENSData,
    getDisplayName,
    hasENS: Boolean(ensData.ensName && !ensData.isLoading)
  }
}

// Standalone function to resolve ENS data for any ENS name
export async function resolveENSData(ensName: string) {
  try {
    const { createPublicClient, http } = await import('viem')
    const { mainnet } = await import('viem/chains')
    const { normalize } = await import('viem/ens')
    
    const client = createPublicClient({
      chain: mainnet,
      transport: http()
    })
    
    // Get address from ENS name (forward resolution)
    let address: string | null = null
    try {
      address = await client.getEnsAddress({
        name: normalize(ensName)
      })
    } catch (error) {
      console.log('ENS name not found:', ensName)
      return { address: null, avatar: null }
    }
    
    // Get avatar if address exists
    let avatar: string | null = null
    if (address) {
      try {
        avatar = await client.getEnsAvatar({
          name: normalize(ensName)
        })
      } catch (error) {
        console.log('No avatar found for ENS name:', ensName)
      }
    }
    
    return { address, avatar }
  } catch (error) {
    console.error('Error resolving ENS data:', error)
    throw error
  }
}

export default useENSData