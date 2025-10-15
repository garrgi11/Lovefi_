import React, { createContext, useContext, ReactNode } from 'react';
import {
  DynamicContextProvider,
  DynamicWidget,
  useDynamicContext,
} from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { FlowWalletConnectors } from '@dynamic-labs/flow';
import { DYNAMIC_CONFIG } from '../config/dynamic';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  primaryWallet: any;
  handleConnect: () => void;
  isConnecting: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  primaryWallet: null,
  handleConnect: () => {},
  isConnecting: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Inner component that provides the actual context values
const AuthContextInner: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dynamicContext = useDynamicContext();
  const { user, primaryWallet, setShowAuthFlow } = dynamicContext;
  
  const isAuthenticated = !!user;
  const handleConnect = () => setShowAuthFlow(true);
  const isConnecting = false; // Simple fallback

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      primaryWallet,
      handleConnect,
      isConnecting,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Navigation wrapper component that uses the navigate hook
const NavigationWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  
  return (
    <DynamicContextProvider
      settings={{
        environmentId: DYNAMIC_CONFIG.environmentId,
        walletConnectors: [EthereumWalletConnectors, FlowWalletConnectors],
        events: {
          onAuthSuccess: (args) => {
            console.log('Auth success:', args);
            // Use React Router navigation instead of window.location
            navigate('/user-info');
          },
          onAuthFailure: (args) => {
            console.log('Auth failure:', args);
          },
        },
      }}
    >
      <AuthContextInner>
        {children}
      </AuthContextInner>
    </DynamicContextProvider>
  );
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <NavigationWrapper>
      {children}
    </NavigationWrapper>
  );
};
