/* HUELLA — Icon. Misma API que el original (name/size/stroke/color/fill/style),
   ahora respaldado por lucide-react. */
import {
  ArrowRight, ChevronLeft, ChevronRight, MapPin, Heart, Bookmark, Search,
  SlidersHorizontal, House, Map, User, Sparkles, Clock, Route, Mountain,
  Check, X, Share, Download, Sun, Star, Leaf, Shield, Compass, Thermometer,
  Eye, Wifi, Landmark, Utensils, Zap, Coffee, Camera, Activity, Moon, Tent,
  Bike, Waves, Users, Gem, Crown, Flame, Snowflake, Trees, Footprints,
  Award, Medal, Lock,
} from "lucide-react";

const ICONS = {
  arrowRight: ArrowRight, chevLeft: ChevronLeft, chevRight: ChevronRight,
  pin: MapPin, heart: Heart, bookmark: Bookmark, search: Search,
  sliders: SlidersHorizontal, home: House, map: Map, user: User,
  sparkles: Sparkles, clock: Clock, route: Route, mountain: Mountain,
  check: Check, x: X, share: Share, download: Download, sun: Sun,
  star: Star, leaf: Leaf, shield: Shield, compass: Compass,
  thermometer: Thermometer, eye: Eye, wifi: Wifi, building: Landmark,
  utensils: Utensils, bolt: Zap, cup: Coffee, camera: Camera,
  activity: Activity, moon: Moon, tent: Tent, bike: Bike,
  waves: Waves, users: Users, gem: Gem, crown: Crown, flame: Flame,
  snowflake: Snowflake, trees: Trees, footprints: Footprints,
  award: Award, medal: Medal, lock: Lock,
};

export default function Icon({
  name,
  size = 20,
  stroke = 1.6,
  color = "currentColor",
  fill = "none",
  style,
}) {
  const Cmp = ICONS[name] || Compass;
  return (
    <Cmp
      width={size}
      height={size}
      strokeWidth={stroke}
      color={color}
      fill={fill}
      style={style}
    />
  );
}
