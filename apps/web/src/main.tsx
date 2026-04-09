import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { NotificationProvider } from "./context/NotificationContext";
import { queryClient } from "./lib/queryClient";
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const authDisabled = String(import.meta.env.VITE_DISABLE_AUTH ?? "").toLowerCase() === "true";
const authEnabled = Boolean(publishableKey) && !authDisabled;

const app = (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NotificationProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  authEnabled ? <ClerkProvider publishableKey={publishableKey}>{app}</ClerkProvider> : app
);
