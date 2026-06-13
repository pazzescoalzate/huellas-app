import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PerfilProvider } from "./context/PerfilContext.jsx";
import { GuardadosProvider } from "./context/GuardadosContext.jsx";
import "./index.css";

/* Orden de los proveedores (de afuera hacia adentro):
   1. AuthProvider   — sesión de Supabase (lo necesitan todos los demás)
   2. PerfilProvider — perfil del usuario (necesita AuthContext)
   3. GuardadosProvider — favoritos del usuario (necesita AuthContext)
   4. App            — pantallas de la app */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <PerfilProvider>
        <GuardadosProvider>
          <App />
        </GuardadosProvider>
      </PerfilProvider>
    </AuthProvider>
  </StrictMode>
);
