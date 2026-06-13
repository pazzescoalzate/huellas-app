import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PerfilProvider } from "./context/PerfilContext.jsx";
import "./index.css";

/* AuthProvider gestiona la sesión (login / logout).
   PerfilProvider va adentro porque necesita leer useAuth()
   para cargar el perfil del usuario cuando haya sesión activa. */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <PerfilProvider>
        <App />
      </PerfilProvider>
    </AuthProvider>
  </StrictMode>
);
