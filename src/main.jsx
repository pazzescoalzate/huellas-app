import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { PerfilProvider } from "./context/PerfilContext.jsx";
import { GuardadosProvider } from "./context/GuardadosContext.jsx";
import { VisitadosProvider } from "./context/VisitadosContext.jsx";
import "./index.css";
// CSS de Leaflet: necesario para que el mapa se vea correctamente (tiles, controles, popup)
import "leaflet/dist/leaflet.css";

/* Orden de los proveedores (de afuera hacia adentro):
   1. AuthProvider      — sesión de Supabase (lo necesitan todos los demás)
   2. PerfilProvider    — perfil del usuario (necesita AuthContext)
   3. GuardadosProvider — favoritos del usuario (necesita AuthContext)
   4. VisitadosProvider — lugares visitados (necesita AuthContext)
   5. App               — pantallas de la app */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <PerfilProvider>
        <GuardadosProvider>
          <VisitadosProvider>
            <App />
          </VisitadosProvider>
        </GuardadosProvider>
      </PerfilProvider>
    </AuthProvider>
  </StrictMode>
);
