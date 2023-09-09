import "regenerator-runtime/runtime";

import { createRoot } from "react-dom/client";
import { StrictMode } from "react";

import { App } from "./components/App";
import { registerSW } from './helpers/serviceWorkerTools'

registerSW()
const app = document.createElement("div");
app.setAttribute('style', 'height: 100%')

document.body.appendChild(app);

const root = createRoot(app);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
