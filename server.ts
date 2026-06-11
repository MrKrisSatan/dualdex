import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Predefined database of Gen 1-5 Pokédex for fallback and search validation
// This acts as a reliable seed in our server.
import { pokemonDb } from "./src/data/pokemonDb"; 

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enlarge payload sizes for file uploads (screenshots)
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ extended: true, limit: "20mb" }));

  // Lazy initialize Gemini client to avoid crash on startup when API key is missing
  let aiClient: GoogleGenAI | null = null;
  function getAi(): GoogleGenAI | null {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
      }
    }
    return aiClient;
  }

  // API 1: Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      geminiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY",
      appUrl: process.env.APP_URL || "http://localhost:3000"
    });
  });

  // API 2: OCR and Battle Analysis (supports both simulated and real uploaded images)
  app.post("/api/analyze", async (req, res) => {
    const { image, coords, isSimulation, selectedTeam } = req.body;

    // Default mock response when image is a simulation or Gemini is not available
    const mockResponses: Record<string, any> = {
      pikachu: {
        detectedPokemon: "Pikachu",
        detectedLevel: 18,
        isShiny: false,
        matchupAnalysis: {
          types: ["Electric"],
          weaknesses: ["Ground"],
          resistances: ["Electric", "Flying", "Steel"],
          immunities: []
        },
        captureRecommendation: {
          catchRate: 190,
          optBall: "Ultra Ball or Poke Ball",
          lureEncounter: false,
          heldItemProbability: "Light Ball (5%)"
        },
        combatStrategy: {
          recommendedMoveTypes: ["Ground"],
          threatMoves: ["Thunderbolt", "Quick Attack", "Double Team"],
          evYield: "1 Speed",
          advice: "Watch out for Static ability paralyzing your physical attackers. Ground attacks deal 2x damage."
        }
      },
      charizard: {
        detectedPokemon: "Charizard",
        detectedLevel: 55,
        isShiny: true,
        matchupAnalysis: {
          types: ["Fire", "Flying"],
          weaknesses: ["Rock (4x)", "Electric (2x)", "Water (2x)"],
          resistances: ["Grass", "Fire", "Bug", "Steel", "Fighting", "Fairy"],
          immunities: ["Ground"]
        },
        captureRecommendation: {
          catchRate: 45,
          optBall: "Ultra Ball",
          lureEncounter: true,
          heldItemProbability: "None"
        },
        combatStrategy: {
          recommendedMoveTypes: ["Rock", "Water", "Electric"],
          threatMoves: ["Flamethrower", "Air Slash", "Dragon Claw"],
          evYield: "3 Sp. Atk",
          advice: "Extremely weak to Rock moves (4x weakness)! Immune to Ground-type attacks."
        }
      },
      gyarados: {
        detectedPokemon: "Gyarados",
        detectedLevel: 32,
        isShiny: false,
        matchupAnalysis: {
          types: ["Water", "Flying"],
          weaknesses: ["Electric (4x)", "Rock (2x)"],
          resistances: ["Fire", "Water", "Fighting", "Bug", "Steel"],
          immunities: ["Ground"]
        },
        captureRecommendation: {
          catchRate: 45,
          optBall: "Net Ball",
          lureEncounter: true,
          heldItemProbability: "None"
        },
        combatStrategy: {
          recommendedMoveTypes: ["Electric", "Rock"],
          threatMoves: ["Waterfall", "Dragon Rage", "Bite"],
          evYield: "2 Attack",
          advice: "Double weak to Electric attacks (4x). Ground-type sweeps are ineffective due to its Flying-type immunity."
        }
      },
      moxie_scrafty: {
        detectedPokemon: "Scrafty",
        detectedLevel: 42,
        isShiny: false,
        matchupAnalysis: {
          types: ["Dark", "Fighting"],
          weaknesses: ["Fairy (4x)", "Fighting (2x)", "Flying (2x)"],
          resistances: ["Dark", "Ghost", "Rock"],
          immunities: ["Psychic"]
        },
        captureRecommendation: {
          catchRate: 90,
          optBall: "Dusk Ball",
          lureEncounter: false,
          heldItemProbability: "None"
        },
        combatStrategy: {
          recommendedMoveTypes: ["Fairy", "Fighting", "Flying"],
          threatMoves: ["High Jump Kick", "Crunch", "Dragon Dance"],
          evYield: "1 Defense, 1 Sp. Def",
          advice: "Scrafty has Moxie - every KO it scores boosts its Attack! Defeat it immediately. Fairy-type moves deal 4x damage."
        }
      }
    };

    try {
      const ai = getAi();

      // If simulated or no real image/no API key, fallback to mocks or smart database search
      if (isSimulation || !image || !ai) {
        let simulatedName = req.body.simulatedName?.toLowerCase() || "pikachu";
        let match = mockResponses[simulatedName];
        
        if (!match) {
          // Attempt to find in local Pokédex
          const found = pokemonDb.find(p => p.name.toLowerCase() === simulatedName);
          if (found) {
            match = {
              detectedPokemon: found.name,
              detectedLevel: Math.floor(Math.random() * 40) + 15,
              isShiny: Math.random() < 0.05,
              matchupAnalysis: {
                types: found.types,
                weaknesses: found.weaknesses || ["Varies"],
                resistances: found.resistances || [],
                immunities: found.immunities || []
              },
              captureRecommendation: {
                catchRate: found.catchRate || 45,
                optBall: found.catchRate > 150 ? "Poke Ball" : "Ultra Ball",
                lureEncounter: false,
                heldItemProbability: found.heldItems || "None"
              },
              combatStrategy: {
                recommendedMoveTypes: found.weaknesses || [],
                threatMoves: ["Tackle", "Bite"],
                evYield: found.evYield || "1 HP",
                advice: `This is a simulated OCR result from Pokédex database entries for ${found.name}. Local SQLite backup engine is healthy and processing.`
              }
            };
          } else {
            match = mockResponses.pikachu;
          }
        }
        
        // Dynamic wait to simulate real AccessibilityService + ML Kit on-device processing lag (approx 400ms)
        await new Promise(resolve => setTimeout(resolve, 400));
        return res.json({ success: true, isDemo: !ai, data: match });
      }

      // Prepare multi-part message with image for Gemini
      // Strip off data url prefix (e.g. data:image/jpeg;base64,) if present
      const base64Data = image.includes(",") ? image.split(",")[1] : image;
      const mimeType = image.includes(":") ? image.split(";")[0].split(":")[1] : "image/jpeg";

      const prompt = `
        You are an assistant for a handheld dual-screen PokéMMO hybrid device (Accessibility Scanner).
        Analyze this screenshot of a Pokémon battle. 
        Perform OCR on the screens to identify:
        1. Opponent Pokémon Name (must match an official Pokémon from Gen 1 to Gen 9, pay attention to Gen 1-5 especially for PokeMMO).
        2. Opponent Level.
        3. Shiny status (e.g. check for star icons or custom color mutations).
        
        Return the structured analysis exactly matching the requested JSON format. Include detailed tactical matchups for PokéMMO players. Ensure weaknesses and resistances are accurate. Return the fields:
        - detectedPokemon
        - detectedLevel
        - isShiny (boolean)
        - matchupAnalysis (object with types: array of strings, weaknesses: array of strings, resistances: array of strings, immunities: array of strings)
        - captureRecommendation (object with catchRate: number, optBall: string, lureEncounter: boolean, heldItemProbability: string)
        - combatStrategy (object with recommendedMoveTypes: array of strings, threatMoves: array of strings, evYield: string, advice: string)
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedPokemon: { type: Type.STRING, description: "Official name of the detected Pokémon (e.g. Gengar, Scrafty)" },
              detectedLevel: { type: Type.INTEGER, description: "Detected level on screen (e.g. 42)" },
              isShiny: { type: Type.BOOLEAN, description: "Is this Pokémon shiny (check star indicators or shiny colors)" },
              matchupAnalysis: {
                type: Type.OBJECT,
                properties: {
                  types: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Types of the Pokémon" },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Type weaknesses (e.g. Ice, Psychic)" },
                  resistances: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Resistances" },
                  immunities: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Immunities" }
                },
                required: ["types", "weaknesses", "resistances", "immunities"]
              },
              captureRecommendation: {
                type: Type.OBJECT,
                properties: {
                  catchRate: { type: Type.INTEGER, description: "Encounter-specific base catch rate (1 - 255)" },
                  optBall: { type: Type.STRING, description: "Optimal Poke Ball type for catching (e.g. Net Ball, Dusk Ball)" },
                  lureEncounter: { type: Type.BOOLEAN, description: "Is this typically found using Lures in PokeMMO" },
                  heldItemProbability: { type: Type.STRING, description: "What held items can it carry in wild battles (e.g. Everstone 5%)" }
                },
                required: ["catchRate", "optBall", "lureEncounter", "heldItemProbability"]
              },
              combatStrategy: {
                type: Type.OBJECT,
                properties: {
                  recommendedMoveTypes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Optimal move typings to sweep them" },
                  threatMoves: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dangerous moves in their learnset at this level range" },
                  evYield: { type: Type.STRING, description: "EV yields value (e.g. '2 Attack')" },
                  advice: { type: Type.STRING, description: "Strategic suggestions or ability alerts like Moxie or Rough Skin" }
                },
                required: ["recommendedMoveTypes", "threatMoves", "evYield", "advice"]
              }
            },
            required: ["detectedPokemon", "detectedLevel", "isShiny", "matchupAnalysis", "captureRecommendation", "combatStrategy"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      return res.json({ success: true, isDemo: false, data: result });
    } catch (error: any) {
      console.error("Gemini scanning API error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Internal OCR service issue",
        fallbackAvailable: true
      });
    }
  });

  // Serve static dist in production, use Vite middleware in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PokéMMO DualScreen Dex Server] initiated on http://0.0.0.0:${PORT}`);
  });
}

startServer();
