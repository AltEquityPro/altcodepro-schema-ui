"use client";

import { useState } from "react";
import { BrowserProvider, Contract, parseEther } from "ethers";
import WalletConnectProvider from "@walletconnect/ethereum-provider";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn, classesFromStyleProps, resolveBinding } from "@/src/lib/utils";
import { WalletElement } from "@/src/types";
import { Checkbox } from "@/src/components/ui/checkbox"; // add shadcn/ui checkbox

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

    // track per-function form state
    const [formValues, setFormValues] = useState<Record<string, Record<string, any>>>({});

    const setInputValue = (fnKey: string, inputName: string, val: any) => {
        setFormValues((prev) => ({
            ...prev,
            [fnKey]: { ...(prev[fnKey] || {}), [inputName]: val },
        }));
    };

    // --- Connect ---
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
                if (element.onConnect) await runEventHandler(element.onConnect, { address: addr, chainId: net.chainId });
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
                if (element.onConnect) await runEventHandler(element.onConnect, { address: addr, chainId: net.chainId });
            }
        } catch (err) {
            if (element.onError) runEventHandler(element.onError, { message: String(err) });
        }
    };

    const disconnect = async () => {
        setProvider(null);
        setAddress(null);
        setChainId(null);
        if (element.onDisconnect) await runEventHandler(element.onDisconnect, {});
    };

    // --- Contract call ---
    const runContractFunction = async (
        contractDef: NonNullable<WalletElement["contracts"]>[number],
        fn: NonNullable<WalletElement["contracts"]>[number]["functions"][number],
        args: any[]
    ) => {
        if (!provider) throw new Error("No provider");
        const addr = String(resolveBinding(contractDef.address, state, t));
        const contract = new Contract(addr, contractDef.abi, fn.type === "write" ? await provider.getSigner() : provider);

        try {
            const result = await contract[fn.name](...args);
            if (fn.onResult) await runEventHandler(fn.onResult, { result: result?.toString?.() });
            return result;
        } catch (err) {
            if (element.onError) await runEventHandler(element.onError, { message: String(err) });
        }
    };

    // --- Auto-detect input type ---
    const renderInput = (fnKey: string, inp: { name: string; type: string; placeholder?: string }) => {
        const val = formValues[fnKey]?.[inp.name] ?? "";

        if (inp.type.startsWith("uint") || inp.type.startsWith("int")) {
            return (
                <Input
                    key={inp.name}
                    type="number"
                    placeholder={inp.placeholder || inp.name}
                    value={val}
                    onChange={(e) => setInputValue(fnKey, inp.name, e.target.value)}
                />
            );
        }
        if (inp.type === "address") {
            return (
                <Input
                    key={inp.name}
                    type="text"
                    placeholder={inp.placeholder || "0x..."}
                    value={val}
                    onChange={(e) => setInputValue(fnKey, inp.name, e.target.value)}
                />
            );
        }
        if (inp.type === "bool") {
            return (
                <div key={inp.name} className="flex items-center gap-2">
                    <Checkbox
                        checked={!!val}
                        onCheckedChange={(checked) => setInputValue(fnKey, inp.name, checked)}
                    />
                    <span>{inp.placeholder || inp.name}</span>
                </div>
            );
        }
        // default: string/bytes
        return (
            <Input
                key={inp.name}
                type="text"
                placeholder={inp.placeholder || inp.name}
                value={val}
                onChange={(e) => setInputValue(fnKey, inp.name, e.target.value)}
            />
        );
    };

    return (
        <div className={cn("flex flex-col gap-4 items-center", classesFromStyleProps(element.styles))}>
            {address ? (
                <>
                    <div className="text-sm">
                        {t("Connected:")} {address.slice(0, 6)}...{address.slice(-4)} (chain {chainId})
                    </div>
                    <Button variant="destructive" onClick={disconnect}>
                        {t("Disconnect")}
                    </Button>

                    {element.mode !== "button" &&
                        element.contracts?.map((c, i) => (
                            <div key={i} className="w-full flex flex-col gap-3 border p-3 rounded">
                                {c.functions.map((fn, j) => {
                                    const fnKey = `${c.address}-${fn.name}-${j}`;
                                    const inputs = fn.inputs || [];
                                    return (
                                        <div key={fnKey} className="flex flex-col gap-2">
                                            <div className="font-semibold">{fn.label || fn.name}</div>
                                            {inputs.map((inp) => renderInput(fnKey, inp))}
                                            <Button
                                                variant="secondary"
                                                onClick={async () => {
                                                    const args = inputs.map((inp) => {
                                                        let raw = formValues[fnKey]?.[inp.name];
                                                        if (inp.type.startsWith("uint") || inp.type.startsWith("int")) {
                                                            return raw ? BigInt(raw) : 0n;
                                                        }
                                                        if (inp.type === "bool") {
                                                            return !!raw;
                                                        }
                                                        return raw;
                                                    });
                                                    const result = await runContractFunction(c, fn, args);
                                                    if (result) alert(`${fn.name} result: ${result.toString()}`);
                                                }}
                                            >
                                                {t("Run")} {fn.label || fn.name}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                </>
            ) : (
                <Button variant="secondary" onClick={connect}>
                    {t("Connect Wallet")}
                </Button>
            )}
        </div>
    );
}
