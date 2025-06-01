import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, Play, RotateCcw } from "lucide-react";

interface Ball {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  active: boolean;
}

interface Peg {
  x: number;
  y: number;
  hit: boolean;
}

export default function SpitballSlam() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [balls, setBalls] = useState<Ball[]>([]);
  const [pegs, setPegs] = useState<Peg[]>([]);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [betAmount, setBetAmount] = useState(5);
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [ballsRemaining, setBallsRemaining] = useState(3);
  const [powerLevel, setPowerLevel] = useState(50);
  const [lastResult, setLastResult] = useState<any>(null);

  const playGameMutation = useMutation({
    mutationFn: async (data: { gameType: string; betAmount: number }) => {
      return apiRequest('POST', '/api/games/play', data);
    },
    onSuccess: (result) => {
      setLastResult(result.data);
      if (result.data.won) {
        toast({
          title: "🎯 Bulls-eye!",
          description: `You won ${result.data.winAmount} LLAMA with a ${result.data.multiplier}x multiplier!`,
        });
        // Trigger global event for Larry
        window.dispatchEvent(new CustomEvent('gameWin'));
      } else {
        toast({
          title: "Almost there!",
          description: "Better luck next time! Larry believes in you!",
          variant: "destructive",
        });
        // Trigger global event for Larry
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

  // Initialize pegs in a pachinko pattern
  useEffect(() => {
    const newPegs: Peg[] = [];
    for (let row = 0; row < 8; row++) {
      const pegsInRow = row % 2 === 0 ? 6 : 5;
      const startX = row % 2 === 0 ? 60 : 110;
      for (let col = 0; col < pegsInRow; col++) {
        newPegs.push({
          x: startX + col * 100,
          y: 100 + row * 60,
          hit: false
        });
      }
    }
    setPegs(newPegs);
  }, []);

  // Animation loop for balls
  useEffect(() => {
    if (!isPlaying) return;

    const animationFrame = requestAnimationFrame(() => {
      setBalls(prevBalls => 
        prevBalls.map(ball => {
          if (!ball.active) return ball;

          let newX = ball.x + ball.dx;
          let newY = ball.y + ball.dy;
          let newDx = ball.dx;
          let newDy = ball.dy + 0.5; // gravity

          // Bounce off walls
          if (newX <= 10 || newX >= 590) {
            newDx = -newDx * 0.8;
            newX = Math.max(10, Math.min(590, newX));
          }

          // Check peg collisions
          pegs.forEach(peg => {
            const distance = Math.sqrt((newX - peg.x) ** 2 + (newY - peg.y) ** 2);
            if (distance < 25 && !peg.hit) {
              peg.hit = true;
              setScore(prev => prev + 10);
              // Bounce off peg
              const angle = Math.atan2(newY - peg.y, newX - peg.x);
              newDx = Math.cos(angle) * 3;
              newDy = Math.sin(angle) * 3;
            }
          });

          // Remove ball if it goes off bottom
          if (newY > 600) {
            return { ...ball, active: false };
          }

          return {
            ...ball,
            x: newX,
            y: newY,
            dx: newDx,
            dy: newDy
          };
        })
      );
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, pegs]);

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
    setIsPlaying(true);
    setScore(0);
    setBallsRemaining(3);
    setBalls([]);
    setPegs(prev => prev.map(peg => ({ ...peg, hit: false })));
  };

  const shootBall = () => {
    if (ballsRemaining <= 0) return;

    const newBall: Ball = {
      id: Date.now(),
      x: 300, // Center
      y: 20,
      dx: (Math.random() - 0.5) * (powerLevel / 10),
      dy: 2 + (powerLevel / 50),
      active: true
    };

    setBalls(prev => [...prev, newBall]);
    setBallsRemaining(prev => prev - 1);

    if (ballsRemaining === 1) {
      // Last ball, finish game after delay
      setTimeout(() => {
        setIsPlaying(false);
        playGameMutation.mutate({ gameType: 'spitball', betAmount });
      }, 3000);
    }
  };

  const resetGame = () => {
    setGamePhase('setup');
    setIsPlaying(false);
    setScore(0);
    setBallsRemaining(3);
    setBalls([]);
    setPegs(prev => prev.map(peg => ({ ...peg, hit: false })));
    setLastResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-purple-800 to-blue-800 border-4 border-yellow-400">
        <CardHeader>
          <CardTitle className="text-4xl font-carnival text-yellow-400 text-center flex items-center justify-center">
            <Target className="w-10 h-10 mr-4" />
            🎯 Spitball Slam
          </CardTitle>
          <p className="text-center text-yellow-100 font-fredoka text-lg">
            Launch spitballs down the pachinko board! Hit pegs to score points and win LLAMA!
          </p>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Board */}
            <div className="lg:col-span-2">
              <div className="relative w-full h-96 bg-gradient-to-b from-teal-600 to-blue-700 rounded-xl border-4 border-yellow-400 overflow-hidden">
                {/* Pegs */}
                {pegs.map((peg, index) => (
                  <div
                    key={index}
                    className={`absolute w-5 h-5 rounded-full transition-colors duration-300 ${
                      peg.hit ? 'bg-yellow-400 animate-pulse' : 'bg-white'
                    }`}
                    style={{
                      left: `${(peg.x / 600) * 100}%`,
                      top: `${(peg.y / 600) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}

                {/* Balls */}
                {balls.map(ball => (
                  ball.active && (
                    <div
                      key={ball.id}
                      className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"
                      style={{
                        left: `${(ball.x / 600) * 100}%`,
                        top: `${(ball.y / 600) * 100}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  )
                ))}

                {/* Shooter */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-yellow-400 flex items-center justify-center">
                    💥
                  </div>
                </div>

                {/* Score zones at bottom */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                  {[100, 250, 500, 250, 100].map((value, index) => (
                    <div key={index} className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                      {value}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Controls */}
            <div className="space-y-6">
              {/* Game Stats */}
              <Card className="ticket-style border-2 border-amber-800">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-fredoka text-amber-800">Score:</span>
                      <span className="font-carnival text-red-600 text-xl">{score}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-fredoka text-amber-800">Balls Left:</span>
                      <span className="font-carnival text-blue-600 text-xl">{ballsRemaining}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-fredoka text-amber-800">Bet:</span>
                      <span className="font-carnival text-purple-600 text-xl">{betAmount} Tickets</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Power Control */}
              {gamePhase === 'playing' && (
                <Card className="ticket-style border-2 border-amber-800">
                  <CardContent className="p-4">
                    <label className="block text-amber-800 font-fredoka mb-2">
                      Shot Power: {powerLevel}%
                    </label>
                    <Progress value={powerLevel} className="mb-3" />
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={powerLevel}
                      onChange={(e) => setPowerLevel(Number(e.target.value))}
                      className="w-full"
                    />
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
                      <option value={1}>1 Ticket</option>
                      <option value={5}>5 Tickets</option>
                      <option value={10}>10 Tickets</option>
                      <option value={25}>25 Tickets</option>
                    </select>
                  </div>
                  
                  <Button
                    onClick={startGame}
                    disabled={playGameMutation.isPending}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-carnival text-lg py-3"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </Button>
                </div>
              )}

              {gamePhase === 'playing' && (
                <Button
                  onClick={shootBall}
                  disabled={ballsRemaining <= 0}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-carnival text-lg py-3"
                >
                  🎯 Shoot Ball ({ballsRemaining} left)
                </Button>
              )}

              {gamePhase === 'finished' && (
                <div className="space-y-4">
                  {lastResult && (
                    <Card className={`border-2 ${lastResult.won ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2">
                          {lastResult.won ? '🎉' : '😅'}
                        </div>
                        <h3 className="font-carnival text-xl mb-2">
                          {lastResult.won ? 'You Won!' : 'Try Again!'}
                        </h3>
                        {lastResult.won && (
                          <p className="font-fredoka text-green-600">
                            Won {lastResult.winAmount} LLAMA! ({lastResult.multiplier}x)
                          </p>
                        )}
                        <p className="font-fredoka text-gray-600 text-sm mt-2">
                          Final Score: {score} points
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={resetGame}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-carnival text-lg py-3"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Play Again
                  </Button>
                </div>
              )}

              {/* Instructions */}
              <Card className="bg-white/10 border-2 border-white/20">
                <CardContent className="p-4">
                  <h4 className="font-carnival text-yellow-400 mb-2">How to Play:</h4>
                  <ul className="text-yellow-100 font-fredoka text-sm space-y-1">
                    <li>• Adjust power and shoot 3 balls</li>
                    <li>• Hit pegs to score points</li>
                    <li>• Land in high-value zones</li>
                    <li>• Higher scores = better winnings!</li>
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
