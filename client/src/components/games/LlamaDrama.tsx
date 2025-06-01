import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, RotateCcw, Zap } from "lucide-react";

const SLOT_SYMBOLS = [
  { emoji: '🦙', name: 'Llama', value: 100, rarity: 0.1 },
  { emoji: '💎', name: 'Diamond', value: 50, rarity: 0.15 },
  { emoji: '🎪', name: 'Carnival', value: 30, rarity: 0.2 },
  { emoji: '🎯', name: 'Target', value: 20, rarity: 0.25 },
  { emoji: '🎭', name: 'Mask', value: 15, rarity: 0.3 },
  { emoji: '🎨', name: 'Art', value: 10, rarity: 0.35 },
  { emoji: '🎪', name: 'Tent', value: 8, rarity: 0.4 },
  { emoji: '🎈', name: 'Balloon', value: 5, rarity: 0.5 },
];

const MEME_PHRASES = [
  "Much wow!",
  "To the moon!",
  "Diamond hands!",
  "HODL!",
  "Stonks!",
  "This is fine",
  "Number go up",
  "Wen lambo?",
  "Larry approves",
  "Spicy meme!",
];

interface SlotReel {
  symbols: typeof SLOT_SYMBOLS[0][];
  position: number;
  spinning: boolean;
  finalSymbol?: typeof SLOT_SYMBOLS[0];
}

