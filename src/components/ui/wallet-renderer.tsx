"use client";

import { useState } from "react";
import { BrowserProvider, Contract, parseEther } from "ethers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { Button } from "@/src/components/ui/button";
import { cn, classesFromStyleProps } from "@/src/lib/utils";
import { WalletElement } from "@/src/types";

// Minimal ERC-20 ABI
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (bool)",
    "function approve(address spender, uint amount) returns (bool)"
];

// Minimal ERC-721 ABI
const ERC721_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function approve(address to, uint256 tokenId)",
    "function safeTransferFrom(address from, address to, uint256 tokenId)"
];

export function WalletRenderer({
    element,
    state,
    t,
    runEventHandler,
}: {
    element: WalletElement;
    state: Record<string, any>;
    t: (k: string) => string;
    runEventHandler: (h?: any, d?: any) => Promise<void>;
}) {
    const [address, setAddress] = useState<string | null>(null);
    const [chainId, setChainId] = useState<number | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);

    // 🔹 Connect wallet
    const connect = async () => {
        try {
            if (element.provider === "metamask") {
                if (!(window as any).ethereum) throw new Error("MetaMask not found");
                const prov = new BrowserProvider((window as any).ethereum);
                await prov.send("eth_requestAccounts", []);
                const signer = await prov.getSigner();
                const addr = await signer.getAddress();
                const net = await prov.getNetwork();

                setProvider(prov);
                setAddress(addr);
                setChainId(Number(net.chainId));

                if (element.onConnect)
                    await runEventHandler(element.onConnect, { address: addr, chainId: net.chainId, provider: "metamask" });
            }

            if (element.provider === "walletconnect") {
                const wc = await WalletConnectProvider.init({
                    projectId: element.projectId!,
                    chains: [element.chainId],
                    showQrModal: true,
                });
                await wc.enable();

                const prov = new BrowserProvider(wc as any);
                const signer = await prov.getSigner();
                const addr = await signer.getAddress();
                const net = await prov.getNetwork();

                setProvider(prov);
                setAddress(addr);
                setChainId(Number(net.chainId));

                if (element.onConnect)
                    await runEventHandler(element.onConnect, { address: addr, chainId: net.chainId, provider: "walletconnect" });
            }
        } catch (err) {
            console.error("Wallet connect error:", err);
            if (element.onError) runEventHandler(element.onError, { message: String(err) });
        }
    };

    // 🔹 Disconnect
    const disconnect = async () => {
        setProvider(null);
        setAddress(null);
        setChainId(null);
        if (element.onDisconnect) await runEventHandler(element.onDisconnect, {});
    };

    // 🔹 Native crypto
    const signMessage = async (msg: string) => {
        if (!provider) throw new Error("No provider");
        const signer = await provider.getSigner();
        return await signer.signMessage(msg);
    };

    const sendTransaction = async (to: string, valueEth: string) => {
        if (!provider) throw new Error("No provider");
        const signer = await provider.getSigner();
        return await signer.sendTransaction({
            to,
            value: parseEther(valueEth),
        });
    };

    // 🔹 ERC-20 helpers
    const erc20Balance = async (tokenAddress: string) => {
        if (!provider || !address) throw new Error("No provider/address");
        const erc20 = new Contract(tokenAddress, ERC20_ABI, provider);
        return await erc20.balanceOf(address);
    };

    const erc20Transfer = async (tokenAddress: string, to: string, amount: string) => {
        if (!provider) throw new Error("No provider");
        const signer = await provider.getSigner();
        const erc20 = new Contract(tokenAddress, ERC20_ABI, signer);
        return await erc20.transfer(to, amount);
    };

    // 🔹 ERC-721 helpers
    const erc721Balance = async (tokenAddress: string) => {
        if (!provider || !address) throw new Error("No provider/address");
        const erc721 = new Contract(tokenAddress, ERC721_ABI, provider);
        return await erc721.balanceOf(address);
    };

    const erc721Transfer = async (tokenAddress: string, to: string, tokenId: string) => {
        if (!provider || !address) throw new Error("No provider/address");
        const signer = await provider.getSigner();
        const erc721 = new Contract(tokenAddress, ERC721_ABI, signer);
        return await erc721["safeTransferFrom(address,address,uint256)"](address, to, tokenId);
    };

    // 🔹 Render
    return (
        <div className={cn("flex flex-col items-center gap-2", classesFromStyleProps(element.styles))}>
            {address ? (
                <>
                    <div className="text-sm">
                        {t("Connected:")} {address.slice(0, 6)}...{address.slice(-4)} ({chainId})
                    </div>
                    <Button variant="destructive" onClick={disconnect}>
                        {t("Disconnect")}
                    </Button>

                    {element.mode !== "button" && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={async () => {
                                    const sig = await signMessage("Hello from AltCodePro!");
                                    alert(`Signature: ${sig}`);
                                }}
                            >
                                {t("Sign Message")}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={async () => {
                                    const tx = await sendTransaction(address!, "0.001");
                                    alert(`Tx hash: ${tx.hash}`);
                                }}
                            >
                                {t("Send 0.001 ETH")}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={async () => {
                                    const bal = await erc20Balance("0xYourERC20TokenAddress");
                                    alert(`ERC-20 Balance: ${bal.toString()}`);
                                }}
                            >
                                {t("Check ERC-20 Balance")}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={async () => {
                                    const bal = await erc721Balance("0xYourERC721TokenAddress");
                                    alert(`ERC-721 Balance: ${bal.toString()}`);
                                }}
                            >
                                {t("Check ERC-721 Balance")}
                            </Button>
                        </>
                    )}
                </>
            ) : (
                <Button variant="secondary" onClick={connect}>
                    {t("Connect Wallet")}
                </Button>
            )}
        </div>
    );
}
