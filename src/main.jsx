import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import GamesApp from "./games/GamesApp.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/rechner" element={<App />} />
        <Route path="/spiele" element={<GamesApp />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