export default function LlamaDrama() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gamePhase, setGamePhase] = useState<'setup' | 'spinning' | 'finished'>('setup');
  const [reels, setReels] = useState<SlotReel[]>([]);
  const [betAmount, setBetAmount] = useState(3);
  const [winAmount, setWinAmount] = useState(0);
  const [winLines, setWinLines] = useState<string[]>([]);
  const [memePhrase, setMemePhrase] = useState("");
  const [jackpotProgress, setJackpotProgress] = useState(75);
  const [lastResult, setLastResult] = useState<any>(null);
  const [autoSpinning, setAutoSpinning] = useState(false);
  const [spinsRemaining, setSpinsRemaining] = useState(0);

  const playGameMutation = useMutation({
    mutationFn: async (data: { gameType: string; betAmount: number }) => {
      return apiRequest('POST', '/api/games/play', data);
    },
    onSuccess: (result) => {
      setLastResult(result);
      if (result.won) {
        toast({
          title: "🎰 LLAMA DRAMA WIN!",
          description: `Meme magic worked! Won ${result.winAmount} LLAMA with ${result.multiplier}x multiplier!`,
        });
        window.dispatchEvent(new CustomEvent('gameWin'));
      } else {
        toast({
          title: "No memes this time!",
          description: "The slot gods weren't feeling it. Spin again!",
          variant: "destructive",
        });
        window.dispatchEvent(new CustomEvent('gameLoss'));
      }
    },
    onError: (error) => {
      toast({
        title: "Slot Machine Error",
        description: error.message,
        variant: "destructive",
      });
      setGamePhase('setup');
    },
  });

  // Initialize reels
  useEffect(() => {
    const initReels = () => {
      const newReels: SlotReel[] = [];
      for (let i = 0; i < 3; i++) {
        const reelSymbols = [];
        for (let j = 0; j < 20; j++) {
          // Weight the symbols based on rarity
          const rand = Math.random();
          let cumulativeRarity = 0;
          for (const symbol of SLOT_SYMBOLS) {
            cumulativeRarity += symbol.rarity;
            if (rand <= cumulativeRarity) {
              reelSymbols.push(symbol);
              break;
            }
          }
          if (reelSymbols.length === j) {
            reelSymbols.push(SLOT_SYMBOLS[SLOT_SYMBOLS.length - 1]);
          }
        }
        
        newReels.push({
          symbols: reelSymbols,
          position: 0,
          spinning: false,
        });
      }
      setReels(newReels);
    };

    initReels();
  }, []);

  // Auto-spin functionality
  useEffect(() => {
    if (autoSpinning && spinsRemaining > 0 && gamePhase === 'setup') {
      const timer = setTimeout(() => {
        spin();
      }, 1500);
      return () => clearTimeout(timer);
    } else if (spinsRemaining === 0) {
      setAutoSpinning(false);
    }
  }, [autoSpinning, spinsRemaining, gamePhase]);

  const spin = async () => {
    if (!user || (user.ticketBalance || 0) < betAmount) {
      toast({
        title: "Insufficient Tickets",
        description: "You need more tickets to spin!",
        variant: "destructive",
      });
      return;
    }

    setGamePhase('spinning');
    setWinAmount(0);
    setWinLines([]);
    setMemePhrase("");

    // Generate random meme phrase
    const randomPhrase = MEME_PHRASES[Math.floor(Math.random() * MEME_PHRASES.length)];
    setMemePhrase(randomPhrase);

    // Start spinning animation
    setReels(prevReels => 
      prevReels.map(reel => ({
        ...reel,
        spinning: true,
        finalSymbol: undefined,
      }))
    );

    // Generate final symbols based on win probability
    const gameResult = Math.random() < 0.3; // 30% win chance
    let finalSymbols: typeof SLOT_SYMBOLS[0][] = [];

    if (gameResult) {
      // Generate winning combination
      const winType = Math.random();
      if (winType < 0.1) {
        // Triple match (rare)
        const symbol = SLOT_SYMBOLS[Math.floor(Math.random() * 5)]; // Favor higher value symbols
        finalSymbols = [symbol, symbol, symbol];
      } else if (winType < 0.4) {
        // Double match
        const symbol = SLOT_SYMBOLS[Math.floor(Math.random() * 6)];
        finalSymbols = [symbol, symbol, SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]];
      } else {
        // Scatter win or special combo
        finalSymbols = [
          SLOT_SYMBOLS[Math.floor(Math.random() * 4)],
          SLOT_SYMBOLS[Math.floor(Math.random() * 4)],
          SLOT_SYMBOLS[Math.floor(Math.random() * 4)],
        ];
      }
    } else {
      // Generate losing combination
      finalSymbols = [
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
        SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
      ];
      // Ensure no winning combinations
      while (checkWin(finalSymbols).total > 0) {
        finalSymbols[2] = SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)];
      }
    }

    // Stop reels with delays
    const delays = [1000, 1500, 2000];
    delays.forEach((delay, index) => {
      setTimeout(() => {
        setReels(prevReels => 
          prevReels.map((reel, i) => 
            i === index 
              ? { ...reel, spinning: false, finalSymbol: finalSymbols[index] }
              : reel
          )
        );

        if (index === delays.length - 1) {
          // All reels stopped, check for wins
          setTimeout(() => {
            const winResult = checkWin(finalSymbols);
            setWinAmount(winResult.total * betAmount);
            setWinLines(winResult.lines);
            
            // Update jackpot progress
            setJackpotProgress(prev => {
              const newProgress = winResult.total > 0 ? Math.min(100, prev + 5) : Math.max(0, prev - 1);
              return newProgress;
            });

            // Submit to backend
            playGameMutation.mutate({ gameType: 'llama_drama', betAmount });
            
            setGamePhase('finished');
            
            if (autoSpinning) {
              setSpinsRemaining(prev => prev - 1);
            }
          }, 500);
        }
      }, delay);
    });
  };

  const checkWin = (symbols: typeof SLOT_SYMBOLS[0][]) => {
    const lines: string[] = [];
    let total = 0;

    // Check for three of a kind
    if (symbols[0].name === symbols[1].name && symbols[1].name === symbols[2].name) {
      lines.push(`Triple ${symbols[0].name}!`);
      total += symbols[0].value * 3;
      
      // Jackpot for triple llamas
      if (symbols[0].name === 'Llama') {
        lines.push('LLAMA JACKPOT!');
        total += 500;
      }
    }
    // Check for pairs
    else if (symbols[0].name === symbols[1].name || symbols[1].name === symbols[2].name || symbols[0].name === symbols[2].name) {
      const pairSymbol = symbols[0].name === symbols[1].name ? symbols[0] : 
                         symbols[1].name === symbols[2].name ? symbols[1] : symbols[0];
      lines.push(`Pair of ${pairSymbol.name}s!`);
      total += pairSymbol.value;
    }
    // Special combinations
    else if (symbols.every(s => ['Diamond', 'Llama', 'Carnival'].includes(s.name))) {
      lines.push('Royal Llama Combo!');
      total += 75;
    }
    else if (symbols.every(s => s.value >= 20)) {
      lines.push('High Value Combo!');
      total += 25;
    }

    return { lines, total };
  };

  const startAutoSpin = () => {
    setAutoSpinning(true);
    setSpinsRemaining(10);
  };

  const resetGame = () => {
    setGamePhase('setup');
    setWinAmount(0);
    setWinLines([]);
    setMemePhrase("");
    setLastResult(null);
    setAutoSpinning(false);
    setSpinsRemaining(0);
  };

  const getCurrentSymbol = (reel: SlotReel) => {
    if (!reel.spinning && reel.finalSymbol) {
      return reel.finalSymbol;
    }
    return reel.symbols[Math.floor(reel.position) % reel.symbols.length];
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-green-800 to-teal-800 border-4 border-yellow-400">
        <CardHeader>
          <CardTitle className="text-4xl font-carnival text-yellow-400 text-center flex items-center justify-center">
            <Zap className="w-10 h-10 mr-4" />
            🎰 Llama Drama
          </CardTitle>
          <p className="text-center text-yellow-100 font-fredoka text-lg">
            Meme-filled slot machine! Match symbols and trigger meme magic for big wins!
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Slot Machine */}
            <div className="lg:col-span-2">
              {/* Jackpot Display */}
              <div className="bg-red-600 text-yellow-400 text-center py-3 rounded-t-xl border-4 border-yellow-400 border-b-0">
                <h3 className="font-carnival text-2xl animate-pulse-fast">
                  💎 JACKPOT: {(1000 + jackpotProgress * 50).toLocaleString()} LLAMA 💎
                </h3>
                <Progress value={jackpotProgress} className="mt-2 mx-4" />
              </div>

              {/* Main Slot Display */}
              <div className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 border-4 border-yellow-400 border-t-0 rounded-b-xl">
                {/* Meme Phrase Display */}
                <div className="text-center mb-4 h-8">
                  {memePhrase && (
                    <p className="text-2xl font-carnival text-yellow-400 animate-bounce-slow">
                      {memePhrase}
                    </p>
                  )}
                </div>

                {/* Slot Reels */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {reels.map((reel, index) => (
                    <div key={index} className="relative">
                      <div className={`w-24 h-24 mx-auto bg-white rounded-lg border-4 border-gray-400 flex items-center justify-center text-4xl transition-all duration-300 ${
                        reel.spinning ? 'animate-spin-slow' : ''
                      }`}>
                        <span className={reel.spinning ? 'blur-sm' : ''}>
                          {getCurrentSymbol(reel).emoji}
                        </span>
                      </div>
                      
                      {/* Reel name */}
                      <p className="text-center text-yellow-100 font-fredoka text-sm mt-2">
                        {!reel.spinning && reel.finalSymbol ? reel.finalSymbol.name : 'Spinning...'}
                      </p>
                      
                      {/* Win highlight */}
                      {winLines.length > 0 && !reel.spinning && (
                        <div className="absolute inset-0 border-4 border-yellow-400 rounded-lg animate-pulse-fast pointer-events-none"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Win Display */}
                {winLines.length > 0 && (
                  <div className="bg-green-600 text-white p-4 rounded-lg text-center mb-4">
                    <div className="text-4xl mb-2">🎉</div>
                    {winLines.map((line, index) => (
                      <p key={index} className="font-carnival text-lg">{line}</p>
                    ))}
                    <p className="font-fredoka text-2xl mt-2">
                      Base Win: {winAmount} LLAMA
                    </p>
                  </div>
                )}

                {/* Result Display */}
                {lastResult && gamePhase === 'finished' && (
                  <div className={`p-4 rounded-lg text-center ${
                    lastResult.won ? 'bg-green-600' : 'bg-red-600'
                  } text-white mb-4`}>
                    <div className="text-4xl mb-2">
                      {lastResult.won ? '🚀' : '😅'}
                    </div>
                    <h3 className="font-carnival text-xl mb-2">
                      {lastResult.won ? 'MEME MAGIC!' : 'No Memes Today!'}
                    </h3>
                    {lastResult.won && (
                      <p className="font-fredoka">
                        Final Win: {lastResult.winAmount} LLAMA ({lastResult.multiplier}x)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Game Stats */}
              <Card className="ticket-style border-2 border-amber-800">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-fredoka text-amber-800">Bet:</span>
                      <span className="font-carnival text-purple-600">{betAmount} Tickets</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-fredoka text-amber-800">Last Win:</span>
                      <span className="font-carnival text-green-600">{lastResult?.winAmount || 0} LLAMA</span>
                    </div>
                    {autoSpinning && (
                      <div className="flex justify-between">
                        <span className="font-fredoka text-amber-800">Auto Spins:</span>
                        <span className="font-carnival text-blue-600">{spinsRemaining}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Bet Controls */}
              {gamePhase === 'setup' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-yellow-100 font-fredoka mb-2">
                      Bet Amount (Tickets):
                    </label>
                    <select
                      value={betAmount}
                      onChange={(e) => setBetAmount(Number(e.target.value))}
                      className="w-full p-2 rounded border-2 border-yellow-400 bg-white text-amber-900 font-fredoka"
                      disabled={autoSpinning}
                    >
                      <option value={1}>1 Ticket</option>
                      <option value={3}>3 Tickets</option>
                      <option value={5}>5 Tickets</option>
                      <option value={10}>10 Tickets</option>
                      <option value={25}>25 Tickets (Max Bet)</option>
                    </select>
                  </div>
                  
                  <Button
                    onClick={spin}
                    disabled={playGameMutation.isPending || autoSpinning}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-carnival text-lg py-3"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    SPIN TO WIN
                  </Button>

                  <Button
                    onClick={startAutoSpin}
                    disabled={playGameMutation.isPending || autoSpinning}
                    variant="outline"
                    className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-amber-900 font-carnival"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Auto Spin (10x)
                  </Button>
                </div>
              )}

              {(gamePhase === 'finished' || autoSpinning) && (
                <div className="space-y-4">
                  {!autoSpinning && (
                    <Button
                      onClick={() => setGamePhase('setup')}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white font-carnival"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Spin Again
                    </Button>
                  )}

                  {autoSpinning && (
                    <Button
                      onClick={() => {setAutoSpinning(false); setSpinsRemaining(0);}}
                      variant="outline"
                      className="w-full border-red-400 text-red-400 hover:bg-red-400 hover:text-white font-carnival"
                    >
                      Stop Auto Spin
                    </Button>
                  )}

                  <Button
                    onClick={resetGame}
                    variant="outline"
                    className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-amber-900 font-carnival"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Game
                  </Button>
                </div>
              )}

              {/* Paytable */}
              <Card className="bg-white/10 border-2 border-white/20">
                <CardContent className="p-4">
                  <h4 className="font-carnival text-yellow-400 mb-3">Paytable:</h4>
                  <div className="space-y-1 text-xs text-yellow-100 font-fredoka">
                    <div className="flex justify-between">
                      <span>🦙🦙🦙 Triple Llama:</span>
                      <span className="text-yellow-400">800x + Jackpot!</span>
                    </div>
                    <div className="flex justify-between">
                      <span>💎💎💎 Triple Diamond:</span>
                      <span className="text-green-400">150x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>🎪🎪🎪 Triple Carnival:</span>
                      <span className="text-blue-400">90x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Royal Combo:</span>
                      <span className="text-purple-400">75x</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Any Pair:</span>
                      <span className="text-gray-400">5x-100x</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meme Gallery */}
              <Card className="bg-white/10 border-2 border-white/20">
                <CardContent className="p-4">
                  <h4 className="font-carnival text-yellow-400 mb-2">Meme Power:</h4>
                  <div className="grid grid-cols-2 gap-1 text-xs text-yellow-100 font-fredoka">
                    {MEME_PHRASES.slice(0, 6).map((phrase, index) => (
                      <div key={index} className="bg-purple-600/30 rounded px-1 py-0.5 text-center">
                        {phrase}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
