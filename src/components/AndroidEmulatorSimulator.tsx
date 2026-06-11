import React, { useState, useRef, useEffect } from "react";
import { 
  Tv, 
  Crop, 
  HelpCircle, 
  AlertTriangle, 
  Gauge, 
  Layers, 
  Upload, 
  Sparkles, 
  ScanLine, 
  Zap, 
  ShieldAlert, 
  Sword, 
  Volume2, 
  VolumeX,
  Target,
  Lock,
  Unlock,
  Check,
  Plus,
  RotateCcw,
  Edit2,
  Minus
} from "lucide-react";
import { PokemonData, pokemonDb } from "../data/pokemonDb";

interface EmulatorSimulatorProps {
  onPokemonDetected: (dexData: any) => void;
  selectedTeam: any[];
  caughtIds: number[];
  onToggleCaught: (id: number) => void;
  scannedOpponent?: any;
}

export default function AndroidEmulatorSimulator({ onPokemonDetected, selectedTeam, caughtIds, onToggleCaught, scannedOpponent }: EmulatorSimulatorProps) {
  const [screenSplit, setScreenSplit] = useState<"vertical" | "horizontal" | "overlay">("vertical");
  const [ocrRegion, setOcrRegion] = useState<"top" | "bottom" | "custom">("top");
  const [activePreload, setActivePreload] = useState<string>("pikachu");
  const [scanning, setScanning] = useState<boolean>(false);
  const [diagnosticLog, setDiagnosticLog] = useState<string[]>(["[Dex-Bridge] AccessibilityDaemon active."]);
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [customOcrBox, setCustomOcrBox] = useState({ x: 20, y: 15, width: 40, height: 18 });
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(false);
  const [geminiActive, setGeminiActive] = useState<boolean>(false);

  const getActivePokemonId = () => {
    const name = activePreload !== "custom" 
      ? preloads[activePreload]?.name 
      : (ocrResult?.detectedPokemon || scannedOpponent?.detectedPokemon || "");
    if (!name) return null;
    const match = pokemonDb.find(p => p.name.toLowerCase() === name.toLowerCase());
    return match ? match.id : null;
  };

  const getActiveOpponentInfo = () => {
    if (activePreload !== "custom" && preloads[activePreload]) {
      const preloadInfo = preloads[activePreload];
      return {
        name: preloadInfo.name,
        level: preloadInfo.level,
        image: preloadInfo.image,
        type: preloadInfo.type
      };
    }
    const detectedName = ocrResult?.detectedPokemon || scannedOpponent?.detectedPokemon || "Gardevoir";
    const detectedLvl = ocrResult?.detectedLevel || scannedOpponent?.detectedLevel || 45;
    const match = pokemonDb.find(p => p.name.toLowerCase() === detectedName.toLowerCase());
    return {
      name: detectedName,
      level: detectedLvl,
      image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&auto=format&fit=crop&q=60", // Futuristic digital stadium arena
      type: match?.types?.join("/") || "Normal"
    };
  };

  // New Movable & Lockable OCR features
  const [isOcrLocked, setIsOcrLocked] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, boxX: 0, boxY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScanTimeRef = useRef<number>(0);
  const lastScannedNameRef = useRef<string>("");

  // Shiny Encounter Tracker State
  const [shinyEncounterCount, setShinyEncounterCount] = useState<number>(() => {
    const saved = localStorage.getItem("shiny_encounter_count");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isEditingCount, setIsEditingCount] = useState<boolean>(false);
  const [tempCountVal, setTempCountVal] = useState<string>("");

  // Scalable layout width and height defaulting to optimization for AYN Thor screen space
  const [emulatorHeight, setEmulatorHeight] = useState<number>(580); // Taller vertical layout for dual AYN Thor screens (top PokéMMO, bottom App)
  const [emulatorWidth, setEmulatorWidth] = useState<number>(100); // % width scale

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isOcrLocked) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      boxX: customOcrBox.x,
      boxY: customOcrBox.y
    });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const deltaX = ((e.clientX - dragStart.x) / rect.width) * 100;
      const deltaY = ((e.clientY - dragStart.y) / rect.height) * 100;

      const newX = Math.max(0, Math.min(100 - customOcrBox.width, dragStart.boxX + deltaX));
      const newY = Math.max(0, Math.min(100 - customOcrBox.height, dragStart.boxY + deltaY));

      setCustomOcrBox(prev => ({
        ...prev,
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
      addLog(`[OCR Calibration] Moved crop box to X: ${customOcrBox.x}% | Y: ${customOcrBox.y}%`);
    }
  };


  // Check backend server setup on load
  useEffect(() => {
    fetch("/api/health")
      .then(r => r.json())
      .then(data => {
        setGeminiActive(data.geminiConfigured);
        if (data.geminiConfigured) {
          addLog("[Dex-Bridge] Gemini v3.5-flash online. OCR scans are fully powered by cloud AI.");
        } else {
          addLog("[Dex-Bridge] Local fallback OCR mode active. Preloaded frames and smart database matching available.");
        }
      })
      .catch(() => {
        addLog("[Dex-Bridge] Server offline or unreachable. Simulator in off-grid sandbox mode.");
      });
  }, []);

  const addLog = (msg: string) => {
    setDiagnosticLog(prev => [...prev.slice(-14), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const preloads: Record<string, { name: string; level: number; image: string; type: string; bg: string }> = {
    pikachu: {
      name: "Pikachu",
      level: 18,
      type: "Electric",
      bg: "bg-amber-500/10 border-amber-500/30",
      image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=60" // Pikachu dynamic gaming representation
    },
    charizard: {
      name: "Charizard",
      level: 55,
      type: "Fire/Flying",
      bg: "bg-rose-500/10 border-rose-500/30",
      image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=60" // Stylized dragon red artwork
    },
    gyarados: {
      name: "Gyarados",
      level: 32,
      type: "Water/Flying",
      bg: "bg-blue-500/10 border-blue-500/30",
      image: "https://images.unsplash.com/photo-1541562232579-512a21360020?w=400&auto=format&fit=crop&q=60" // Stylized sea serpent
    },
    moxie_scrafty: {
      name: "Scrafty",
      level: 42,
      type: "Dark/Fighting",
      bg: "bg-emerald-500/10 border-emerald-500/30",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&auto=format&fit=crop&q=60" // Streetwise anime fighter layout
    }
  };



  const speakEntry = (text: string) => {
    if (!ttsEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis failure", e);
    }
  };

  const handleScan = async (isForced: boolean = false) => {
    const targetName = scannedOpponent?.detectedPokemon || (activePreload !== "custom" ? preloads[activePreload]?.name : "Pikachu");

    if (!targetName) return;

    const now = Date.now();
    const isSamePokemon = lastScannedNameRef.current && lastScannedNameRef.current.toLowerCase() === targetName.toLowerCase();

    // Check same-Pokemon and rate-limiting conditions for background auto-updates
    if (!isForced) {
      if (isSamePokemon) {
        // Prevent console flood, but log it elegantly once
        addLog(`[Dex-Bridge] Specimen already loaded: "${targetName}". Suppressing auto-scan to save CPU and cloud bandwidth.`);
        return;
      }

      const timeSinceLastScan = now - lastScanTimeRef.current;
      if (timeSinceLastScan < 20000 && lastScanTimeRef.current !== 0) {
        const remaining = Math.ceil((20000 - timeSinceLastScan) / 1000);
        addLog(`[Dex-Bridge] Scan throttled. Please wait ${remaining}s before auto-scanning a new target.`);
        return;
      }
    }

    setScanning(true);
    setOcrResult(null);
    addLog(`[OCR] Initiating text analysis in crop window [X:${customOcrBox.x} Y:${customOcrBox.y} W:${customOcrBox.width} H:${customOcrBox.height}]`);

    try {
      const isSimulation = true;
      const payload = {
        image: null,
        isSimulation,
        simulatedName: targetName,
        coords: customOcrBox,
        selectedTeam: selectedTeam.map(t => t.name)
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const res = await response.json();
      if (res.success && res.data) {
        setOcrResult(res.data);
        onPokemonDetected(res.data);
        
        lastScannedNameRef.current = res.data.detectedPokemon || targetName;
        lastScanTimeRef.current = Date.now();

        // Shiny Encounter Tracker Integration
        if (res.data.isShiny) {
          setShinyEncounterCount(0);
          localStorage.setItem("shiny_encounter_count", "0");
          addLog(`[Shiny Tracker] ✨ SHINY SPECIMEN IDENTIFIED! Encounter count reset to 0! ✨`);
        } else {
          setShinyEncounterCount(prev => {
            const next = prev + 1;
            localStorage.setItem("shiny_encounter_count", String(next));
            addLog(`[Shiny Tracker] Registered wild encounter. count is now: ${next}`);
            return next;
          });
        }

        const shinyTag = res.data.isShiny ? "A SHINY wild " : "A wild ";
        const detectedName = res.data.detectedPokemon;
        const level = res.data.detectedLevel;
        const mainTypes = res.data.matchupAnalysis?.types?.join(" and ") || "unknown";
        
        addLog(`[OCR] Successful Match! Detected: ${detectedName} (Lv. ${level}) | Shiny: ${res.data.isShiny ? "YES" : "NO"}`);
        addLog(`[Tactical] Recommended types of moves: ${res.data.combatStrategy?.recommendedMoveTypes?.join(", ") || "None"}`);

        // Handle TTS announcement options
        const vocalString = `${shinyTag} level ${level} ${detectedName} has been identified. Its typing is ${mainTypes}. ${res.data.combatStrategy?.advice || ""}`;
        speakEntry(vocalString);
      } else {
        throw new Error(res.error || "OCR failed to match signatures");
      }
    } catch (err: any) {
      addLog(`[OCR Error] ${err.message || "Failed to parse screenshot headers"}`);
    } finally {
      setScanning(false);
    }
  };

  // Sync external Pokedex inspections smoothly to update active cockpit scenario background
  useEffect(() => {
    if (scannedOpponent) {
      const matchedKey = Object.keys(preloads).find(
        key => preloads[key].name.toLowerCase() === scannedOpponent.detectedPokemon?.toLowerCase()
      );
      if (matchedKey) {
        setActivePreload(matchedKey);
      } else {
        setActivePreload("custom");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedOpponent]);

  // Unified auto-scanner trigger: auto-scans automatically on layout load, preload changes, or when scannedOpponent changes
  useEffect(() => {
    handleScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePreload, scannedOpponent]);

  // Re-scan automatically when coordinate crop box calibration drag ends
  useEffect(() => {
    if (!isDragging && ocrResult) {
      handleScan(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Device Emulation Visual Mock (Left Side: 7 col) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="bg-sleek-card rounded-xl border border-sleek-border p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Tv className="w-5 h-5 text-rose-500" />
              <h3 className="text-sm font-semibold text-white tracking-wide">AYN Thor Dual-Screen Console Mode</h3>
            </div>
            
            <div className="text-[10px] bg-emerald-950/60 text-emerald-400 font-mono px-2 py-1 rounded border border-emerald-900/50">
              🎮 STACKED SCREEN LAYOUT
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed mb-4 text-left">
            AYN Thor Active Hardware Configuration: PokéMMO is running on the top hardware screen with your live OCR companion App on the bottom.
          </p>

          {/* Interactive Responsive Dual-Screen Frame */}
          <div 
            className="flex flex-col bg-sleek-panel border-4 border-sleek-border rounded-xl overflow-hidden shadow-2xl transition-all duration-300"
            style={{ 
              height: `${emulatorHeight}px`,
              width: `${emulatorWidth}%`,
              margin: '0 auto'
            }}
          >
            
            {/* GAME SCREEN (TOP) - PokéMMO Game Layer */}
            <div 
              ref={containerRef}
              className="relative bg-black h-1/2 border-b-4 border-sleek-border overflow-hidden flex flex-col items-center justify-center transition-all"
            >
              
              {/* Scan region crop visual container (Accessibility Box) - Draggable and Annotates Active Name */}
              <div 
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className={`absolute border-2 border-dashed ${isOcrLocked ? "border-emerald-500 bg-emerald-500/5 cursor-not-allowed" : "border-red-500 bg-red-500/10 cursor-move"} z-20 rounded select-none`}
                style={{
                  top: `${customOcrBox.y}%`,
                  left: `${customOcrBox.x}%`,
                  width: `${customOcrBox.width}%`,
                  height: `${customOcrBox.height}%`,
                  touchAction: "none"
                }}
              >
                <div className={`absolute -top-7.5 left-0 ${isOcrLocked ? "bg-emerald-600" : "bg-red-600"} text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1 shadow-md whitespace-nowrap`}>
                  {isOcrLocked ? (
                    <>
                      <Lock className="w-2.5 h-2.5 text-emerald-300" />
                      <span className="text-emerald-300 font-extrabold">COORD LOCKED</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-2.5 h-2.5 text-red-100" />
                      <span className="text-red-100 italic">DRAG ME</span>
                    </>
                  )}
                  <span className="text-white">| 🔍 {ocrResult?.detectedPokemon || (activePreload !== "custom" ? preloads[activePreload].name : "Custom Frame")}</span>
                </div>
              </div>

              {/* Scanning visual sweep lines */}
              {scanning && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-rose-500/20 to-transparent w-full z-10 scanline-anim">
                  <div className="w-full h-0.5 bg-rose-500 border-b border-rose-400"></div>
                </div>
              )}

              {/* Game View Content */}
              {(() => {
                const opponentInfo = getActiveOpponentInfo();
                return (
                  <div 
                    className="w-full h-full bg-cover bg-center flex flex-col justify-between p-3 relative" 
                    style={{ backgroundImage: `url(${opponentInfo.image})` }}
                  >
                    {/* Healthbar Hud Render */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10 w-52 select-none">
                      <div className="bg-slate-950/95 border border-slate-800 p-2 rounded-lg text-left text-white shadow-xl backdrop-blur-md flex flex-col gap-1.5">
                        <div>
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-extrabold text-[11px] flex items-center gap-1.5 text-white">
                              {opponentInfo.name}
                              {(opponentInfo.name.toLowerCase() === "charizard" || opponentInfo.name.toLowerCase() === "volcarona") && <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />}
                            </span>
                            <span className="text-[9px] text-rose-400 font-bold font-mono">Lv.{opponentInfo.level}</span>
                          </div>
                          {/* HP bar container */}
                          <div className="w-full bg-slate-800 h-1.5 rounded overflow-hidden">
                            <div className={`h-full ${opponentInfo.name.toLowerCase() === "charizard" ? "bg-red-500 w-[15%]" : "bg-emerald-500 w-[65%]"}`}></div>
                          </div>
                          <div className="flex justify-between text-[7.5px] font-mono text-slate-400 mt-0.5">
                            <span>HP Status</span>
                            <span className="font-bold">{opponentInfo.name.toLowerCase() === "charizard" ? "Critical (15%)" : "Healthy (65%)"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Opponent Portrait Below the Health Bar */}
                      {(() => {
                        const activeId = getActivePokemonId();
                        if (!activeId) return null;
                        const isShiny = ocrResult?.isShiny;
                        return (
                          <div className="bg-slate-950/90 border border-slate-800/80 p-2 rounded-lg flex flex-col items-center justify-center gap-1 shadow-2xl backdrop-blur-sm relative overflow-hidden group">
                            {isShiny && (
                              <div className="absolute top-1 right-1 z-20">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              </div>
                            )}
                            <div className="w-20 h-20 flex items-center justify-center relative bg-slate-900/40 rounded-md border border-slate-800/30 p-1 overflow-hidden">
                              <img 
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${activeId}.png`} 
                                alt={opponentInfo.name} 
                                className={`w-18 h-18 object-contain relative z-10 transition-transform duration-300 group-hover:scale-105 ${isShiny ? "drop-shadow-[0_0_8px_rgba(245,158,11,0.95)] animate-bounce" : "drop-shadow-[0_2px_4px_rgba(244,63,94,0.4)]"}`}
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex items-center justify-between w-full text-[7.5px] font-mono text-slate-400 mt-1 border-t border-slate-800/50 pt-1 px-1">
                              <span>Specimen ID</span>
                              <span className="font-bold text-slate-300">#{activeId}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Battle Screen Label */}
                    <div className="absolute bottom-3 right-3 bg-slate-950/85 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider text-slate-400 border border-slate-800 font-mono">
                      PokéMMO Battle - Horde Environs
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* COMPANION SCREEN (BOTTOM) */}
            <div className="bg-sleek-card h-1/2 flex flex-col p-4 relative overflow-y-auto border-t border-sleek-border">
              <div className="flex items-center justify-between border-b border-sleek-border pb-2 mb-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-rose-500" /> Dex Accessibility Overlay
                </span>
                <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live Link Sync
                </span>
              </div>

              {/* Mini Interactive Stats panel simulating screen 2 output */}
              <div className="flex-1 flex flex-col justify-center text-left">
                {ocrResult ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-base font-extrabold text-white flex items-center gap-1.5">
                        {ocrResult.detectedPokemon}
                        {ocrResult.isShiny && <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono border border-amber-500/30 animate-pulse">SHINY</span>}
                      </h4>
                      <span className="text-xs text-rose-400 font-mono font-bold">Lvl {ocrResult.detectedLevel}</span>
                    </div>
                    {/* Types row */}
                    <div className="flex gap-1.5 mb-2">
                      {ocrResult.matchupAnalysis?.types?.map((t: string) => (
                        <span key={t} className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Integrated Caught Status button (synchronized with live Pokédex) */}
                    {(() => {
                      const detectedName = ocrResult.detectedPokemon;
                      const matchItem = pokemonDb.find(p => p.name.toLowerCase() === detectedName.toLowerCase());
                      const matchedId = matchItem ? matchItem.id : 25;
                      const isCurrentlyCaught = caughtIds.includes(matchedId);
                      return (
                        <div className="flex items-center justify-between p-2 rounded bg-sleek-panel border border-sleek-border my-2.5 text-xs">
                          <span className="text-slate-400 font-semibold flex items-center gap-1">
                            🏆 Dex Caught Status:
                          </span>
                          <button
                            id="btn-toggle-caught-ocr"
                            onClick={() => {
                              onToggleCaught(matchedId);
                              addLog(`[Dex Sync] Wild ${detectedName} is now marked ${!isCurrentlyCaught ? "CAUGHT" : "UNCAUGHT"} in dynamic index.`);
                            }}
                            className={`px-3 py-1 rounded text-[10px] font-black tracking-wide flex items-center gap-1 transition-all ${
                              isCurrentlyCaught 
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-950/60 shadow shadow-emerald-950/20" 
                                : "bg-rose-950/40 text-rose-400 border border-rose-800/40 hover:bg-rose-900/30 animate-pulse"
                            }`}
                          >
                            {isCurrentlyCaught ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" /> Registered Caught
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 text-rose-400" /> Mark Caught (Sync Dex)
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })()}

                    {/* Short metrics mapping */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-sleek-panel/50 p-2 rounded border border-sleek-border">
                      <div>
                        <span className="text-slate-400 block font-semibold">Vulnerable x2 / x4</span>
                        <span className="text-rose-400 font-bold truncate block">{ocrResult.matchupAnalysis?.weaknesses?.join(", ") || "None"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Recommended Sweeper</span>
                        <span className="text-emerald-400 font-bold truncate block flex items-center gap-1">
                          <Sword className="w-3 h-3" /> {ocrResult.combatStrategy?.recommendedMoveTypes?.[0] || "Neutral"} Type
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 space-y-1">
                    <ScanLine className="w-6 h-6 mx-auto mb-1 text-slate-600 animate-pulse" />
                    <p className="text-[11px] text-slate-400">Scan Screen to Extract Active Pokédex Information</p>
                    <p className="text-[9px] text-slate-500">Calculates weaknesses, escape rates, items, and team counters instantly.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* OCR SCAN DIAGNOSTICS & STATS PANEL (Right Side: 5 col) */}
      <div className="lg:col-span-5 flex flex-col gap-4 text-left">
        {/* BIG SCAN BUTTON */}
        <button
          id="btn-capture-scan"
          disabled={scanning}
          onClick={() => handleScan(true)}
          className={`w-full py-4 px-6 rounded-xl font-extrabold text-sm tracking-widest flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-[1.01] ${
            scanning
              ? "bg-rose-900/40 text-rose-400 border border-rose-800/50 cursor-not-allowed"
              : "bg-rose-600 border border-rose-500 hover:bg-rose-500 text-white shadow-lg shadow-rose-955/20 hover:shadow-rose-955/35 cursor-pointer"
          }`}
        >
          <ScanLine className={`w-5 h-5 ${scanning ? "animate-spin" : "animate-pulse"}`} />
          <span>{scanning ? "OCR WORKER BUSY..." : "RUN INTUITIVE SCREEN SCAN"}</span>
        </button>

        {/* SHINY ENCOUNTER TRACKER COMPANION */}
        <div className="bg-sleek-card border border-sleek-border rounded-xl p-4 shadow space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Shiny Encounter Tracker</span>
            </span>
            <span className="text-[8px] bg-slate-900 font-mono text-slate-500 px-1.5 py-0.5 rounded border border-slate-800 font-bold tracking-wider uppercase">
              Horde Streak
            </span>
          </div>

          <div className="bg-slate-950/80 px-4 py-3 rounded-lg border border-slate-900 flex items-center justify-between min-h-[64px]">
            {isEditingCount ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = parseInt(tempCountVal, 10);
                  if (!isNaN(val) && val >= 0) {
                    setShinyEncounterCount(val);
                    localStorage.setItem("shiny_encounter_count", String(val));
                    addLog(`[Shiny Tracker] Manually changed encounter count to ${val}.`);
                  }
                  setIsEditingCount(false);
                }}
                className="flex items-center gap-2 w-full text-xs"
              >
                <input
                  type="number"
                  min="0"
                  value={tempCountVal}
                  onChange={(e) => setTempCountVal(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white px-2 py-1 rounded font-mono text-base w-24 shrink-0 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold py-1 px-2.5 rounded text-[10px] shrink-0 cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingCount(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-1 px-2.5 rounded text-[10px] shrink-0 cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Scanned / Hunted Horde Outlets</span>
                  <h4 className="text-3xl font-black font-mono text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)] tracking-wider">
                    {shinyEncounterCount}
                  </h4>
                </div>
                
                <div className="flex gap-1">
                  <button
                    id="btn-edit-shiny-count"
                    onClick={() => {
                      setTempCountVal(String(shinyEncounterCount));
                      setIsEditingCount(true);
                    }}
                    className="p-1 px-2 rounded bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-[9px] font-bold flex items-center gap-1 hover:border-slate-700 cursor-pointer"
                    title="Set custom count"
                  >
                    <Edit2 className="w-2.5 h-2.5" /> Set
                  </button>
                  <button
                    id="btn-reset-shiny-count"
                    onClick={() => {
                      if (window.confirm("Reset your active shiny hunt encounter counter to 0?")) {
                        setShinyEncounterCount(0);
                        localStorage.setItem("shiny_encounter_count", "0");
                        addLog(`[Shiny Tracker] Hunt encounter count was manually reset to 0.`);
                      }
                    }}
                    className="p-1 px-2 rounded bg-rose-950/20 text-rose-400 hover:text-white border border-rose-900/20 hover:border-rose-800 text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Reset tracker"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Reset
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              id="btn-decrement-count"
              disabled={shinyEncounterCount === 0}
              onClick={() => {
                const next = Math.max(0, shinyEncounterCount - 1);
                setShinyEncounterCount(next);
                localStorage.setItem("shiny_encounter_count", String(next));
                addLog(`[Shiny Tracker] Manually decremented count to ${next}.`);
              }}
              className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Decrease (-1)</span>
            </button>
            
            <button
              id="btn-increment-count"
              onClick={() => {
                const next = shinyEncounterCount + 1;
                setShinyEncounterCount(next);
                localStorage.setItem("shiny_encounter_count", String(next));
                addLog(`[Shiny Tracker] Manually incremented count to ${next}.`);
              }}
              className="flex-1 py-1.5 bg-amber-950/30 hover:bg-amber-950/50 border border-amber-900/30 hover:border-amber-900/50 rounded text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Encounter (+1)</span>
            </button>
          </div>
          
          <p className="text-[9px] text-slate-500 italic text-left leading-snug">
            Increases automatically on every successful wild scanner match. Resets to 0 immediately when a shiny pokemon is detected.
          </p>
        </div>

        {/* TTS Toggle panel */}
        <div className="bg-sleek-card p-4 rounded-xl border border-sleek-border flex items-center justify-between shadow">
          <div className="flex gap-3 items-center">
            {ttsEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500 flex-shrink-0" />
            )}
            <div>
              <span className="block text-xs font-bold text-slate-200">Rotom Vocal Assistant (TTS)</span>
              <span className="block text-[10px] text-slate-400">Vocalize entry details upon capture of wild targets.</span>
            </div>
          </div>
          <button
            id="btn-toggle-tts"
            onClick={() => {
              const nextState = !ttsEnabled;
              setTtsEnabled(nextState);
              if (nextState) {
                speakEntry("Rotom vocal assistant enabled. Live translation scanner standing by.");
              }
            }}
            className={`w-12 h-6 px-1 rounded-full flex items-center transition-colors cursor-pointer ${ttsEnabled ? "bg-emerald-500 justify-end" : "bg-sleek-border justify-start"}`}
          >
            <span className="w-4.5 h-4.5 bg-white rounded-full inline-block shadow-inner"></span>
          </button>
        </div>

        {/* Tactical scanning output */}
        {ocrResult ? (
          <div className="bg-sleek-card rounded-xl border border-sleek-border p-5 space-y-4 shadow-xl">
            <div className="border-b border-sleek-border pb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Combat Strategy Guide</span>
              <h4 className="text-lg font-black text-rose-400 flex items-center gap-2">
                <Sword className="w-4 h-4 text-rose-500" /> Counter Metrics vs {ocrResult.detectedPokemon}
              </h4>
            </div>

            <div className="space-y-3">
              {/* Weaknesses mapping */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-sleek-panel border border-sleek-border/60 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-semibold mb-1">Vulnerable To</span>
                  <div className="flex flex-wrap gap-1 leading-tight">
                    {ocrResult.matchupAnalysis?.weaknesses?.map((w: string) => (
                      <span key={w} className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-400 font-extrabold border border-rose-900/50">
                        {w}
                      </span>
                    )) || "N/A"}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800/60 p-2.5 rounded-lg">
                  <span className="text-[10px] text-slate-400 block font-semibold mb-1">Resistant To</span>
                  <div className="flex flex-wrap gap-1 leading-tight">
                    {ocrResult.matchupAnalysis?.resistances?.map((r: string) => (
                      <span key={r} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-400 font-extrabold border border-blue-900/50">
                        {r}
                      </span>
                    )) || "N/A"}
                  </div>
                </div>
              </div>

              {/* Threat moves warnings */}
              <div className="bg-sleek-panel border border-sleek-border/80 p-3 rounded-lg text-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                  <span>Anticipated Action Threats (Lv.{ocrResult.detectedLevel})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ocrResult.combatStrategy?.threatMoves?.map((m: string) => (
                    <span key={m} className="bg-sleek-card px-2 py-0.5 rounded border border-sleek-border font-mono text-[10px] text-slate-300">
                      {m}
                    </span>
                  )) || <span className="text-slate-500 font-mono">None detected</span>}
                </div>
              </div>

              {/* Lure & Held item analysis */}
              <div className="bg-sleek-panel border border-sleek-border p-3 rounded-lg text-xs space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-semibold">Catch Catch-Rate Profile:</span>
                  <span className="font-mono text-white font-bold">{ocrResult.captureRecommendation?.catchRate}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 font-semibold">Ball Efficiency Recommendation:</span>
                  <span className="text-amber-300 font-bold">{ocrResult.captureRecommendation?.optBall}</span>
                </div>
                {ocrResult.captureRecommendation?.heldItemProbability !== "None" && (
                  <div className="bg-emerald-950/40 text-emerald-300 p-2 rounded border border-emerald-900/80 text-[10px] leading-relaxed">
                    🌟 <strong>Held Item Alert:</strong> Wild specimens carry <strong>{ocrResult.captureRecommendation?.heldItemProbability}</strong>. Run Thief/Covet strategies immediately.
                  </div>
                )}
                <div className="text-[11px] text-slate-400 italic pt-1 border-t border-sleek-border leading-relaxed text-left">
                  📢 <strong>Rotom Advice:</strong> {ocrResult.combatStrategy?.advice}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Real-time event log terminal tracker */}
        <div className="bg-sleek-card rounded-xl border border-sleek-border p-4 flex-1 flex flex-col justify-between shadow shadow-inner">
          <div className="flex items-center justify-between border-b border-sleek-border pb-2 mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Tactical Log Bridge</span>
            {geminiActive ? (
              <span className="text-[9px] bg-sky-950 text-sky-400 px-2 py-0.5 rounded border border-sky-800/80 font-mono">Gemini AI Engine Live</span>
            ) : (
              <span className="text-[9px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800 font-mono">Local Dex Database</span>
            )}
          </div>
          <div className="font-mono text-[10px] space-y-1 overflow-y-auto max-h-[140px] flex-1 text-slate-300 leading-relaxed">
            {diagnosticLog.map((log, index) => (
              <div key={index} className="truncate select-text">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
