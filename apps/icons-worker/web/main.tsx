import * as React from "react";
import { createRoot } from "react-dom/client";

import "./styles.css";
import { App } from "./app";

const rootEl = document.getElementById("root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
