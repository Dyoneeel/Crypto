import { useState } from "react";
import Navigation from "@/components/Navigation";
import SpitballSlam from "@/components/games/SpitballSlam";
import AlpacaAttack from "@/components/games/AlpacaAttack";
import LlamaDrama from "@/components/games/LlamaDrama";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type GameType = 'spitball' | 'alpaca' | 'llama_drama' | 'fleece_race' | 'probable_llama' | null;

export default function Games() {
  const [selectedGame, setSelectedGame] = useState<GameType>(null);

  const games = [
    {
      id: 'spitball' as const,
      title: 'Spitball Slam',
      description: 'Pachinko-style spitball game',
      cost: 5,
      maxWin: 500,
      component: SpitballSlam,
    },
    {
      id: 'alpaca' as const,
      title: 'Alpaca Attack',
      description: 'Tower defense against alpacas',
      cost: 10,
      maxWin: 1000,
      component: AlpacaAttack,
    },
    {
      id: 'llama_drama' as const,
      title: 'Llama Drama',
      description: 'Meme-filled slot machine',
      cost: 3,
      maxWin: 2000,
      component: LlamaDrama,
    },
    {
      id: 'fleece_race' as const,
      title: 'Fleece Race',
      description: 'Bet on racing llamas',
      cost: 5,
      maxWin: 1500,
      component: null, // Placeholder
    },
    {
      id: 'probable_llama' as const,
      title: 'Probable Llama',
      description: 'Provably fair dice game',
      cost: 1,
      maxWin: 100,
      component: null, // Placeholder
    },
  ];

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    if (!game || !game.component) {
      return (
        <div className="min-h-screen">
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">
              <h2 className="text-4xl font-carnival text-yellow-400 mb-4">Coming Soon!</h2>
              <p className="text-xl text-yellow-100 mb-8 font-fredoka">Larry is still setting up this game booth.</p>
              <Button 
                onClick={() => setSelectedGame(null)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-carnival"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
            </div>
          </main>
        </div>
      );
    }

    const GameComponent = game.component;
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              onClick={() => setSelectedGame(null)}
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-purple-900 font-carnival"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Game Selection
            </Button>
          </div>
          <GameComponent />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl font-carnival text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
            Larry's Casino Booths
          </h2>
          <p className="text-xl md:text-2xl text-yellow-100 mb-8 font-fredoka">
            Choose your game and test your luck!
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Card 
              key={game.id}
              className="game-booth rounded-xl transform hover:scale-105 transition-all duration-300 cursor-pointer hover:carnival-lights border-4 border-amber-900 overflow-hidden"
              onClick={() => setSelectedGame(game.id)}
            >
              <CardContent className="p-0">
                <div className="h-32 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-6xl">
                  {game.id === 'spitball' && '🎯'}
                  {game.id === 'alpaca' && '🏰'}
                  {game.id === 'llama_drama' && '🎰'}
                  {game.id === 'fleece_race' && '🏁'}
                  {game.id === 'probable_llama' && '🎲'}
                </div>
                <div className="p-6">
                  <h4 className="text-2xl font-carnival text-white mb-2">{game.title}</h4>
                  <p className="text-yellow-100 mb-4 font-fredoka">{game.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full font-semibold font-fredoka">
                      {game.cost} Tickets
                    </span>
                    <span className="text-yellow-400 font-carnival">
                      Win up to {game.maxWin} LLAMA!
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Leaderboard */}
        <section className="mt-12">
          <Card className="bg-gradient-to-r from-purple-800 to-teal-800 border-4 border-yellow-400">
            <CardContent className="p-8">
              <h3 className="text-3xl font-carnival text-yellow-400 text-center mb-6">
                🏆 Live Game Winners
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🥇</div>
                  <p className="font-carnival text-yellow-400">SpitMaster</p>
                  <p className="text-yellow-100 font-fredoka">Won 2,500 LLAMA</p>
                  <p className="text-sm text-yellow-200">Spitball Slam</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🥈</div>
                  <p className="font-carnival text-yellow-400">AlpacaDefender</p>
                  <p className="text-yellow-100 font-fredoka">Won 1,800 LLAMA</p>
                  <p className="text-sm text-yellow-200">Alpaca Attack</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-2">🥉</div>
                  <p className="font-carnival text-yellow-400">SlotLucky</p>
                  <p className="text-yellow-100 font-fredoka">Won 1,200 LLAMA</p>
                  <p className="text-sm text-yellow-200">Llama Drama</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
