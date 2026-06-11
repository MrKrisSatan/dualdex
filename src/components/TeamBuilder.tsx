import React, { useState, useEffect } from "react";
import { Plus, Trash2, Heart, Save, ShieldAlert, Award, AlertTriangle, Sparkles, Sword } from "lucide-react";
import { pokemonDb, PokemonData } from "../data/pokemonDb";

interface TeamBuilderProps {
  activeTeam: PokemonData[];
  onTeamUpdate: (team: PokemonData[]) => void;
  scannedOpponent: any | null; // From Emulator Scanner
}

interface SavedTeam {
  id: string;
  name: string;
  members: PokemonData[];
}

// Full 18 Pokémon types for global mapping calculations
const ALL_TYPES = [
  "Normal", "Fire", "Water", "Grass", "Electric", "Ice", "Fighting", "Poison", 
  "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
];

// Simple type matchups lookup for Gen 6+ (with Fairy retrofits used in modern MMOs)
const TYPE_CHART: Record<string, { strongAgainst: string[]; weakAgainst: string[]; immunities: string[] }> = {
  Normal: { strongAgainst: [], weakAgainst: ["Fighting"], immunities: ["Ghost"] },
  Fire: { strongAgainst: ["Grass", "Ice", "Bug", "Steel"], weakAgainst: ["Fire", "Water", "Rock", "Dragon"], immunities: [] },
  Water: { strongAgainst: ["Fire", "Ground", "Rock"], weakAgainst: ["Water", "Grass", "Dragon"], immunities: [] },
  Grass: { strongAgainst: ["Water", "Ground", "Rock"], weakAgainst: ["Fire", "Grass", "Poison", "Flying", "Bug", "Dragon", "Steel"], immunities: [] },
  Electric: { strongAgainst: ["Water", "Flying"], weakAgainst: ["Grass", "Electric", "Dragon"], immunities: ["Ground"] },
  Ice: { strongAgainst: ["Grass", "Ground", "Flying", "Dragon"], weakAgainst: ["Fire", "Water", "Ice", "Steel"], immunities: [] },
  Fighting: { strongAgainst: ["Normal", "Ice", "Rock", "Dark", "Steel"], weakAgainst: ["Poison", "Flying", "Psychic", "Bug", "Fairy"], immunities: [] },
  Poison: { strongAgainst: ["Grass", "Fairy"], weakAgainst: ["Poison", "Ground", "Rock", "Ghost"], immunities: ["Steel"] },
  Ground: { strongAgainst: ["Fire", "Electric", "Poison", "Rock", "Steel"], weakAgainst: ["Grass", "Bug"], immunities: ["Flying"] },
  Flying: { strongAgainst: ["Grass", "Fighting", "Bug"], weakAgainst: ["Electric", "Rock", "Steel"], immunities: [] },
  Psychic: { strongAgainst: ["Fighting", "Poison"], weakAgainst: ["Psychic", "Steel"], immunities: ["Dark"] },
  Bug: { strongAgainst: ["Grass", "Psychic", "Dark"], weakAgainst: ["Fire", "Fighting", "Poison", "Flying", "Ghost", "Steel", "Fairy"], immunities: [] },
  Rock: { strongAgainst: ["Fire", "Ice", "Flying", "Bug"], weakAgainst: ["Fighting", "Ground", "Steel"], immunities: [] },
  Ghost: { strongAgainst: ["Psychic", "Ghost"], weakAgainst: ["Dark"], immunities: ["Normal"] },
  Dragon: { strongAgainst: ["Dragon"], weakAgainst: ["Steel"], immunities: ["Fairy"] },
  Dark: { strongAgainst: ["Psychic", "Ghost"], weakAgainst: ["Fighting", "Dark", "Fairy"], immunities: [] },
  Steel: { strongAgainst: ["Ice", "Rock", "Fairy"], weakAgainst: ["Fire", "Water", "Electric", "Steel"], immunities: [] },
  Fairy: { strongAgainst: ["Fighting", "Dragon", "Dark"], weakAgainst: ["Fire", "Poison", "Steel"], immunities: [] }
};

