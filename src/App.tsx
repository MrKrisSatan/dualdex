import React, { useState } from "react";
import { 
  Tv, 
  Search, 
  Award, 
  Dribbble, 
  TrendingUp, 
  Terminal, 
  Settings, 
  Moon, 
  Sun, 
  Activity, 
  Gamepad2, 
  Cpu,
  Layers,
  Sparkles
} from "lucide-react";
import AndroidEmulatorSimulator from "./components/AndroidEmulatorSimulator";
import PokedexExplorer from "./components/PokedexExplorer";
import HordeTracker from "./components/HordeTracker";
import TeamBuilder from "./components/TeamBuilder";
import GtlMarket from "./components/GtlMarket";
import KotlinExportHub from "./components/KotlinExportHub";
import { PokemonData } from "./data/pokemonDb";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("simulator");
  const [themeMode, setThemeMode] = useState<"oled" | "rotom" | "jade">("oled");
  const [activeTeam, setActiveTeam] = useState<PokemonData[]>([]);
  const [scannedOpponent, setScannedOpponent] = useState<any | null>(null);
  const [caughtIds, setCaughtIds] = useState<number[]>([25, 130]); // Shared caught indices

  const handleToggleCaught = (id: number) => {
    setCaughtIds(prev =>
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const handleAddToTeam = (p: PokemonData) => {
    if (activeTeam.length >= 6) {
      alert("PokéMMO matches support a maximum of 6 standard combatant party slots.");
      return;
    }
    // Prevent duplicate slot additions
    if (activeTeam.some(m => m.id === p.id)) {
      alert(`${p.name} is already slotted in your active layout.`);
      return;
    }
    setActiveTeam(prev => [...prev, p]);
    alert(`${p.name} added to Team Builder Slot #${activeTeam.length + 1}!`);
  };

  const handleInspectOnEmulator = (p: PokemonData) => {
    // Dynamically simulate an OCR lock triggers on this Pokemon
    const mockScanData = {
      detectedPokemon: p.name,
      detectedLevel: Math.floor(Math.random() * 40) + 15,
      isShiny: Math.random() < 0.05,
      matchupAnalysis: {
        types: p.types,
        weaknesses: p.weaknesses || ["Varies"],
        resistances: p.resistances || [],
        immunities: p.immunities || []
      },
      captureRecommendation: {
        catchRate: p.catchRate || 45,
        optBall: p.catchRate > 150 ? "Poke Ball" : "Ultra Ball",
        lureEncounter: false,
        heldItemProbability: p.heldItems || "None"
      },
      combatStrategy: {
        recommendedMoveTypes: p.weaknesses || [],
        threatMoves: ["Tackle", "Bite"],
        evYield: p.evYield || "1 HP",
        advice: `Simulated OCR capture matched securely with database properties for ${p.name}. Core is synced.`
      }
    };
    setScannedOpponent(mockScanData);
    setActiveTab("simulator");
  };

  // Theme styling helpers
  const getThemeClass = () => {
    switch (themeMode) {
      case "rotom":
        return "bg-sleek-bg text-slate-100 selection:bg-rose-500 selection:text-white border-4 border-sleek-border";
      case "jade":
        return "bg-sleek-bg text-slate-100 selection:bg-emerald-500 selection:text-white border-4 border-sleek-border";
      default: // oled
        return "bg-sleek-bg text-zinc-100 selection:bg-rose-500 selection:text-white border-4 border-sleek-border";
    }
  };

  const getHeaderClass = () => {
    switch (themeMode) {
      case "rotom":
        return "border-rose-950/80 bg-sleek-panel/95 backdrop-blur-md";
      case "jade":
        return "border-emerald-950/80 bg-sleek-panel/95 backdrop-blur-md";
      default:
        return "border-sleek-border bg-sleek-panel/95 backdrop-blur-md";
    }
  };

  return (
    <div data-theme={themeMode} className={`min-h-screen pb-6 font-sans transition-colors duration-300 flex flex-col justify-between ${getThemeClass()}`}>
      
      {/* GLOBAL SCIFI HEADER BRIDGE */}
      <header className={`sticky top-0 z-50 border-b px-6 py-4 shadow-lg transition-all ${getHeaderClass()}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Main App branding and subline */}
          <div className="flex items-center gap-4 text-left">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-rose-700 flex items-center justify-center border border-rose-400/50 flex-shrink-0 animate-pulse">
              <div className="w-3.5 h-3.5 rounded-full bg-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white uppercase italic">
                  PokéMMO <span className="text-rose-500">DualDex</span>
                </h1>
                <span className="text-[9px] font-mono leading-none bg-rose-950/85 text-rose-400 px-2 py-0.5 rounded border border-rose-800/50 font-bold uppercase tracking-wider">
                  HUD v3.4b
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide font-medium mt-0.5">
                Companion cockpit for Ayn platforms, emulated foldables, and secondary Android layers.
              </p>
            </div>
          </div>

          {/* Theme custom presets selector and System Status */}
          <div className="flex items-center gap-6 flex-wrap md:flex-nowrap">
            <div className="flex bg-slate-900/60 p-1 rounded-lg border border-slate-800 text-[10px] font-bold gap-1 items-center">
              <span className="text-slate-500 px-2 uppercase">Theme:</span>
              <button
                id="btn-theme-oled"
                onClick={() => setThemeMode("oled")}
                className={`px-2.5 py-1 rounded transition-colors ${themeMode === "oled" ? "bg-zinc-805 bg-zinc-800 text-white font-black" : "text-slate-400 hover:text-white"}`}
              >
                OLED
              </button>
              <button
                id="btn-theme-rotom"
                onClick={() => setThemeMode("rotom")}
                className={`px-2.5 py-1 rounded transition-colors ${themeMode === "rotom" ? "bg-rose-950 text-rose-400 font-black border border-rose-800/40" : "text-slate-400 hover:text-white"}`}
              >
                Rotom
              </button>
              <button
                id="btn-theme-jade"
                onClick={() => setThemeMode("jade")}
                className={`px-2.5 py-1 rounded transition-colors ${themeMode === "jade" ? "bg-emerald-950 text-emerald-400 font-black border border-emerald-800/40" : "text-slate-400 hover:text-white"}`}
              >
                Jade
              </button>
            </div>

            <div className="h-4 w-px bg-slate-800 hidden md:block"></div>

            {/* Quick status report badge with battery */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="font-mono text-[10px] tracking-wide">OCR: LINKED (6/6 ACTIVE)</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-400 hidden sm:flex">
                <span className="font-mono uppercase text-[10px] font-bold">Battery: 82%</span>
                <div className="w-9 h-4 bg-slate-900 rounded border border-slate-800 p-0.5 flex">
                  <div className="w-7 h-full bg-emerald-500 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* TABS SELECT NAVIGATION CONTAINER */}
      <div className="max-w-7xl mx-auto px-5 mt-6 w-full flex-1">
        <div className="flex border-b border-slate-800/60 overflow-x-auto gap-2 pb-px shrink-0">
          <button
            id="tab-simulator"
            onClick={() => setActiveTab("simulator")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === "simulator"
                ? "border-rose-500 text-rose-400 bg-rose-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Tv className="w-4 h-4" /> Dual-Screen Companion Simulator
          </button>
          <button
            id="tab-explorer"
            onClick={() => setActiveTab("explorer")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === "explorer"
                ? "border-rose-500 text-rose-400 bg-rose-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Search className="w-4 h-4" /> Unified Pokédex Search
          </button>
          <button
            id="tab-hordes"
            onClick={() => setActiveTab("hordes")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === "hordes"
                ? "border-rose-500 text-rose-400 bg-rose-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-4 h-4" /> Horde & EV Hot-Spots
          </button>
          <button
            id="tab-teambuilder"
            onClick={() => setActiveTab("teambuilder")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === "teambuilder"
                ? "border-rose-500 text-rose-400 bg-rose-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Dribbble className="w-4 h-4" /> Synergy Team Builder
          </button>
          <button
            id="tab-market"
            onClick={() => setActiveTab("market")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === "market"
                ? "border-rose-500 text-rose-400 bg-rose-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp className="w-4 h-4" /> GTL Market Analytics
          </button>
          <button
            id="tab-kotlin"
            onClick={() => setActiveTab("kotlin")}
            className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === "kotlin"
                ? "border-rose-500 text-rose-400 bg-rose-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-4 h-4" /> Kotlin Code Exporter
          </button>
        </div>

        {/* ACTIVE MODULE CONTAINER MAPPING */}
        <div className="my-6">
          {activeTab === "simulator" && (
            <AndroidEmulatorSimulator 
              onPokemonDetected={setScannedOpponent} 
              selectedTeam={activeTeam}
              caughtIds={caughtIds}
              onToggleCaught={handleToggleCaught}
              scannedOpponent={scannedOpponent}
            />
          )}

          {activeTab === "explorer" && (
            <PokedexExplorer 
              onAddToTeam={handleAddToTeam} 
              onInspectOnEmulator={handleInspectOnEmulator}
              caughtIds={caughtIds}
              onToggleCaught={handleToggleCaught}
            />
          )}

          {activeTab === "hordes" && (
            <HordeTracker />
          )}

          {activeTab === "teambuilder" && (
            <TeamBuilder 
              activeTeam={activeTeam} 
              onTeamUpdate={setActiveTeam} 
              scannedOpponent={scannedOpponent}
            />
          )}

          {activeTab === "market" && (
            <GtlMarket />
          )}

          {activeTab === "kotlin" && (
            <KotlinExportHub />
          )}
        </div>
      </div>

      {/* COCKPIT COMPATIBLE FOOTER */}
      <footer className="h-10 bg-sleek-panel border-t border-sleek-border flex items-center justify-between px-6 text-[10px] text-slate-500 font-mono mt-auto shrink-0 select-none">
        <div className="flex gap-4">
          <span>PROFILE: POKEMMO_HACKED</span>
          <span>GEN_LOGIC: V8_FAIRY</span>
        </div>
        <div className="flex gap-4">
          <span className="text-rose-500 font-bold">BATTLE_MODE: ON</span>
          <span className="text-slate-400">V1.4.2_STABLE</span>
        </div>
      </footer>
      
    </div>
  );
}
