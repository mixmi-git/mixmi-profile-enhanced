import { useState, useEffect } from 'react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)

  useEffect(() => {
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setIsAuthenticated(true)
        setUserAddress(userData.profile.stxAddress.mainnet)
      })
    } else if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData()
      setIsAuthenticated(true)
      setUserAddress(userData.profile.stxAddress.mainnet)
    }
  }, [])

  const connectWallet = async () => {
    showConnect({
      appDetails: {
        name: 'Mixmi Profile',
        icon: window.location.origin + '/favicon.ico',
      },
      redirectTo: '/',
      onFinish: () => {
        setIsAuthenticated(true)
        window.location.reload()
      },
      userSession,
    })
  }

  const disconnectWallet = async () => {
    userSession.signUserOut('/')
    setIsAuthenticated(false)
  }

  return {
    isAuthenticated,
    userAddress,
    connectWallet,
    disconnectWallet
  }
}