export default function TeamBuilder({ activeTeam, onTeamUpdate, scannedOpponent }: TeamBuilderProps) {
  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>([]);
  const [customTeamName, setCustomTeamName] = useState("Alpha Sweeper Sync");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load saved teams from local storage on mount
  useEffect(() => {
    const cached = localStorage.getItem("pokemmo_dex_teams");
    if (cached) {
      try {
        setSavedTeams(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached teams", e);
      }
    } else {
      // Default initial seed
      const initial: SavedTeam[] = [
        {
          id: "1",
          name: "PvP Horde Farmer",
          members: [pokemonDb[1], pokemonDb[2], pokemonDb[4]] // Charizard, Gyarados, Scrafty
        }
      ];
      setSavedTeams(initial);
      localStorage.setItem("pokemmo_dex_teams", JSON.stringify(initial));
    }
  }, []);

  const handleSaveTeam = () => {
    if (activeTeam.length === 0) return;
    const newTeam: SavedTeam = {
      id: Date.now().toString(),
      name: customTeamName || "Unnamed Team",
      members: activeTeam
    };
    const updated = [...savedTeams.filter(t => t.name !== newTeam.name), newTeam];
    setSavedTeams(updated);
    localStorage.setItem("pokemmo_dex_teams", JSON.stringify(updated));
    alert(`Team "${newTeam.name}" committed to durable client index.`);
  };

  const handleApplySavedTeam = (team: SavedTeam) => {
    onTeamUpdate(team.members);
    setCustomTeamName(team.name);
  };

  const handleDeleteTeam = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTeams.filter(t => t.id !== id);
    setSavedTeams(updated);
    localStorage.setItem("pokemmo_dex_teams", JSON.stringify(updated));
  };

  const handleRemoveMember = (index: number) => {
    const updated = [...activeTeam];
    updated.splice(index, 1);
    onTeamUpdate(updated);
  };

  const handleAddMember = (p: PokemonData) => {
    if (activeTeam.length >= 6) {
      alert("PokéMMO matches support a maximum of 6 standard combatant party slots.");
      return;
    }
    onTeamUpdate([...activeTeam, p]);
    setShowAddMenu(false);
  };

  // Dual-Screen Synergy Analysis Equation calculation
  // Computes the combined team defensive coverage multiplier across all 18 types
  const calculateDefenseSynergy = () => {
    const defenseScore: Record<string, number> = {};
    ALL_TYPES.forEach(t => { defenseScore[t] = 1; }); // 1 is base neutral multiplier

    const list: { type: string; totalMultiplier: number; description: string; score: number }[] = [];

    ALL_TYPES.forEach(atkType => {
      let accumulatedMultiplier = 1;
      let weakCount = 0;
      let resistCount = 0;
      let immuneCount = 0;

      activeTeam.forEach(member => {
        let memberMultiplier = 1;
        member.types.forEach(memberType => {
          const chart = TYPE_CHART[atkType];
          if (chart) {
            if (chart.strongAgainst.includes(memberType)) {
              memberMultiplier *= 2;
            }
            if (chart.weakAgainst.includes(memberType)) {
              memberMultiplier *= 0.5;
            }
            if (chart.immunities.includes(memberType)) {
              memberMultiplier *= 0;
            }
          }
        });

        if (memberMultiplier > 1) weakCount++;
        if (memberMultiplier < 1 && memberMultiplier > 0) resistCount++;
        if (memberMultiplier === 0) immuneCount++;
      });

      // Defensive rating computation: High values imply combined vulnerabilities
      const sumPower = (weakCount * 2) - (resistCount * 1) - (immuneCount * 2);
      
      let description = "Balanced";
      if (sumPower >= 3) description = "Critical Weakness!";
      else if (sumPower >= 1) description = "Minor Vulnerability";
      else if (sumPower <= -3) description = "Impenetrable Wall";
      else if (sumPower <= -1) description = "Well Guarded";

      list.push({
        type: atkType,
        totalMultiplier: accumulatedMultiplier,
        description,
        score: sumPower
      });
    });

    return list.sort((a,b) => b.score - a.score); // Vulnerabilities at top
  };

  const synergyReport = calculateDefenseSynergy();
  const highVulnerabilities = synergyReport.filter(r => r.score >= 2);
  const coreWalls = synergyReport.filter(r => r.score <= -2);

  return (
    <div className="space-y-6 text-left">
      <div className="bg-sleek-card p-4 rounded-xl border border-sleek-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-black text-white tracking-wide">Sync Team Synergy Builder</h2>
          <p className="text-xs text-slate-400">Assemble lists, evaluate type weaknesses, and counter live battle opponents.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            id="team-name-input"
            type="text"
            value={customTeamName}
            onChange={(e) => setCustomTeamName(e.target.value)}
            placeholder="Team name..."
            className="flex-1 md:w-44 bg-sleek-panel border border-sleek-border text-white placeholder-slate-500 rounded-lg text-xs py-1.5 px-3 focus:outline-none"
          />
          <button
            id="btn-save-team"
            onClick={handleSaveTeam}
            disabled={activeTeam.length === 0}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 disabled:bg-sleek-border disabled:text-slate-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> Save Team
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TEAM BATTLEPARTY SLOTS (Left - 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Saved load triggers */}
          {savedTeams.length > 0 && (
            <div className="bg-sleek-card/60 p-3 rounded-lg border border-sleek-border flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold uppercase text-slate-500 mr-2">Load Layout:</span>
              {savedTeams.map(t => (
                <div
                  key={t.id}
                  onClick={() => handleApplySavedTeam(t)}
                  className="bg-sleek-panel hover:bg-sleek-card hover:border-slate-700 border border-sleek-border cursor-pointer px-2.5 py-1 rounded text-[11px] text-white flex items-center gap-2 transition"
                >
                  <span className="font-bold">{t.name}</span>
                  <span className="text-[10px] text-rose-400 font-mono">({t.members.length}/6)</span>
                  <button
                    id={`btn-del-team-${t.id}`}
                    onClick={(e) => handleDeleteTeam(t.id, e)}
                    className="hover:text-rose-500 text-slate-500 font-bold ml-1 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Slots Mapping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[...Array(6)].map((_, index) => {
              const member = activeTeam[index];

              if (member) {
                return (
                  <div id={`team-slot-${index}`} key={index} className="bg-sleek-card p-4.5 rounded-xl border border-sleek-border flex justify-between items-start hover:border-rose-900 *:transition text-left group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500">Slot {index+1}</span>
                        {member.catchRate < 45 && <Award className="w-3 h-3 text-yellow-500" />}
                      </div>
                      <h4 className="text-base font-black text-rose-400 leading-tight">{member.name}</h4>
                      <div className="flex gap-1">
                        {member.types.map(t => (
                          <span key={t} className="text-[9px] uppercase font-bold text-slate-300 bg-sleek-panel border border-sleek-border px-1.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="block text-[10px] text-slate-400">Stat Max: HP {member.baseStats.hp} / Atk {member.baseStats.attack}</span>
                    </div>

                    <button
                      id={`btn-remove-slot-${index}`}
                      onClick={() => handleRemoveMember(index)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded border border-sleek-border hover:bg-rose-955/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  id={`empty-slot-${index}`}
                  key={index}
                  onClick={() => setShowAddMenu(true)}
                  className="bg-sleek-card/35 border-2 border-dashed border-sleek-border hover:border-rose-800 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-rose-500/5 transition-all group"
                >
                  <Plus className="w-6 h-6 text-slate-500 group-hover:text-rose-400 transition-colors mb-2" />
                  <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200">Slot {index+1} Empty</span>
                  <span className="text-[10px] text-slate-600 mt-1">Tap/click to slot Pokémon</span>
                </div>
              );
            })}
          </div>

          {/* Inline Selection Dropdown trigger */}
          {showAddMenu && (
            <div className="bg-sleek-card border border-sleek-border rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-white">Add Member to Battle Party</span>
                <button id="btn-close-add" onClick={() => setShowAddMenu(false)} className="text-slate-500 hover:text-white font-bold text-sm">Cancel</button>
              </div>

              <input
                id="team-search-add"
                type="text"
                placeholder="Search database to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-sleek-panel border border-sleek-border text-white placeholder-slate-500 rounded-lg text-xs py-1.5 px-3 focus:outline-none"
              />

              <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                {pokemonDb
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(p => (
                    <div
                      id={`pokedex-add-${p.id}`}
                      key={p.id}
                      onClick={() => handleAddMember(p)}
                      className="bg-sleek-panel hover:bg-sleek-card border border-sleek-border hover:border-slate-700 p-2 rounded-lg flex justify-between items-center text-left cursor-pointer transition text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-rose-400 font-bold">#{p.id}</span>
                        <span className="text-white font-bold">{p.name}</span>
                        <span className="text-[10px] text-slate-405">({p.types.join("/")})</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Add →</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

        </div>

        {/* TEAM DEFENSIVE RESISTANCES & SCAN EVAL (Right - 5 cols) */}
        <div className="lg:col-span-5 space-y-4 text-left">
          
          {/* Opponent Scanning Integration metrics */}
          {scannedOpponent ? (
            <div className="bg-rose-950/20 border border-rose-900/60 rounded-xl p-4.5 space-y-3 shadow-inner">
              <div className="border-b border-rose-900/40 pb-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block mb-0.5">Live Integration Hook</span>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  🛡️ Counters Suggested vs: {scannedOpponent.detectedPokemon} (Lv.{scannedOpponent.detectedLevel})
                </h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluating party coverage vs scanned target. Recommended counter typings: <strong className="text-emerald-400 font-mono text-[11px]">{scannedOpponent.combatStrategy?.recommendedMoveTypes?.join(", ")}</strong>.
              </p>

              {/* Loop to see if active team members can deal with the scanned threat */}
              <div className="space-y-1.5">
                {activeTeam.map((member, index) => {
                  const hasSuperEffectiveMove = member.moves.some(m => 
                    scannedOpponent.matchupAnalysis?.weaknesses?.some((w: string) => w.toLowerCase().includes(m.type.toLowerCase()))
                  );

                  const suffersDefensiveWeakness = member.types.some(t => 
                    scannedOpponent.combatStrategy?.threatMoves?.some((m: string) => m.toLowerCase().includes(t.toLowerCase())) 
                  );

                  return (
                    <div key={index} className="bg-sleek-card/70 p-2.5 rounded border border-sleek-border text-xs flex justify-between items-center">
                      <span className="font-bold text-slate-300">{member.name}</span>
                      <div className="flex gap-2">
                        {hasSuperEffectiveMove && (
                          <span className="bg-emerald-950/70 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-bold font-mono border border-emerald-900/50">
                            OFFENSIVE SWEER
                          </span>
                        )}
                        {suffersDefensiveWeakness && (
                          <span className="bg-amber-950/70 text-amber-400 px-2 py-0.5 rounded text-[9px] font-bold font-mono border border-amber-900/50 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> AT RISK
                          </span>
                        )}
                        {!hasSuperEffectiveMove && !suffersDefensiveWeakness && (
                          <span className="text-slate-500 text-[10px]">Neutral matchup</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="bg-sleek-card p-4 border border-sleek-border rounded-xl text-center text-xs text-slate-500">
              💡 Scan an opponent in the battle emulator simulator to activate auto-counter predictions here.
            </div>
          )}

          {/* Unified weaknesses analysis panel */}
          {activeTeam.length > 0 ? (
            <div className="bg-sleek-card p-5 rounded-xl border border-sleek-border space-y-4 shadow-xl">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Defense Synergy Rating</span>
                <h4 className="text-base font-black text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-500" /> Type Vulnerabilities Analysis
                </h4>
              </div>

              {/* Critical Weakness warning */}
              {highVulnerabilities.length > 0 && (
                <div className="bg-red-950/40 border border-red-900/60 text-red-300 p-3 rounded-lg text-xs flex gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold mb-1">Shared Vulnerability Fault Detected!</span>
                    Multiple party members are vulnerable to <strong className="text-white uppercase font-mono">{highVulnerabilities.map(h => h.type).join(", ")}</strong> types. Slot a resistant or immune switch to stabilize defensive cores.
                  </div>
                </div>
              )}

              {/* Impenetrable Walls list */}
              {coreWalls.length > 0 && (
                <div className="bg-emerald-950/30 text-emerald-300 border border-emerald-950 p-3 rounded-lg text-xs flex gap-2.5">
                  <Award className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-bold mb-1">Team Wall Security Secured</span>
                    Excellent combined defensive resists against <strong className="text-white uppercase font-mono">{coreWalls.map(c => c.type).join(", ")}</strong> attacks. Easy switch opportunities located!
                  </div>
                </div>
              )}

              {/* Visual mini-grid charting type vulnerability values */}
              <div className="space-y-1.5">
                <span className="text-[10px] block font-bold text-slate-500 uppercase tracking-widest">Global Type Multiplier Indexes</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {synergyReport.map(s => {
                    let badgeBg = "bg-sleek-panel border-sleek-border text-slate-300";
                    if (s.score >= 2) badgeBg = "bg-red-950 border-red-900 text-red-400 font-bold";
                    else if (s.score <= -2) badgeBg = "bg-emerald-950 border-emerald-900 text-emerald-400 font-bold";

                    return (
                      <div key={s.type} className={`p-1.5 rounded border text-[10px] text-center flex flex-col justify-between truncate ${badgeBg}`}>
                        <span className="uppercase tracking-wide font-extrabold text-[9px]">{s.type}</span>
                        <span className="font-mono text-xs font-bold mt-0.5">{s.score > 0 ? `+${s.score}` : s.score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-sleek-card p-5 rounded-xl border border-sleek-border text-center text-xs text-slate-500">
              Add Pokémon to your party slots to initiate real-time type weakness tracking and global synergy report maps.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
