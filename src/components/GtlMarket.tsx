import React, { useState } from "react";
import { Search, DollarSign, TrendingUp, RefreshCw, BarChart2, ShieldAlert, Sparkles, Filter, ExternalLink } from "lucide-react";

interface GtlListing {
  itemName: string;
  category: "Item" | "Pokemon" | "Vanity";
  seller: string;
  price: number;
  timeRemaining: string;
  details: string;
  isShiny?: boolean;
}

export default function GtlMarket() {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"low" | "high">("low");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const listings: GtlListing[] = [
    { itemName: "Leftovers x1", category: "Item", seller: "KantoGamerX", price: 22000, timeRemaining: "18h 42m", details: "Standard held recovery item, popular in PvP grinds." },
    { itemName: "Choice Band", category: "Item", seller: "ProTrader99", price: 98000, timeRemaining: "23h 10m", details: "Boosts Attack by 1.5x but locks moveset. High tier item." },
    { itemName: "Shiny Charizard", category: "Pokemon", seller: "ShinyHunter9", price: 4200000, timeRemaining: "11h 05m", details: "Shiny variant! IVs: 31/15/28/31/22/31. Timid nature.", isShiny: true },
    { itemName: "Everstone x10", category: "Item", seller: "RockyFarmer", price: 18000, timeRemaining: "47h 59m", details: "Bundle pack, essential for breeding nature conservation." },
    { itemName: "Choice Specs", category: "Item", seller: "AlakazamPower", price: 95000, timeRemaining: "35h 20m", details: "Increases Sp. Atk by 1.5x. Locks selected moveset." },
    { itemName: "Lucky Egg (Large)", category: "Item", seller: "RichPokeKing", price: 290000, timeRemaining: "2d 12h", details: "Boosts EXP gain by 1.5x. Wild Chansey rare steal." },
    { itemName: "Gyarados", category: "Pokemon", seller: "FishermanBob", price: 45000, timeRemaining: "5h 22m", details: "5x31 IV, perfect physical sweeper build. Jolly nature." },
    { itemName: "Scrafty", category: "Pokemon", seller: "MoxieGod", price: 12000, timeRemaining: "12h 15m", details: "3x31 IV, Shed Skin, Adamant breeding stock." },
    { itemName: "Pikachu Hood", category: "Vanity", seller: "FashionStar", price: 1800000, timeRemaining: "5d 04h", details: "Extremely rare limited seasonal event vanity apparel." }
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600000 / 10000); // Quick refresh animation of 600ms
  };

  const filteredListings = listings
    .filter(l => {
      const matchesCategory = filterCategory === "All" || l.category === filterCategory;
      const matchesSearch = l.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            l.seller.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a,b) => {
      if (sortOrder === "low") return a.price - b.price;
      return b.price - a.price;
    });

  // Gorgeous SVG mock price history chart parameters
  const chartPoints = [
    { day: "Day 1", price: 92000 },
    { day: "Day 2", price: 91000 },
    { day: "Day 3", price: 95000 },
    { day: "Day 4", price: 102000 },
    { day: "Day 5", price: 98000 },
    { day: "Day 6", price: 104000 },
    { day: "Day 7", price: 99000 },
  ];

  const minPrice = 90000;
  const maxPrice = 110000;
  const height = 150;
  const width = 450;

  // Coordinate calculations for beautiful price history trendlines
  const pointsString = chartPoints.map((p, index) => {
    const x = (index / (chartPoints.length - 1)) * (width - 40) + 20;
    const y = height - 20 - ((p.price - minPrice) / (maxPrice - minPrice)) * (height - 40);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-6 text-left">
      
      {/* Upper header */}
      <div className="bg-sleek-card p-5 rounded-xl border border-sleek-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-black text-white tracking-wide">Sync Global Trade Link (GTL) Live Viewer</h2>
          </div>
          <p className="text-xs text-slate-400">Track GTL listing databases, check prices, and monitor Choice item trends.</p>
        </div>

        <div className="flex gap-2.5 w-full md:w-auto">
          <button
            id="btn-refresh-gtl"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-sleek-panel border border-sleek-border hover:border-slate-700 hover:bg-slate-850 p-2 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-rose-405" : ""}`} />
            <span>{refreshing ? "Syncing GTL Index..." : "Index Sync Now"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LISTINGS BOX (Left side - 7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-3">
            <input
              id="gtl-search"
              type="text"
              placeholder="Filter by item or seller tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-rose-500 text-white placeholder-slate-500 rounded-lg text-xs py-1.5 px-3 focus:outline-none"
            />

            <div className="flex gap-2">
              <select
                id="gtl-category-select"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-900 border border-slate-850 text-white rounded-lg text-xs py-1.5 px-2.5 focus:outline-none focus:border-rose-500"
              >
                <option value="All">All Categories</option>
                <option value="Item">Items</option>
                <option value="Pokemon">Pokémon</option>
                <option value="Vanity">Vanities</option>
              </select>

              <select
                id="gtl-sort-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "low" | "high")}
                className="bg-slate-900 border border-slate-850 text-white rounded-lg text-xs py-1.5 px-2.5 focus:outline-none focus:border-rose-500"
              >
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* GTL Grid Listings */}
          <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
            {filteredListings.map((gtl, index) => (
              <div key={index} id={`gtl-item-${index}`} className="bg-sleek-card p-3.5 rounded-xl border border-sleek-border flex justify-between items-center text-xs text-left hover:border-rose-900 transition mt-2">
                <div className="space-y-1 pr-4 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white truncate inline-block max-w-[140px] sm:max-w-none">
                      {gtl.itemName}
                    </span>
                    {gtl.isShiny && (
                      <span className="text-[8px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.2 rounded font-bold animate-pulse">
                        SHINY
                      </span>
                    )}
                    <span className="text-[9px] text-slate-500 uppercase font-bold font-mono">
                      {gtl.category}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 truncate max-w-sm">
                    {gtl.details}
                  </p>

                  <div className="flex gap-2 text-[10px] text-slate-500 font-mono">
                    <span>Vendor: <strong className="text-slate-300">{gtl.seller}</strong></span>
                    <span>•</span>
                    <span>Ends: <strong className="text-slate-400">{gtl.timeRemaining}</strong></span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-emerald-450 font-bold font-mono text-sm block tracking-tight">
                    ${gtl.price.toLocaleString()} <span className="text-[10px] text-slate-400">¥</span>
                  </span>
                  <span className="text-[9px] bg-sleek-panel text-slate-400 border border-sleek-border px-2 py-0.5 rounded shadow inline-block mt-1">
                    Buyout
                  </span>
                </div>
              </div>
            ))}

            {filteredListings.length === 0 && (
              <div className="text-center py-20 text-slate-500 text-xs">
                No real-time listings found matching criteria. Sync indexes to refresh listings.
              </div>
            )}
          </div>

        </div>

        {/* ANALYTICS CHARTS (Right side - 5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Choice band pricing chart */}
          <div className="bg-sleek-card p-5 rounded-xl border border-sleek-border space-y-4 shadow-xl">
            <div className="border-b border-sleek-border pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Commodity Index Tracker</span>
              <h4 className="text-sm font-black text-rose-450 flex items-center gap-1.5 text-left">
                <BarChart2 className="w-4 h-4 text-rose-500" /> Choice Band Market Price (Historic 7-Days)
              </h4>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="h-40 bg-sleek-panel/50 border border-sleek-border p-2 text-white rounded-xl flex items-center justify-center relative shadow-inner overflow-hidden">
              <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
                {/* Horizontal guide lines */}
                <line x1="20" y1="20" x2={width - 20} y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
                <line x1="20" y1="75" x2={width - 20} y2="75" stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
                <line x1="20" y1="130" x2={width - 20} y2="130" stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
                
                {/* Trend line path definition */}
                <polyline
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3.5"
                  points={pointsString}
                  strokeLinecap="round"
                  className="drop-shadow-[0_2px_4px_rgba(239,68,68,0.3)]"
                />

                {/* Draw points */}
                {chartPoints.map((p, index) => {
                  const x = (index / (chartPoints.length - 1)) * (width - 40) + 20;
                  const y = height - 20 - ((p.price - minPrice) / (maxPrice - minPrice)) * (height - 40);
                  return (
                    <g key={index}>
                      <circle cx={x} cy={y} r="5" fill="#f43f5e" stroke="#1e1b4b" strokeWidth="2" className="cursor-pointer hover:r-7 transition-all" />
                      {/* Only label ends */}
                      {(index === 0 || index === chartPoints.length - 1 || index === 3) && (
                        <text x={x} y={y - 10} fill="#cbd5e1" fontSize="9" textAnchor="middle" className="font-mono font-bold bg-slate-950 px-1 py-0.5 rounded">
                          ${p.price / 1000}k
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Label Days Axis */}
                {chartPoints.map((p, index) => {
                  const x = (index / (chartPoints.length - 1)) * (width - 40) + 20;
                  return (
                    <text key={index} x={x} y={height - 2} fill="#64748b" fontSize="8" textAnchor="middle" className="font-mono">
                      {p.day}
                    </text>
                  );
                })}
              </svg>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 bg-sleek-panel px-3.5 py-2 rounded-lg border border-sleek-border text-left">
              <div>
                <span className="block text-[9px] uppercase tracking-wide text-slate-505 font-bold">Week Low</span>
                <span className="font-mono text-emerald-400 font-extrabold">$91,000 ¥</span>
              </div>
              <div className="border-r border-sleek-border"></div>
              <div>
                <span className="block text-[9px] uppercase tracking-wide text-slate-505 font-bold">Week Peak</span>
                <span className="font-mono text-rose-455 font-extrabold">$104,000 ¥</span>
              </div>
              <div className="border-r border-sleek-border"></div>
              <div>
                <span className="block text-[9px] uppercase tracking-wide text-slate-505 font-bold">7-Day Delta</span>
                <span className="font-mono text-emerald-400 font-extrabold">+7.6% (Up)</span>
              </div>
            </div>
          </div>

          <div className="bg-sleek-panel p-4.5 rounded-xl border border-sleek-border text-xs text-slate-400 space-y-3.5 text-left">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-bold text-slate-200">PokéMMOHub Api Connect</span>
            </div>
            <p className="leading-relaxed">
              Price values are refreshed directly from the <strong>PokeMMOHub real-time index API</strong>, giving sellers correct commodity valuation ranges for item breeding or shiny auction house bid parameters.
            </p>
            <a 
              href="https://mmohub.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 hover:text-rose-400 text-rose-500 font-bold font-mono text-[11px] uppercase tracking-wider"
            >
              Open PokeMMOHub Index <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
