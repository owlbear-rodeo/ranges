import React from "react";
import ReactDOM from "react-dom/client";

import { Settings } from "./Settings";
import { PluginGate } from "../util/PluginGate";
import { PluginThemeProvider } from "../util/PluginThemeProvider";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PluginGate>
      <PluginThemeProvider>
        <CssBaseline />
        <Settings />
      </PluginThemeProvider>
    </PluginGate>
  </React.StrictMode>
);
