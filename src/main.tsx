import { Buffer } from "buffer";
window.Buffer = window.Buffer ?? Buffer;

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import App from "./App";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./index.css";

// Empty array relies on Wallet Standard auto-detection for Phantom/Solflare
const wallets = [];

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: "#EF4444", fontSize: 13, fontFamily: "monospace", whiteSpace: "pre-wrap", overflow: "auto", height: "100vh", background: "#FFFFFF" }}>
          <strong>Fatal Root Crash:</strong>{"\n"}{this.state.error.message}
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <ConnectionProvider endpoint={clusterApiUrl("devnet")}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </RootErrorBoundary>
  </React.StrictMode>
);
