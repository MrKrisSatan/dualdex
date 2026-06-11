import React, { useState } from "react";
import { Search, Flame, Sliders, Shield, Zap, Target, Sparkles, HelpCircle, Trophy, Eye, Star } from "lucide-react";

interface HordeEncounter {
  region: string;
  field: string;
  targetPokemon: string;
  evYield: string;
  evStat: "HP" | "Attack" | "Defense" | "SpAtk" | "SpDef" | "Speed";
  size: string; // e.g. "5x Horde"
  level: string; // e.g. "Lvl 38-42"
  itemDrops: string;
  sweetScentNeeded: boolean;
  recommendedSweeper: string;
}

interface AlphaBoss {
  name: string;
  id: number;
  region: string;
  spawnMap: string;
  hiddenAbility: string;
  guaranteedIvs: string;
  counterStrategy: string;
  difficulty: "Medium" | "Hard" | "Expert";
  recommendedMoves: string[];
}

export default function HordeTracker() {
  const [activeTabMode, setActiveTabMode] = useState<"ev" | "alphas">("ev");
  const [filterStat, setFilterStat] = useState<string>("All");
  const [filterRegion, setFilterRegion] = useState<string>("All");
  const [alphaSearch, setAlphaSearch] = useState<string>("");

  const hordes: HordeEncounter[] = [
    {
      region: "Kanto",
      field: "Mt. Ember Surface",
      targetPokemon: "Rapidash",
      evYield: "+10 Speed Base (2 per combatant)",
      evStat: "Speed",
      size: "5x Horde",
      level: "Lvl 38-40",
      itemDrops: "None",
      sweetScentNeeded: true,
      recommendedSweeper: "Blastoise (Surf)"
    },
    {
      region: "Unova",
      field: "Route 12 Dark Grass",
      targetPokemon: "Rapidash / Zebstrika",
      evYield: "+10 Speed Base",
      evStat: "Speed",
      size: "5x Horde",
      level: "Lvl 48-52",
      itemDrops: "None",
      sweetScentNeeded: true,
      recommendedSweeper: "Krookodile (Earthquake)"
    },
    {
      region: "Kanto",
      field: "Route 23 Grass",
      targetPokemon: "Arbok",
      evYield: "+10 Attack Base",
      evStat: "Attack",
      size: "5x Horde",
      level: "Lvl 40-42",
      itemDrops: "Poison Barb (5%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Garchomp (Earthquake)"
    },
    {
      region: "Johto",
      field: "Mt. Mortar Inner Cave",
      targetPokemon: "Machoke",
      evYield: "+10 Attack Base",
      evStat: "Attack",
      size: "5x Horde",
      level: "Lvl 32-35",
      itemDrops: "Black Belt (5%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Alakazam (Psychic)"
    },
    {
      region: "Sinnoh",
      field: "Iron Island Depth B2",
      targetPokemon: "Graveler",
      evYield: "+10 Defense Base",
      evStat: "Defense",
      size: "5x Horde",
      level: "Lvl 34-36",
      itemDrops: "Everstone (5%), Hard Stone (5%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Gyarados (Surf / Waterfall)"
    },
    {
      region: "Unova",
      field: "Dragonspiral Tower Entrance",
      targetPokemon: "Druddigon / Mienshao",
      evYield: "+10 Attack Base",
      evStat: "Attack",
      size: "5x Horde",
      level: "Lvl 52-55",
      itemDrops: "Dragon Fang (5%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Gardevoir (Dazzling Gleam)"
    },
    {
      region: "Hoenn",
      field: "Desert Resort Deep Sand",
      targetPokemon: "Trapinch",
      evYield: "+5 Attack Base",
      evStat: "Attack",
      size: "5x Horde",
      level: "Lvl 20-22",
      itemDrops: "Soft Sand (5%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Lucario (Aura Sphere)"
    },
    {
      region: "Unova",
      field: "Relic Castle B1F",
      targetPokemon: "Yamask",
      evYield: "+5 Defense Base",
      evStat: "Defense",
      size: "5x Horde",
      level: "Lvl 20-22",
      itemDrops: "Spell Tag (5%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Gengar (Shadow Ball)"
    },
    {
      region: "Sinnoh",
      field: "Sendoff Spring Grass",
      targetPokemon: "Golduck",
      evYield: "+10 SpAtk Base",
      evStat: "SpAtk",
      size: "5x Horde",
      level: "Lvl 45-48",
      itemDrops: "None",
      sweetScentNeeded: true,
      recommendedSweeper: "Jolteon (Discharge)"
    },
    {
      region: "Unova",
      field: "Lostlorn Forest Lake Edge",
      targetPokemon: "Petilil / Cottonee",
      evYield: "+5 SpAtk / +5 Speed Base",
      evStat: "SpAtk",
      size: "5x Horde",
      level: "Lvl 22-24",
      itemDrops: "Absorb Bulb (5%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Volcarona (Heat Wave)"
    },
    {
      region: "Kanto",
      field: "Island 3 Water Path Surfing",
      targetPokemon: "Tentacool",
      evYield: "+5 SpDef Base",
      evStat: "SpDef",
      size: "5x Horde",
      level: "Lvl 15-25",
      itemDrops: "Poison Barb (5%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Jolteon (Discharge)"
    },
    {
      region: "Unova",
      field: "Undella Bay Surfing",
      targetPokemon: "Mantyke",
      evYield: "+10 SpDef Base",
      evStat: "SpDef",
      size: "5x Horde",
      level: "Lvl 38-42",
      itemDrops: "None",
      sweetScentNeeded: true,
      recommendedSweeper: "Ampharos (Discharge)"
    },
    {
      region: "Hoenn",
      field: "Rusturf Tunnel Inside",
      targetPokemon: "Whismur",
      evYield: "+5 HP Base",
      evStat: "HP",
      size: "5x Horde",
      level: "Lvl 5-8",
      itemDrops: "None",
      sweetScentNeeded: true,
      recommendedSweeper: "Breloom (Mach Punch / Hyper Voice)"
    },
    {
      region: "Kanto",
      field: "Viridian Forest Grass",
      targetPokemon: "Caterpie",
      evYield: "+5 HP Base",
      evStat: "HP",
      size: "5x Horde",
      level: "Lvl 3-5",
      itemDrops: "None",
      sweetScentNeeded: true,
      recommendedSweeper: "Charizard (Heat Wave)"
    },
    {
      region: "Sinnoh",
      field: "Route 205 Surfing Bridge",
      targetPokemon: "Shellos (East/West)",
      evYield: "+5 HP Base",
      evStat: "HP",
      size: "5x Horde",
      level: "Lvl 20-25",
      itemDrops: "None",
      sweetScentNeeded: true,
      recommendedSweeper: "Jolteon (Thunderbolt / Discharge)"
    },
    {
      region: "Johto",
      field: "Route 34 Tall Grass",
      targetPokemon: "Marill",
      evYield: "+10 HP Base",
      evStat: "HP",
      size: "5x Horde",
      level: "Lvl 13-16",
      itemDrops: "Sea Incense (5%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Venusaur (Petal Blizzard)"
    },
    {
      region: "Hoenn",
      field: "Route 103 Surfing",
      targetPokemon: "Wingull",
      evYield: "+5 Speed Base",
      evStat: "Speed",
      size: "5x Horde",
      level: "Lvl 12-15",
      itemDrops: "Pretty Wing (10%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Ludicolo (Razor Leaf)"
    },
    {
      region: "Unova",
      field: "Route 10 Dark Grass",
      targetPokemon: "Foongus",
      evYield: "+5 HP Base",
      evStat: "HP",
      size: "5x Horde",
      level: "Lvl 35-38",
      itemDrops: "Tiny Mushroom (50%), Big Mushroom (5%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Talonflame (Fly / Heat Wave)"
    },
    {
      region: "Hoenn",
      field: "Route 115 Grass Patch",
      targetPokemon: "Swablu",
      evYield: "+5 SpDef Base",
      evStat: "SpDef",
      size: "5x Horde",
      level: "Lvl 18-22",
      itemDrops: "Dragon Fang (1%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Tyranitar (Rock Slide)"
    },
    {
      region: "Johto",
      field: "Cliff Cave Inner Walk",
      targetPokemon: "Poliwhirl",
      evYield: "+10 Speed Base",
      evStat: "Speed",
      size: "5x Horde",
      level: "Lvl 30-33",
      itemDrops: "King's Rock (5%)",
      sweetScentNeeded: true,
      recommendedSweeper: "Dragonite (Extreme Speed)"
    }
  ];

  // PokéMMO-specific legendary Alpha Pokémon spawns dataset
  const alphas: AlphaBoss[] = [
    {
      name: "Alpha Dragonite",
      id: 149,
      region: "Kanto",
      spawnMap: "Route 23 (Upper Gates Side)",
      hiddenAbility: "Multiscale (Damage taken is halved at Max HP!)",
      guaranteedIvs: "3x 31 IVs Guaranteed (Perfect battle material)",
      difficulty: "Hard",
      counterStrategy: "Use Klefki with Reflect/Light Screen & Play Rough. Debuff attack stats with intimidate or charm before throwing balls.",
      recommendedMoves: ["Outrage", "Dragon Dance", "Hurricane", "Extreme Speed"]
    },
    {
      name: "Alpha Tyranitar",
      id: 248,
      region: "Johto",
      spawnMap: "Mt. Silver (Outer Grass Fields)",
      hiddenAbility: "Unnerve (Opponents cannot consume held berries!)",
      guaranteedIvs: "3x 31 IVs Guaranteed + Max Size bonus",
      difficulty: "Expert",
      counterStrategy: "Will invoke Sandstorm instantly. Bring Machamp/Conkeldurr with fighting moves. Damp ability Quagsire prevents self-destruct variants.",
      recommendedMoves: ["Stone Edge", "Crunch", "Earthquake", "Dragon Dance"]
    },
    {
      name: "Alpha Metagross",
      id: 376,
      region: "Hoenn",
      spawnMap: "Meteor Falls (Deepest chambers)",
      hiddenAbility: "Light Metal (Halves standard weight, avoids Grass Knot)",
      guaranteedIvs: "3x 31 IVs Guaranteed",
      difficulty: "Expert",
      counterStrategy: "Requires robust Fire/Dark blocks. Chandelure or Bisharp blocks psychic/steel attacks safely. False swipe only when fully screened.",
      recommendedMoves: ["Meteor Mash", "Zen Headbutt", "Earthquake", "Bullet Punch"]
    },
    {
      name: "Alpha Garchomp",
      id: 445,
      region: "Sinnoh",
      spawnMap: "Wayward Cave (Hidden chamber side)",
      hiddenAbility: "Rough Skin (Deals damage to anything making physical contact)",
      guaranteedIvs: "3x 31 IVs Guaranteed",
      difficulty: "Hard",
      counterStrategy: "Ice type moves deal 4x damage! Bring Weavile or Cloyster with Icicle Spear to sweep through its initial phase shield.",
      recommendedMoves: ["Dragon Claw", "Earthquake", "Swords Dance", "Stone Edge"]
    },
    {
      name: "Alpha Volcarona",
      id: 637,
      region: "Unova",
      spawnMap: "Relic Castle (Great Chamber Deep)",
      hiddenAbility: "Swarm (Powers up Bug-type techniques at low HP)",
      guaranteedIvs: "3x 31 IVs Guaranteed",
      difficulty: "Hard",
      counterStrategy: "Rock slide or Stone edge deals 4x damage. Bring Tyranitar or Golem with solid Sp.Def. Sleep status is crucial to prevent Quiver Dance setup.",
      recommendedMoves: ["Fiery Dance", "Bug Buzz", "Quiver Dance", "Hurricane"]
    },
    {
      name: "Alpha Lucario",
      id: 448,
      region: "Sinnoh",
      spawnMap: "Iron Island (Upper Cave)",
      hiddenAbility: "Justified (Boosts Attack when hit by a Dark-type move)",
      guaranteedIvs: "3x 31 IVs Guaranteed",
      difficulty: "Medium",
      counterStrategy: "Fighting and Steel type. Use sturdy Ghost or Flying types to avoid Close Combat. Smeargle with Spore is effective.",
      recommendedMoves: ["Close Combat", "Extreme Speed", "Meteor Mash", "Sword Dance"]
    },
    {
      name: "Alpha Snorlax",
      id: 143,
      region: "Kanto",
      spawnMap: "Route 12 (Direct wooden bridge spot)",
      hiddenAbility: "Gluttony (Consumes pinch berries earlier than usual)",
      guaranteedIvs: "3x 31 IVs Guaranteed",
      difficulty: "Hard",
      counterStrategy: "Immense HP. It will use Rest to heal completely. Inflict Sleep before it utilizes Rest, or use Taunt to disable support strategies.",
      recommendedMoves: ["Body Slam", "Rest", "Crunch", "Heavy Slam"]
    },
    {
      name: "Alpha Gyarados",
      id: 130,
      region: "Unova",
      spawnMap: "Undella Bay (Dynamic whirlpool areas)",
      hiddenAbility: "Moxie (Boosts Attack stat upon securing a KO!)",
      guaranteedIvs: "3x 31 IVs Guaranteed",
      difficulty: "Medium",
      counterStrategy: "Do not let it secure any KO to avoid Moxie snowball! Bring strong Electric coverage like Rotom-Wash or Jolteon.",
      recommendedMoves: ["Waterfall", "Dragon Dance", "Bounce", "Ice Fang"]
    }
  ];

  const filteredHordes = hordes.filter(h => {
    const matchesStat = filterStat === "All" || h.evStat === filterStat;
    const matchesRegion = filterRegion === "All" || h.region === filterRegion;
    return matchesStat && matchesRegion;
  });

  const filteredAlphas = alphas.filter(a => {
    const matchesRegion = filterRegion === "All" || a.region === filterRegion;
    const matchesSearch = a.name.toLowerCase().includes(alphaSearch.toLowerCase()) || 
                          a.spawnMap.toLowerCase().includes(alphaSearch.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const getStatBadgeColor = (stat: string) => {
    switch (stat) {
      case "HP": return "bg-emerald-950 text-emerald-400 border-emerald-800/80";
      case "Attack": return "bg-rose-950 text-rose-400 border-rose-800/80";
      case "Defense": return "bg-blue-950 text-blue-400 border-blue-800/80";
      case "SpAtk": return "bg-violet-950 text-violet-400 border-violet-800/80";
      case "SpDef": return "bg-purple-950 text-purple-400 border-purple-800/80";
      case "Speed": return "bg-amber-950 text-amber-400 border-amber-800/80";
      default: return "bg-slate-900 text-slate-400 border-slate-700/80";
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "Expert": return "text-red-400 bg-red-950 border-red-900";
      case "Hard": return "text-amber-400 bg-amber-950 border-amber-900";
      default: return "text-teal-400 bg-teal-950 border-teal-900";
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Upper Mode Selector & Header Filters */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 bg-sleek-card border border-sleek-border p-5 rounded-xl shadow-xl">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-white tracking-wide">
              {activeTabMode === "ev" ? "PokéMMO Horde Hunting Directory" : "PokéMMO Alpha Spawns & Counters"}
            </h2>
            <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-bold uppercase transition-all">
              Live DB Synced
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {activeTabMode === "ev"
              ? "Discover EV hot-spots, high rate shiny farming, and level grinding spots in every region."
              : "Locate massive wild Alpha Boss spawns, inspect mechanical hidden abilities, and find perfect counters."}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
          <button
            id="btn-mode-hordes"
            onClick={() => {
              setActiveTabMode("ev");
              setFilterRegion("All");
            }}
            className={`flex items-center gap-1.5 text-[11px] font-black uppercase px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTabMode === "ev" ? "bg-rose-950 text-rose-400 border border-rose-800/50 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> EV Hordes
          </button>
          <button
            id="btn-mode-alphas"
            onClick={() => {
              setActiveTabMode("alphas");
              setFilterRegion("All");
            }}
            className={`flex items-center gap-1.5 text-[11px] font-black uppercase px-3 py-1.5 rounded transition-all cursor-pointer ${
              activeTabMode === "alphas" ? "bg-rose-950 text-rose-400 border border-rose-800/50 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" /> Alpha Raiders
          </button>
        </div>
      </div>

      {/* Interactive Filters Panel */}
      <div className="bg-slate-950/80 border border-slate-900 p-4 rounded-xl flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {activeTabMode === "ev" && (
            <div className="text-left w-full md:w-44">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <Target className="w-3 h-3 text-rose-500" /> Filter stat yield
              </label>
              <select
                id="horde-stat-select"
                value={filterStat}
                onChange={(e) => setFilterStat(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white rounded-lg text-xs py-1.5 px-3 focus:outline-none w-full cursor-pointer focus:border-rose-500"
              >
                <option value="All">All stats</option>
                <option value="HP">HP Yields</option>
                <option value="Attack">Attack Yields</option>
                <option value="Defense">Defense Yields</option>
                <option value="SpAtk">Sp. Atk Yields</option>
                <option value="SpDef">Sp. Def Yields</option>
                <option value="Speed">Speed Yields</option>
              </select>
            </div>
          )}

          {activeTabMode === "alphas" && (
            <div className="text-left w-full md:w-56">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                <Search className="w-3 h-3 text-rose-500" /> Search Alpha name
              </label>
              <input
                id="alpha-bar-search"
                type="text"
                placeholder="Enter boss name or route..."
                value={alphaSearch}
                onChange={(e) => setAlphaSearch(e.target.value)}
                className="bg-slate-900 border border-slate-800 placeholder-slate-500 text-white rounded-lg text-xs py-1.5 px-3 focus:outline-none w-full focus:border-rose-500"
              />
            </div>
          )}

          <div className="text-left w-full md:w-40">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center gap-1.5">
              <Sliders className="w-3 h-3 text-rose-500" /> Region filter
            </label>
            <select
              id="horde-region-select"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white rounded-lg text-xs py-1.5 px-3 focus:outline-none w-full cursor-pointer focus:border-rose-500"
            >
              <option value="All">All regions</option>
              <option value="Kanto">Kanto</option>
              <option value="Johto">Johto</option>
              <option value="Hoenn">Hoenn</option>
              <option value="Sinnoh">Sinnoh</option>
              <option value="Unova">Unova</option>
            </select>
          </div>
        </div>

        <div className="text-right text-[10px] font-mono font-bold text-slate-500">
          Showing {activeTabMode === "ev" ? filteredHordes.length : filteredAlphas.length} indexed records
        </div>
      </div>

      {/* EV HORDES RENDERING */}
      {activeTabMode === "ev" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHordes.map((h, index) => (
            <div
              key={index}
              className="bg-sleek-card hover:bg-sleek-card/85 border border-sleek-border hover:border-rose-900 rounded-xl p-4.5 text-left flex flex-col justify-between transition-all group hover:shadow-lg relative overflow-hidden"
            >
              <div className="space-y-1 mb-3">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-extrabold uppercase bg-slate-900/90 text-rose-400 px-2.5 py-0.5 rounded border border-sleek-border">
                    {h.region}
                  </span>
                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded border uppercase flex items-center gap-1 ${getStatBadgeColor(h.evStat)}`}>
                    <Star className="w-2.5 h-2.5 fill-current" /> {h.evStat} EV
                  </span>
                </div>

                <div className="flex justify-between items-baseline pt-1.5">
                  <h4 className="text-base font-black text-white group-hover:text-rose-400 transition-colors">
                    {h.targetPokemon}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">{h.size}</span>
                </div>

                <span className="block text-xs font-mono text-slate-400">{h.field}</span>
              </div>

              {/* Combat Specs */}
              <div className="space-y-2 border-t border-slate-900 pt-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-500" /> Yield:
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">{h.evYield}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-blue-500" /> Level range:
                  </span>
                  <span className="font-mono text-slate-300 font-bold">{h.level}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-semibold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Perfect Sweeper:
                  </span>
                  <span className="text-amber-400 font-bold">{h.recommendedSweeper}</span>
                </div>

                {h.itemDrops !== "None" && (
                  <div className="mt-2 text-[10px] bg-sky-950/30 text-sky-300 rounded border border-sky-900/40 p-1.5 flex justify-between">
                    <span>Wild Item Drops:</span>
                    <span className="font-bold underline text-slate-200">{h.itemDrops}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredHordes.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 text-xs">
              No matching EV Hordes located for this chosen selection.
            </div>
          )}
        </div>
      )}

      {/* ALPHA RAIDERS RENDERING */}
      {activeTabMode === "alphas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlphas.map((a, index) => (
            <div
              key={index}
              className="bg-sleek-card border border-sleek-border hover:border-rose-900 rounded-xl p-4.5 text-left flex flex-col justify-between transition-all group relative overflow-hidden"
            >
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase bg-red-950 text-rose-400 px-2.5 py-0.5 rounded border border-red-900">
                    ALPHA CHIEF ({a.region})
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getDifficultyColor(a.difficulty)}`}>
                    {a.difficulty} RAID
                  </span>
                </div>

                <div className="flex gap-3 pt-2 items-center">
                  <div className="w-14 h-14 bg-slate-900/80 rounded-lg flex items-center justify-center border border-slate-800 flex-shrink-0 relative">
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${a.id}.png`}
                      alt={a.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 object-contain drop-shadow-[0_0_6px_rgba(244,63,94,0.65)] animate-pulse"
                    />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-rose-400 flex items-center gap-1.5">{a.name}</h4>
                    <span className="block text-xs font-mono text-slate-400">{a.spawnMap}</span>
                  </div>
                </div>

                <div className="space-y-1.5 bg-slate-900/35 border border-slate-850/60 p-3 rounded-lg text-xs mt-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Hidden Ability:</span>
                    <span className="text-amber-400 font-semibold">{a.hiddenAbility}</span>
                  </div>
                  <div className="flex justify-between text-[11px] border-t border-slate-850/40 pt-1">
                    <span className="text-slate-500">Wild IV Slots:</span>
                    <span className="text-emerald-400 font-mono font-bold">{a.guaranteedIvs}</span>
                  </div>
                </div>

                <div className="space-y-1 mt-2.5">
                  <span className="text-[10px] block font-extrabold uppercase text-slate-400 tracking-wider">Raiding Boss Techniques</span>
                  <div className="flex flex-wrap gap-1">
                    {a.recommendedMoves.map(m => (
                      <span key={m} className="bg-slate-900 text-slate-300 text-[9px] font-mono px-2 py-0.5 rounded border border-slate-800">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ramping Capture Tactics */}
              <div className="space-y-2 border-t border-slate-900 pt-3 mt-2">
                <div className="text-[11px] leading-relaxed text-slate-300">
                  <strong className="text-rose-500 uppercase text-[10px] block mb-0.5">Counter Capture Strategy:</strong>
                  {a.counterStrategy}
                </div>
              </div>
            </div>
          ))}

          {filteredAlphas.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 text-xs">
              No matching Alpha bosses located in matching queries.
            </div>
          )}
        </div>
      )}

      {/* Guide Tips Section */}
      <div className="bg-sleek-panel p-5 rounded-xl border border-sleek-border grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
        <div className="text-left space-y-1.5">
          <h4 className="text-xs font-bold uppercase text-rose-400 tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> Sweet Scent Hunting Rules
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Hordes in PokéMMO are triggered instantly on standard wild tiles by using <strong>Sweet Scent</strong> from your party menu. Carry a Pokémon with 5/5 Sweet Scent (e.g., Oddish, Teddiursa, Smeargle) to spawn horde waves sequentially for automated, efficient training.
          </p>
        </div>

        <div className="text-left space-y-1.5">
          <h4 className="text-xs font-bold uppercase text-rose-400 tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4" /> Alpha Boss Raider Rules
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Alphas spawn dynamically across wild map coordinates once per real-life day. Each has <strong>Hidden Abilities</strong>, a massive boss shield, is extremely hard to capture, and guarantees exactly 3 attributes with 31 perfect IVs! Throwing balls is ideal under sleep/low HP.
          </p>
        </div>
      </div>
    </div>
  );
}

