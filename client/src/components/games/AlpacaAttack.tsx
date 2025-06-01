import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, Zap, RotateCcw, Play } from "lucide-react";

interface Alpaca {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  reward: number;
}

interface Tower {
  id: number;
  x: number;
  y: number;
  type: 'basic' | 'rapid' | 'power';
  damage: number;
  range: number;
  fireRate: number;
  lastFired: number;
  cost: number;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  targetId: number;
  damage: number;
}

const TOWER_TYPES = {
  basic: { damage: 10, range: 60, fireRate: 1000, cost: 5, emoji: '🎯', color: 'text-blue-500' },
  rapid: { damage: 5, range: 50, fireRate: 300, cost: 8, emoji: '⚡', color: 'text-yellow-500' },
  power: { damage: 25, range: 80, fireRate: 2000, cost: 12, emoji: '💥', color: 'text-red-500' },
};

export default function AlpacaAttack() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [alpacas, setAlpacas] = useState<Alpaca[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [selectedTowerType, setSelectedTowerType] = useState<'basic' | 'rapid' | 'power'>('basic');
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(10);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(20);
  const [betAmount, setBetAmount] = useState(10);
  const [gameWon, setGameWon] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const gameLoopRef = useRef<number>();
  const nextAlpacaRef = useRef<number>(0);

  const playGameMutation = useMutation({
    mutationFn: async (data: { gameType: string; betAmount: number }) => {
      return apiRequest('POST', '/api/games/play', data);
    },
    onSuccess: (result) => {
      setLastResult(result.data);
      if (result.data.won) {
        toast({
          title: "🏰 Fortress Defended!",
          description: `You won ${result.data.winAmount} LLAMA with a ${result.data.multiplier}x multiplier!`,
        });
        window.dispatchEvent(new CustomEvent('gameWin'));
      } else {
        toast({
          title: "Fortress Overrun!",
          description: "The alpacas broke through! Better defenses next time!",
          variant: "destructive",
        });
        window.dispatchEvent(new CustomEvent('gameLoss'));
      }
      setGamePhase('finished');
    },
    onError: (error) => {
      toast({
        title: "Game Error",
        description: error.message,
        variant: "destructive",
      });
      setGamePhase('setup');
    },
  });

  // Game loop
  useEffect(() => {
    if (gamePhase !== 'playing') return;

    const gameLoop = () => {
      const now = Date.now();

      // Spawn alpacas
      if (now > nextAlpacaRef.current && alpacas.length < wave * 2 + 3) {
        const newAlpaca: Alpaca = {
          id: now,
          x: -50,
          y: 50 + Math.random() * 200,
          health: 20 + wave * 10,
          maxHealth: 20 + wave * 10,
          speed: 0.5 + wave * 0.1,
          reward: 5 + wave * 2,
        };
        setAlpacas(prev => [...prev, newAlpaca]);
        nextAlpacaRef.current = now + 2000 - wave * 100; // Faster spawning as waves increase
      }

      // Move alpacas
      setAlpacas(prev => prev.map(alpaca => ({
        ...alpaca,
        x: alpaca.x + alpaca.speed,
      })).filter(alpaca => {
        if (alpaca.x > 600) {
          setLives(prevLives => {
            const newLives = prevLives - 1;
            if (newLives <= 0) {
              setGamePhase('finished');
              playGameMutation.mutate({ gameType: 'alpaca', betAmount });
            }
            return newLives;
          });
          return false;
        }
        return alpaca.health > 0;
      }));

      // Tower shooting
      setTowers(prevTowers => 
        prevTowers.map(tower => {
          if (now - tower.lastFired < TOWER_TYPES[tower.type].fireRate) return tower;

          // Find target in range
          const target = alpacas.find(alpaca => {
            const distance = Math.sqrt((alpaca.x - tower.x) ** 2 + (alpaca.y - tower.y) ** 2);
            return distance <= tower.range && alpaca.health > 0;
          });

          if (target) {
            // Create projectile
            setProjectiles(prev => [...prev, {
              id: now + tower.id,
              x: tower.x,
              y: tower.y,
              targetId: target.id,
              damage: tower.damage,
            }]);

            return { ...tower, lastFired: now };
          }

          return tower;
        })
      );

      // Move projectiles and handle hits
      setProjectiles(prev => 
        prev.filter(projectile => {
          const target = alpacas.find(a => a.id === projectile.targetId);
          if (!target) return false;

          const distance = Math.sqrt((target.x - projectile.x) ** 2 + (target.y - projectile.y) ** 2);
          
          if (distance < 20) {
            // Hit target
            setAlpacas(prevAlpacas => 
              prevAlpacas.map(alpaca => {
                if (alpaca.id === target.id) {
                  const newHealth = alpaca.health - projectile.damage;
                  if (newHealth <= 0) {
                    setScore(prevScore => prevScore + alpaca.reward);
                    setCoins(prevCoins => prevCoins + alpaca.reward);
                  }
                  return { ...alpaca, health: Math.max(0, newHealth) };
                }
                return alpaca;
              })
            );
            return false;
          }

          return true;
        })
      );

      // Check win condition
      if (alpacas.length === 0 && wave >= 5) {
        setGameWon(true);
        setGamePhase('finished');
        playGameMutation.mutate({ gameType: 'alpaca', betAmount });
        return;
      }

      // Next wave
      if (alpacas.length === 0 && lives > 0) {
        setWave(prev => prev + 1);
        setCoins(prev => prev + 10); // Bonus coins for completing wave
        nextAlpacaRef.current = now + 3000; // Short break between waves
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gamePhase, alpacas, towers, wave, lives, betAmount, playGameMutation]);

  const startGame = () => {
    if (!user || (user.ticketBalance || 0) < betAmount) {
      toast({
        title: "Insufficient Tickets",
        description: "You need more tickets to play!",
        variant: "destructive",
      });
      return;
    }

    setGamePhase('playing');
    setAlpacas([]);
    setTowers([]);
    setProjectiles([]);
    setWave(1);
    setLives(10);
    setScore(0);
    setCoins(20);
    setGameWon(false);
    nextAlpacaRef.current = Date.now() + 1000;
  };

  const placeTower = (x: number, y: number) => {
    if (gamePhase !== 'playing') return;
    
    const towerType = TOWER_TYPES[selectedTowerType];
    if (coins < towerType.cost) {
      toast({
        title: "Not enough coins!",
        description: `You need ${towerType.cost} coins for this tower.`,
        variant: "destructive",
      });
      return;
    }

    // Check if position is clear
    const tooClose = towers.some(tower => 
      Math.sqrt((tower.x - x) ** 2 + (tower.y - y) ** 2) < 40
    );

    if (tooClose) {
      toast({
        title: "Too close!",
        description: "Towers need more space between them.",
        variant: "destructive",
      });
      return;
    }

    const newTower: Tower = {
      id: Date.now(),
      x,
      y,
      type: selectedTowerType,
      damage: towerType.damage,
      range: towerType.range,
      fireRate: towerType.fireRate,
      lastFired: 0,
      cost: towerType.cost,
    };

    setTowers(prev => [...prev, newTower]);
    setCoins(prev => prev - towerType.cost);
  };

  const resetGame = () => {
    setGamePhase('setup');
    setAlpacas([]);
    setTowers([]);
    setProjectiles([]);
    setWave(1);
    setLives(10);
    setScore(0);
    setCoins(20);
    setGameWon(false);
    setLastResult(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-gradient-to-br from-red-800 to-orange-800 border-4 border-yellow-400">
        <CardHeader>
          <CardTitle className="text-4xl font-carnival text-yellow-400 text-center flex items-center justify-center">
            <Shield className="w-10 h-10 mr-4" />
            🏰 Alpaca Attack
          </CardTitle>
          <p className="text-center text-yellow-100 font-fredoka text-lg">
            Defend your fortress from the alpaca invasion! Place towers strategically to stop them!
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Game Board */}
            <div className="lg:col-span-3">
              <div 
                className="relative w-full h-96 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl border-4 border-yellow-400 overflow-hidden cursor-crosshair"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 600;
                  const y = ((e.clientY - rect.top) / rect.height) * 400;
                  placeTower(x, y);
                }}
              >
                {/* Path */}
                <div className="absolute top-12 left-0 right-16 h-8 bg-yellow-600 opacity-50 rounded-r-full"></div>
                
                {/* Alpacas */}
                {alpacas.map(alpaca => (
                  <div
                    key={alpaca.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${(alpaca.x / 600) * 100}%`,
                      top: `${(alpaca.y / 400) * 100}%`,
                    }}
                  >
                    <div className="text-2xl animate-bounce-slow">🦙</div>
                    {alpaca.health < alpaca.maxHealth && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-red-600 rounded">
                        <div 
                          className="h-full bg-green-500 rounded transition-all duration-200"
                          style={{ width: `${(alpaca.health / alpaca.maxHealth) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {/* Towers */}
                {towers.map(tower => (
                  <div
                    key={tower.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${(tower.x / 600) * 100}%`,
                      top: `${(tower.y / 400) * 100}%`,
                    }}
                  >
                    <div className={`text-2xl ${TOWER_TYPES[tower.type].color}`}>
                      {TOWER_TYPES[tower.type].emoji}
                    </div>
                    {/* Range indicator on hover */}
                    <div 
                      className="absolute border border-white opacity-20 rounded-full pointer-events-none"
                      style={{
                        width: `${(tower.range / 600) * 200}%`,
                        height: `${(tower.range / 400) * 200}%`,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  </div>
                ))}

                {/* Projectiles */}
                {projectiles.map(projectile => (
                  <div
                    key={projectile.id}
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                    style={{
                      left: `${(projectile.x / 600) * 100}%`,
                      top: `${(projectile.y / 400) * 100}%`,
                    }}
                  />
                ))}

                {/* Fortress */}
                <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-4xl">
                  🏰
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="space-y-4">
              {/* Game Stats */}
              <Card className="ticket-style border-2 border-amber-800">
                <CardContent className="p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-fredoka text-amber-800">Wave:</span>
                      <span className="font-carnival text-red-600">{wave}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-fredoka text-amber-800">Lives:</span>
                      <span className="font-carnival text-blue-600">{lives}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-fredoka text-amber-800">Score:</span>
                      <span className="font-carnival text-green-600">{score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-fredoka text-amber-800">Coins:</span>
                      <span className="font-carnival text-yellow-600">{coins}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tower Selection */}
              {gamePhase === 'playing' && (
                <Card className="ticket-style border-2 border-amber-800">
                  <CardContent className="p-4">
                    <h4 className="font-carnival text-amber-800 mb-3">Select Tower:</h4>
                    <div className="space-y-2">
                      {Object.entries(TOWER_TYPES).map(([type, config]) => (
                        <Button
                          key={type}
                          variant={selectedTowerType === type ? "default" : "outline"}
                          onClick={() => setSelectedTowerType(type as any)}
                          disabled={coins < config.cost}
                          className="w-full justify-between font-fredoka"
                          size="sm"
                        >
                          <span>{config.emoji} {type}</span>
                          <span>{config.cost} coins</span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Game Controls */}
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
                    >
                      <option value={5}>5 Tickets</option>
                      <option value={10}>10 Tickets</option>
                      <option value={20}>20 Tickets</option>
                      <option value={50}>50 Tickets</option>
                    </select>
                  </div>
                  
                  <Button
                    onClick={startGame}
                    disabled={playGameMutation.isPending}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-carnival"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Defense
                  </Button>
                </div>
              )}

              {gamePhase === 'finished' && (
                <div className="space-y-4">
                  {lastResult && (
                    <Card className={`border-2 ${lastResult.won ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2">
                          {lastResult.won ? '🏆' : '💥'}
                        </div>
                        <h3 className="font-carnival text-xl mb-2">
                          {lastResult.won ? 'Victory!' : 'Defeated!'}
                        </h3>
                        {lastResult.won && (
                          <p className="font-fredoka text-green-600">
                            Won {lastResult.winAmount} LLAMA!
                          </p>
                        )}
                        <p className="font-fredoka text-gray-600 text-sm mt-2">
                          Waves Completed: {wave - 1}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={resetGame}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-carnival"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Play Again
                  </Button>
                </div>
              )}

              {/* Instructions */}
              <Card className="bg-white/10 border-2 border-white/20">
                <CardContent className="p-4">
                  <h4 className="font-carnival text-yellow-400 mb-2">How to Play:</h4>
                  <ul className="text-yellow-100 font-fredoka text-xs space-y-1">
                    <li>• Click to place towers</li>
                    <li>• Stop alpacas reaching fortress</li>
                    <li>• Survive 5 waves to win big!</li>
                    <li>• Basic: balanced damage</li>
                    <li>• Rapid: fast, low damage</li>
                    <li>• Power: slow, high damage</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
