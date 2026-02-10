import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

const isBase = process.env.NEXT_PUBLIC_CHAIN === "base";

export const config = isBase
  ? createConfig({
      chains: [base],
      connectors: [injected(), coinbaseWallet({ appName: "ChainClash" })],
      transports: { [base.id]: http() },
      ssr: true,
    })
  : createConfig({
      chains: [baseSepolia],
      connectors: [injected(), coinbaseWallet({ appName: "ChainClash" })],
      transports: { [baseSepolia.id]: http() },
      ssr: true,
    });
