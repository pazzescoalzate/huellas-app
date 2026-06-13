/* Mapeo categoría → imagen de escena. Vite resuelve cada import a su URL final. */
import naturaleza from "../assets/scenes/naturaleza.png";
import senderismo from "../assets/scenes/senderismo.png";
import gastronomia from "../assets/scenes/gastronomia.png";
import fotografia from "../assets/scenes/fotografia.png";
import cultura from "../assets/scenes/cultura.png";
import urbano from "../assets/scenes/urbano.png";
import miradores from "../assets/scenes/miradores.png";
import cafes from "../assets/scenes/cafes.png";
import bienestar from "../assets/scenes/bienestar.png";
import aventura from "../assets/scenes/aventura.png";

export const SCENES = {
  naturaleza,
  senderismo,
  gastronomia,
  fotografia,
  cultura,
  urbano,
  miradores,
  cafes,
  bienestar,
  aventura,
};

export const sceneFor = (cat) => SCENES[cat] || SCENES.urbano;
