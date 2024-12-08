"use client";
import {
    Address,
    Avatar,
    EthBalance,
    Identity,
    Name,
} from "@coinbase/onchainkit/identity";
import {
    ConnectWallet,
    Wallet,
    WalletDropdown,
    WalletDropdownDisconnect,
    ConnectWalletText,
} from "@coinbase/onchainkit/wallet";

type WalletWrapperParams = {
    text?: string;
    className?: string;
    withWalletAggregator?: boolean;
};

export function WalletWrapper({
    className,
    text,
    withWalletAggregator = false,
}: WalletWrapperParams) {
    return (
        <>
            <Wallet>
                <ConnectWallet
                    withWalletAggregator={withWalletAggregator}
                    text={text}
                    className={className}
                >
                    <ConnectWalletText className="text-black">
                        {text}
                    </ConnectWalletText>
                    <Avatar className="h-6 w-6 bg-black stroke-black" />
                    <Name className="text-black" />
                </ConnectWallet>
                <WalletDropdown>
                    <Identity
                        className="px-4 pt-3 pb-2"
                        hasCopyAddressOnClick={true}
                    >
                        <Avatar />
                        <Address />
                        <EthBalance />
                    </Identity>
                    <WalletDropdownDisconnect />
                </WalletDropdown>
            </Wallet>
        </>
    );
}
