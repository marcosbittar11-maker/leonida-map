import {
  ArrowDownToDot, BedDouble, Bird, BookCopy, BookOpen, Bomb, Building, Building2, Bus, Car,
  Check, CircleAlert, Clapperboard, Coins, Cross, Crosshair,
  Droplets, Drone, Dumbbell, Egg, FerrisWheel, Fish, FlagTriangleRight, Flame, FlaskConical, Flower2, Footprints,
  Fuel, Gamepad2, Gem, HandCoins, Handshake, Headphones, House, Landmark, MapPin, Martini, Motorbike,
  Music2, Orbit, Package, Palette, PillBottle, Plane, PlaneTakeoff, Rabbit, ScanEye, Scissors, ScrollText,
  Shell, Shield, Shirt, ShoppingBag, Skull, Smartphone, Spade, SprayCan, Store, Target, TrainFront,
  TreePalm, Truck, Utensils, Vault, Volleyball, WalletCards, Waves, Wrench, Zap
} from 'lucide-static';

const categorySymbols = {
  arcade:Gamepad2, bank:Landmark, basejump:ArrowDownToDot, bookswap:BookCopy, bottle:ScrollText,
  bret:Footprints, bridge:Plane, building:Building, card:Spade, civic:Building2, drone:Drone,
  event:CircleAlert, fence:Handshake, fishing:Fish, flamingo:Bird, food:Utensils, gang:Skull,
  hoop:Volleyball, hotel:BedDouble, hunting:Rabbit, kenton:Target, knife:PlaneTakeoff,
  leisure:FerrisWheel, magazine:BookOpen, meditation:Flower2, meteorite:Orbit, mural:Palette,
  nature:TreePalm, other:MapPin, package:Package, payday:HandCoins, playlist:Music2,
  race:FlagTriangleRight, range:Crosshair, safe:Vault, safehouse:House, shop:ShoppingBag,
  smash:Gem, store:Store, stunt:Motorbike, towatm:Truck, transport:Bus, treasure:Coins,
  underwater:Shell, vehicle:Car, waink:ScanEye, weapon:Bomb, streetart:SprayCan,
  workshop:Wrench, ammushop:Crosshair, style:Scissors, clothes:Shirt, gym:Dumbbell, easter:Egg, electronics:Headphones,
  tablet:Smartphone, drug:PillBottle, custom:MapPin
};

const placeSymbols = {
  'ammu-nation':Crosshair, 'gas station':Fuel, 'police station':Shield, 'fire station':Flame,
  hospital:Cross, 'hair salon':Scissors, marina:Waves, airport:Plane, ferry:Waves, station:TrainFront,
  'bus stop':Bus, 'ev charger':Zap, 'car wash':Droplets, atm:WalletCards, 'vehicle rental':Car,
  'liquor store':Martini, bar:Martini, cinema:Clapperboard, golf:FlagTriangleRight
};
const placeKinds = new Set(['shop','civic','transport','leisure','food']);

export function pointSymbol(point, completed=false) {
  if (completed) return Check;
  if (point.id==='safe-070') return FlaskConical;
  if (point.id==='liquor-store-002') return Bird;
  const type=placeKinds.has(point.kind) ? point.type?.toLowerCase() : null;
  return (type && Object.hasOwn(placeSymbols,type) ? placeSymbols[type] : categorySymbols[point.kind]) || MapPin;
}
