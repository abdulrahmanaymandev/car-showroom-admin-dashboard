import "./App.css";
import { BrowserRouter, Route, Navigate, Routes } from "react-router-dom";
import { useState } from "react";

import DashBoard from "./layouts/DashBoard";
import Login from "./Pages/Login/Login";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Login */}
            <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

            {/* Dashboard + nested pages */}
            <Route
              path="/dashboard/*"
              element={isLoggedIn ? <DashBoard setIsLoggedIn={setIsLoggedIn} /> : <Navigate to="/login" replace />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
