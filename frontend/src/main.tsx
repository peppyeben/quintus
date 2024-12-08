import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Providers } from "./providers.tsx";
import { BrowserRouter as Router } from "react-router-dom";

import "@coinbase/onchainkit/styles.css";
import "@rainbow-me/rainbowkit/styles.css";

createRoot(document.getElementById("root")!).render(
    <Router>
        <StrictMode>
            <Providers>
                <App />
            </Providers>
        </StrictMode>
    </Router>
);
