"use client";

import type { ReactNode } from "react";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { bscTestnet } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import { useWagmiConfig } from "./wagmi.ts";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";

export function Providers(props: { children: ReactNode }) {
    const queryClient = new QueryClient();

    return (
        <WagmiProvider config={useWagmiConfig()}>
            <QueryClientProvider client={queryClient}>
                <OnchainKitProvider
                    apiKey={import.meta.env.VITE_PUBLIC_ONCHAINKIT_API}
                    chain={bscTestnet}
                >
                    <RainbowKitProvider modalSize="compact" theme={darkTheme()}>
                        {props.children}
                    </RainbowKitProvider>
                </OnchainKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
