"use client";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
    coinbaseWallet,
    metaMaskWallet,
    rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { useMemo } from "react";
import { http, createConfig } from "wagmi";
import { bscTestnet } from "wagmi/chains";

export function useWagmiConfig() {
    const projectId = import.meta.env.VITE_PUBLIC_WC_PROJECT_ID ?? "";
    if (!projectId) {
        const providerErrMessage =
            "To connect to all Wallets you need to provide a NEXT_PUBLIC_WC_PROJECT_ID env variable";
        throw new Error(providerErrMessage);
    }

    return useMemo(() => {
        const connectors = connectorsForWallets(
            [
                {
                    groupName: "Wallets",
                    wallets: [rainbowWallet, metaMaskWallet, coinbaseWallet],
                },
            ],
            {
                appName: "metrofund",
                projectId,
            }
        );

        const wagmiConfig = createConfig({
            chains: [bscTestnet],
            multiInjectedProviderDiscovery: false,
            connectors,
            ssr: true,
            transports: {
                [bscTestnet.id]: http(),
            },
        });

        return wagmiConfig;
    }, [projectId]);
}
