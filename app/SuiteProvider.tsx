'use client';
import { useAccount } from 'wagmi';
import dynamic from 'next/dynamic';
import '@getgrowly/suite/styles.css'

// Nextjs requires dynamic loading for the Growly Suite components as it uses browser APIs.
const SuiteProvider = dynamic(() => import('@getgrowly/suite').then(suite => suite.SuiteProvider), {
  ssr: false,
});

const ChatWidget = dynamic(() => import('@getgrowly/suite').then(suite => suite.ChatWidget), {
  ssr: false,
});

/// Agent Id and Organization Id can be retrieved on `app.getsuite.io` (Agents > Integration Guide).
export const SuiteProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isConnected, address } = useAccount();
  const walletAddress = isConnected ? address : undefined;

  if (!process.env.NEXT_PUBLIC_SUITE_AGENT_ID || !process.env.NEXT_PUBLIC_SUITE_API_KEY) {
    console.error('Suite agent ID or API key is not set');
    return <>{children}</>;
  }

  return (
    <SuiteProvider
      context={{
        agentId: process.env.NEXT_PUBLIC_SUITE_AGENT_ID || "",
        organizationApiKey: process.env.NEXT_PUBLIC_SUITE_API_KEY || "",
        config: {
          display: 'panel',
          brandName: 'Bitsave',
        },
        session: {
          walletAddress
        },
      }}
    >
      {children}
      <ChatWidget />
    </SuiteProvider>
  );
};
