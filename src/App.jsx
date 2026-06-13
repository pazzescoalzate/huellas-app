/* HUELLA — app root */
import { useState, useEffect } from "react";
import { BottomNav } from "./components/Shared.jsx";
import Onboarding from "./components/Onboarding.jsx";
import Home from "./components/Home.jsx";
import ToursScreen from "./components/Tours.jsx";
import SavedScreen from "./components/Saved.jsx";
import ProfileScreen from "./components/Profile.jsx";
import DetailSheet from "./components/Detail.jsx";
import LocationSheet from "./components/Location.jsx";
import { LOCATIONS } from "./data/huella.js";

function readState() {
  try {
    return JSON.parse(localStorage.getItem("huella_state") || "{}");
  } catch {
    return {};
  }
}

export default function App() {
  const stored = readState();
  const [phase, setPhase] = useState(stored.phase || "onboarding"); // onboarding | app
  const [tab, setTab] = useState(stored.tab || "home");
  const [saved, setSaved] = useState(stored.saved || []);
  const [prefs, setPrefs] = useState(stored.prefs || null);
  const [open, setOpen] = useState(null); // experience detail
  const [locId, setLocId] = useState(stored.locId || "actual");
  const [locSheet, setLocSheet] = useState(false);
  const loc = LOCATIONS.find((l) => l.id === locId) || LOCATIONS[0];

  useEffect(() => {
    localStorage.setItem(
      "huella_state",
      JSON.stringify({ phase, tab, saved, prefs, locId })
    );
  }, [phase, tab, saved, prefs, locId]);

  const toggleSave = (id) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <div className="room">
      <div className="screen">
        {phase === "onboarding" && (
          <Onboarding
            onComplete={(p) => {
              setPrefs(p);
              setPhase("app");
              setTab("home");
            }}
          />
        )}
        {phase === "app" && (
          <>
            {tab === "home" && (
              <Home
                direction="editorial"
                saved={saved}
                onSave={toggleSave}
                onOpen={setOpen}
                prefs={prefs}
                location={loc.name}
                onChangeLocation={() => setLocSheet(true)}
              />
            )}
            {tab === "tours" && <ToursScreen location={loc.name} />}
            {tab === "saved" && (
              <SavedScreen saved={saved} onSave={toggleSave} onOpen={setOpen} />
            )}
            {tab === "profile" && (
              <ProfileScreen
                prefs={
                  prefs || {
                    intereses: ["Naturaleza", "Miradores", "Cafés"],
                    compania: "Con pareja",
                    actividad: "Moderado",
                  }
                }
                onSavePrefs={setPrefs}
              />
            )}
            <BottomNav active={tab} onNav={setTab} />
          </>
        )}
        {open && (
          <DetailSheet
            exp={open}
            saved={saved.includes(open.id)}
            onSave={toggleSave}
            onClose={() => setOpen(null)}
          />
        )}
        {locSheet && (
          <LocationSheet
            current={locId}
            onPick={(l) => setLocId(l.id)}
            onClose={() => setLocSheet(false)}
          />
        )}
      </div>
    </div>
  );
}
