import React, { useState } from "react";
import { Search, SlidersHorizontal, BookOpen, Layers, CheckCircle2, Circle, Eye, ChevronRight, Activity, Plus } from "lucide-react";
import { pokemonDb, PokemonData } from "../data/pokemonDb";

interface PokedexExplorerProps {
  onAddToTeam?: (pokemon: PokemonData) => void;
  onInspectOnEmulator?: (pokemon: PokemonData) => void;
  caughtIds: number[];
  onToggleCaught: (id: number) => void;
}

export default function PokedexExplorer({ onAddToTeam, onInspectOnEmulator, caughtIds, onToggleCaught }: PokedexExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedEggGroup, setSelectedEggGroup] = useState<string>("All");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [caughtFilter, setCaughtFilter] = useState<"All" | "Caught" | "Uncaught">("All");
  const [expandedDexId, setExpandedDexId] = useState<number | null>(25);

  const [activeDetailTab, setActiveDetailTab] = useState<"bio" | "hunting" | "skills">("bio");
  const [calcHpPercent, setCalcHpPercent] = useState<number>(30);
  const [calcStatus, setCalcStatus] = useState<string>("None");
  const [calcBall, setCalcBall] = useState<string>("Ultra Ball");
  const [calcIsAlpha, setCalcIsAlpha] = useState<boolean>(false);

  const types = ["All", "Electric", "Fire", "Flying", "Water", "Ghost", "Poison", "Dark", "Fighting", "Steel", "Bug", "Dragon", "Normal", "Psychic", "Fairy"];
  const eggGroups = ["All", "Field", "Monster", "Dragon", "Water 1", "Water 2", "Amorphous", "Human-Like", "Bug"];
  const regions = ["All", "Kanto", "Johto", "Hoenn", "Sinnoh", "Unova"];

  const filteredPokemon = pokemonDb.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toString() === searchQuery;
    const matchesType = selectedType === "All" || p.types.includes(selectedType);
    const matchesEgg = selectedEggGroup === "All" || p.eggGroups.includes(selectedEggGroup);
    
    // Check if any locations match chosen region
    const matchesRegion = selectedRegion === "All" || p.locations.some(loc => loc.region.toLowerCase().includes(selectedRegion.toLowerCase()));

    const isCaught = caughtIds.includes(p.id);
    const matchesCaught = caughtFilter === "All" || 
                          (caughtFilter === "Caught" && isCaught) || 
                          (caughtFilter === "Uncaught" && !isCaught);

    return matchesSearch && matchesType && matchesEgg && matchesRegion && matchesCaught;
  });

  const toggleCaught = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCaught(id);
  };

  const getStatColor = (value: number) => {
    if (value >= 120) return "bg-red-500 shadow-lg shadow-red-500/20";
    if (value >= 90) return "bg-amber-500 shadow-md shadow-amber-500/20";
    if (value >= 60) return "bg-emerald-500 shadow-md shadow-emerald-500/20";
    return "bg-sky-500 shadow shadow-sky-500/10";
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 text-left">
      {/* FILTER & Pokédex LIST (Left side - 5 cols) */}
      <div className="xl:col-span-12 flex flex-col md:flex-row gap-4 items-end bg-sleek-card p-4 rounded-xl border border-sleek-border">
        <div className="flex-1 w-full text-left">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-rose-500" /> Search Database
          </label>
          <div className="relative">
            <input
              id="pokedex-search"
              type="text"
              placeholder="Enter Pokémon name or exact Id..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-sleek-panel border border-sleek-border focus:border-rose-500 text-white placeholder-slate-500 rounded-lg text-xs py-2 px-3 focus:outline-none"
            />
          </div>
        </div>

        <div className="w-full md:w-auto text-left">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-rose-500" /> Type
          </label>
          <select
            id="pokedex-filter-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-36 bg-slate-900 border border-slate-800 focus:border-rose-500 text-white rounded-lg text-xs py-2 px-2.5 focus:outline-none"
          >
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-auto text-left">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            Egg Group
          </label>
          <select
            id="pokedex-filter-egg"
            value={selectedEggGroup}
            onChange={(e) => setSelectedEggGroup(e.target.value)}
            className="w-full md:w-36 bg-slate-900 border border-slate-800 focus:border-rose-500 text-white rounded-lg text-xs py-2 px-2.5 focus:outline-none"
          >
            {eggGroups.map(eg => (
              <option key={eg} value={eg}>{eg}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-auto text-left">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            Region Specifics
          </label>
          <select
            id="pokedex-filter-region"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full md:w-38 bg-slate-900 border border-slate-800 focus:border-rose-500 text-white rounded-lg text-xs py-2 px-2.5 focus:outline-none"
          >
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-auto text-left">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            Specimen Status
          </label>
          <select
            id="pokedex-filter-caught"
            value={caughtFilter}
            onChange={(e) => setCaughtFilter(e.target.value as any)}
            className="w-full md:w-38 bg-slate-900 border border-slate-800 focus:border-rose-500 text-white rounded-lg text-xs py-2 px-2.5 focus:outline-none bg-sleek-panel"
          >
            <option value="All">All Specimens</option>
            <option value="Caught">Caught Only</option>
            <option value="Uncaught">Uncaught Only</option>
          </select>
        </div>
      </div>

      <div className="xl:col-span-5 flex flex-col gap-3">
        <div className="bg-sleek-card p-4 border border-sleek-border rounded-xl max-h-[500px] overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-rose-500" /> Database Results ({filteredPokemon.length})
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">
              Caught Tracker: {caughtIds.length} / {pokemonDb.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {filteredPokemon.map(p => {
              const matchesActive = expandedDexId === p.id;
              const hasCaught = caughtIds.includes(p.id);

              return (
                <div
                  id={`dex-item-${p.id}`}
                  key={p.id}
                  onClick={() => setExpandedDexId(p.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    matchesActive 
                      ? "bg-rose-950/30 border-rose-800 shadow" 
                      : "bg-sleek-panel/65 border-sleek-border hover:bg-sleek-panel hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Caught tracker icon checkbox */}
                    <button
                      id={`btn-toggle-caught-${p.id}`}
                      onClick={(e) => toggleCaught(p.id, e)}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer flex-shrink-0"
                    >
                      {hasCaught ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                    <span className="font-mono text-xs text-rose-400 font-bold flex-shrink-0">#{p.id.toString().padStart(3, "0")}</span>
                    <div className="truncate text-left">
                      <span className="block font-extrabold text-white text-sm leading-snug">{p.name}</span>
                      <div className="flex gap-1.5 mt-1">
                        {p.types.map(t => (
                          <span key={t} className="text-[9px] font-bold px-1.5 py-0.2 rounded uppercase bg-sleek-card text-slate-300 border border-sleek-border">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {onInspectOnEmulator && (
                      <button
                        id={`btn-ins-em-${p.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectOnEmulator(p);
                        }}
                        title="Simulate battle detection on device"
                        className="p-1.5 rounded bg-sleek-panel border border-sleek-border text-rose-400 hover:text-white hover:bg-rose-955/40 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  </div>
                </div>
              );
            })}

            {filteredPokemon.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs">
                No matching Pokémon located in Gen 1-5 database indexes.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAILED BIO VIEW (Right side - 7 cols) */}
      <div className="xl:col-span-7">
        {expandedDexId !== null ? (() => {
          const detail = pokemonDb.find(p => p.id === expandedDexId);
          if (!detail) return null;

          // PokéMMO standard capture mathematical estimator
          const catchChance = (() => {
            const baseRate = detail.catchRate || 45;
            let statusFactor = 1.0;
            if (calcStatus === "Sleep/Freeze") statusFactor = 2.5;
            if (calcStatus === "Paralyze/Poison/Burn") statusFactor = 1.5;

            let ballFactor = 1.0;
            if (calcBall === "Great Ball") ballFactor = 1.5;
            if (calcBall === "Ultra Ball") ballFactor = 2.0;
            if (calcBall === "Dusk Ball" || calcBall === "Net Ball") ballFactor = 3.5;
            if (calcBall === "Repeat Ball") ballFactor = 3.0;
            if (calcBall === "Timer Ball") ballFactor = 4.0;

            const alphaPenalty = calcIsAlpha ? 0.45 : 1.0;

            // Compute formula percentage: ((3*MaxHP - 2*CurHP) * BaseRate * BallFactor / (3*MaxHP)) * StatusFactor * AlphaPenalty
            const hpFactor = (300 - 2 * calcHpPercent) / 300;
            const a = hpFactor * baseRate * ballFactor * alphaPenalty;
            const catchRateVal = a * statusFactor;

            if (catchRateVal >= 255) return 100;
            const p = (catchRateVal / 255) * 100;
            return Math.min(Math.max(p, 0.1), 100);
          })();

          const avgBallsRequired = Math.ceil(100 / catchChance);

          return (
            <div className="bg-sleek-card border border-sleek-border rounded-xl p-5 space-y-5">
              {/* Header profile */}
              <div className="flex justify-between items-start border-b border-sleek-border pb-3">
                <div className="text-left">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-xl font-black text-white">{detail.name}</h2>
                    <span className="text-sm text-slate-500 font-mono">#{detail.id.toString().padStart(3, "0")}</span>
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    {detail.types.map(t => (
                      <span key={t} className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-sleek-panel text-slate-200 border border-sleek-border">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  {onAddToTeam && (
                    <button
                      id="btn-add-team-from-dex"
                      onClick={() => onAddToTeam(detail)}
                      className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add to Team
                    </button>
                  )}
                </div>
              </div>

              {/* Advanced Navigation Tabs in Specimen Screen */}
              <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-[10px] font-bold gap-1 mt-2">
                <button
                  id="tab-detail-bio"
                  onClick={() => setActiveDetailTab("bio")}
                  className={`flex-1 py-1.5 rounded transition-all text-center uppercase tracking-wider ${
                    activeDetailTab === "bio" ? "bg-rose-950 text-rose-400 border border-rose-900" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Bio & Base Stats
                </button>
                <button
                  id="tab-detail-hunting"
                  onClick={() => setActiveDetailTab("hunting")}
                  className={`flex-1 py-1.5 rounded transition-all text-center uppercase tracking-wider ${
                    activeDetailTab === "hunting" ? "bg-rose-950 text-rose-400 border border-rose-900" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Catch Calculator & Wilds
                </button>
                <button
                  id="tab-detail-skills"
                  onClick={() => setActiveDetailTab("skills")}
                  className={`flex-1 py-1.5 rounded transition-all text-center uppercase tracking-wider ${
                    activeDetailTab === "skills" ? "bg-rose-950 text-rose-400 border border-rose-900" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Moves & Learnset
                </button>
              </div>

              {/* TAB 1: BIO & BASE STATS OVERVIEW */}
              {activeDetailTab === "bio" && (
                <div className="space-y-4">
                  {/* Bio & Abilities */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] block font-bold text-slate-500 uppercase tracking-widest mb-1">Rotom Dex Log</span>
                        <p className="text-xs text-slate-300 leading-relaxed italic pr-2">
                          "{detail.description}"
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] block font-bold text-slate-500 uppercase tracking-widest mb-1.5">Inherent Abilities</span>
                        <div className="flex flex-wrap gap-1.5">
                          {detail.abilities.map(ab => (
                            <span key={ab} className="text-[10px] bg-sleek-panel text-slate-300 px-2 py-0.5 rounded border border-sleek-border">
                              {ab}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Standard capture static details */}
                    <div className="bg-sleek-panel border border-sleek-border p-4 rounded-xl space-y-2 text-xs">
                      <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1">Catch Analytics</span>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Species Capture Rate:</span>
                        <span className="font-mono text-white font-bold">{detail.catchRate} <span className="text-[10px] text-slate-500">(/255)</span></span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Egg Groups:</span>
                        <span className="font-semibold text-slate-300">{detail.eggGroups.join(", ")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Held Wild Item Drops:</span>
                        <span className="text-amber-400 font-bold truncate max-w-[150px]">{detail.heldItems}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-1.5">
                        <span className="text-slate-400">EV Harvest Yield:</span>
                        <span className="text-emerald-400 font-bold font-mono">{detail.evYield}</span>
                      </div>
                    </div>
                  </div>

                  {/* Base Stats sliders */}
                  <div className="bg-sleek-panel/50 border border-sleek-border p-4 rounded-xl text-left">
                    <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-rose-500" /> Base Stats Panel
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      {Object.entries(detail.baseStats).map(([stat, val]) => {
                        const labelMap: Record<string, string> = {
                          hp: "HP",
                          attack: "Attack",
                          defense: "Defense",
                          spAtk: "Sp. Atk",
                          spDef: "Sp. Def",
                          speed: "Speed"
                        };
                        const percent = Math.min((val / 160) * 100, 100);

                        return (
                          <div key={stat} className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-semibold text-slate-400 uppercase text-[10px] font-mono">{labelMap[stat]}</span>
                              <span className="font-bold text-slate-200">{val}</span>
                            </div>
                            <div className="w-full bg-sleek-card h-2 rounded overflow-hidden">
                              <div 
                                className={`h-full rounded transition-all duration-500 ${getStatColor(val)}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CATCH RATE MATH ESTIMATOR & WILD FIELD COORDINATES */}
              {activeDetailTab === "hunting" && (
                <div className="space-y-4">
                  {/* Catch Rate Simulator Block */}
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-left space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-rose-450 text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> PokéMMO Dynamic Catch Simulator
                      </span>
                      <span className="bg-slate-950 border border-slate-800 text-[9px] font-mono px-2 py-0.5 rounded text-slate-400">
                        Gen 5 Formulas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-3.5">
                        {/* HP remaining slider */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400 font-bold">Target Wild HP:</span>
                            <span className="text-rose-400 font-mono font-black">{calcHpPercent}% Remaining</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={calcHpPercent}
                            onChange={(e) => setCalcHpPercent(Number(e.target.value))}
                            className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500"
                          />
                          <p className="text-[9px] text-slate-500 italic">Use False Swipe moves to lock health securely at 1% for maximum advantage.</p>
                        </div>

                        {/* Status Select */}
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-400 uppercase font-black">Specimen Status Condition</label>
                          <select
                            value={calcStatus}
                            onChange={(e) => setCalcStatus(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-slate-200 rounded p-1.5 focus:outline-none w-full text-xs"
                          >
                            <option value="None">None (1.0x)</option>
                            <option value="Paralyze/Poison/Burn">Paralyzed / Poisoned / Burnt (1.5x)</option>
                            <option value="Sleep/Freeze">Asleep / Frozen (2.5x multiplier!)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        {/* Ball Type select */}
                        <div className="space-y-1">
                          <label className="block text-[10px] text-slate-400 uppercase font-black">Ball Spec Selection</label>
                          <select
                            value={calcBall}
                            onChange={(e) => setCalcBall(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-slate-200 rounded p-1.5 focus:outline-none w-full text-xs"
                          >
                            <option value="Poke Ball">Poke Ball (1.0x)</option>
                            <option value="Great Ball">Great Ball (1.5x)</option>
                            <option value="Ultra Ball">Ultra Ball (2.0x)</option>
                            <option value="Dusk Ball">Dusk Ball (3.5x in caves/nighttime)</option>
                            <option value="Net Ball">Net Ball (3.5x on Water / Bug species)</option>
                            <option value="Repeat Ball">Repeat Ball (3.0x on already-caught index)</option>
                            <option value="Timer Ball">Timer Ball (4.0x multiplier after Turn 10)</option>
                          </select>
                        </div>

                        {/* Alpha penalty selector */}
                        <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 mt-2">
                          <div className="text-left">
                            <label className="block text-[10px] text-slate-400 uppercase font-black">Alpha Boss Specimen Penalty</label>
                            <span className="text-[9px] text-slate-500 leading-none">Alhas trigger a mandatory 0.45x penalty</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={calcIsAlpha}
                            onChange={(e) => setCalcIsAlpha(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-850 accent-rose-500 bg-slate-900 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Simulation probability output display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 border border-slate-900 p-3.5 rounded-xl text-xs">
                      <div className="text-left space-y-1 border-r border-slate-900 pr-2">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Estimated Catch Success</span>
                        <h4 className="text-xl font-black text-emerald-400 font-mono tracking-tight">
                          {catchChance.toFixed(1)}% <span className="text-xs text-slate-400 font-normal">chance</span>
                        </h4>
                        <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              catchChance >= 75 ? "bg-emerald-500" : catchChance >= 40 ? "bg-amber-500" : "bg-rose-500"
                            }`} 
                            style={{ width: `${catchChance}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-left space-y-0.5 pl-1.5 flex flex-col justify-center">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Expected attempts required</span>
                        <p className="text-xs text-slate-300 leading-snug">
                          Requires approximately <strong className="text-amber-400 font-mono text-sm leading-none">{avgBallsRequired}</strong> {calcBall}s on average to capture species.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* PokéMMO Encounter Wild Locations */}
                  <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl text-left text-xs space-y-2">
                    <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest mb-1.5">PokéMMO Wild Field Locations</span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-slate-300">
                        <thead>
                          <tr className="border-b border-sleek-border text-[10px] text-slate-400 uppercase font-mono">
                            <th className="pb-1 text-left font-semibold">Region</th>
                            <th className="pb-1 text-left font-semibold">Route / Map Coordinates</th>
                            <th className="pb-1 text-left font-semibold">Method</th>
                            <th className="pb-1 text-right font-semibold">Spawn Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-[11px]">
                          {detail.locations.map((loc, index) => (
                            <tr key={index} className="hover:bg-slate-900/35">
                              <td className="py-1.5 text-slate-200 font-bold">{loc.region}</td>
                              <td className="py-1.5 text-slate-300">{loc.map}</td>
                              <td className="py-1.5 text-slate-400">{loc.encounter}</td>
                              <td className="py-1.5 text-right font-bold font-mono text-rose-400">{loc.rate}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COMPLETE LEVELS MOVESET LEARNSET */}
              {activeDetailTab === "skills" && (
                <div className="space-y-4">
                  {/* Moveset Learnset table */}
                  <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-xl text-left text-xs space-y-2">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] block font-bold text-slate-400 uppercase tracking-widest">Levels Learnset Techniques</span>
                      <span className="text-[9px] uppercase font-mono text-slate-500 font-bold">Gen 1-5 PokeMMO Database compatibility</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                      {detail.moves.map(m => (
                        <div key={m.name} className="flex justify-between items-center bg-sleek-card p-2.5 rounded-lg border border-sleek-border text-left">
                          <div className="space-y-0.5">
                            <span className="block font-semibold text-slate-200 text-xs">{m.name}</span>
                            <div className="flex gap-1.5 items-center">
                              <span className="bg-slate-900 text-slate-400 text-[8px] font-bold py-0.2 px-1 rounded uppercase tracking-wider">{m.type}</span>
                              <span className="text-slate-500 text-[9px]">{m.category}</span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="text-[9px] text-slate-400 font-mono font-bold uppercase">Lvl.{m.level}</span>
                            {m.power && <span className="font-mono text-[9px] font-black text-rose-400">Pwr: {m.power}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })() : (
          <div className="bg-sleek-card rounded-xl border border-sleek-border py-20 text-center text-slate-500">
            Select a target Pokémon in the index list to query its metrics, catch formulas, learned techniques, and PokéMMO region coordinates.
          </div>
        )}
      </div>
    </div>
  );
}
