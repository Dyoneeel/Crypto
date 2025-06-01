import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

export default function GameBooths() {
  const games = [
    {
      id: 'spitball',
      title: 'Spitball Slam',
      description: 'Pachinko-style spitball game',
      icon: '🎯',
      cost: 5,
      maxWin: 500,
      gradient: 'from-purple-600 to-blue-600',
    },
    {
      id: 'alpaca',
      title: 'Alpaca Attack',
      description: 'Tower defense against alpacas',
      icon: '🏰',
      cost: 10,
      maxWin: 1000,
      gradient: 'from-red-600 to-orange-600',
    },
    {
      id: 'llama_drama',
      title: 'Llama Drama',
      description: 'Meme-filled slot machine',
      icon: '🎰',
      cost: 3,
      maxWin: 2000,
      gradient: 'from-green-600 to-teal-600',
    },
    {
      id: 'fleece_race',
      title: 'Fleece Race',
      description: 'Bet on racing llamas',
      icon: '🏁',
      cost: 5,
      maxWin: 1500,
      gradient: 'from-yellow-600 to-orange-600',
    },
    {
      id: 'probable_llama',
      title: 'Probable Llama',
      description: 'Provably fair dice game',
      icon: '🎲',
      cost: 1,
      maxWin: 100,
      gradient: 'from-pink-600 to-purple-600',
    },
    {
      id: 'meme_generator',
      title: 'Meme Generator',
      description: 'Create viral llama memes',
      icon: '🎨',
      cost: 0,
      maxWin: 0,
      gradient: 'from-indigo-600 to-blue-600',
      isFree: true,
    },
  ];

  return (
    <section className="mb-12">
      <h3 className="text-4xl font-carnival text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-center mb-8">
        🎪 Larry's Casino Booths
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link key={game.id} href="/games">
            <Card className="game-booth rounded-xl transform hover:scale-105 transition-all duration-300 cursor-pointer hover:carnival-lights border-4 border-amber-900 overflow-hidden group">
              <CardContent className="p-0">
                <div className={`h-32 bg-gradient-to-br ${game.gradient} flex items-center justify-center text-6xl relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <span className="relative z-10 filter drop-shadow-lg animate-float">
                    {game.icon}
                  </span>
                  
                  {/* Carnival Lights Effect */}
                  <div className="absolute top-2 left-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <div className="absolute top-2 right-2 w-3 h-3 bg-red-400 rounded-full animate-pulse delay-300"></div>
                  <div className="absolute bottom-2 left-2 w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-700"></div>
                  <div className="absolute bottom-2 right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse delay-1000"></div>
                </div>
                
                <div className="p-6 bg-gradient-to-br from-yellow-400 to-orange-500">
                  <h4 className="text-2xl font-carnival text-white mb-2 drop-shadow-lg">
                    {game.title}
                  </h4>
                  <p className="text-white/90 mb-4 font-fredoka font-medium">
                    {game.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    {game.isFree ? (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full font-semibold font-fredoka shadow-lg">
                        FREE
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full font-semibold font-fredoka shadow-lg">
                        {game.cost} Tickets
                      </span>
                    )}
                    
                    {!game.isFree && (
                      <span className="text-white font-carnival drop-shadow-md">
                        Win up to {game.maxWin} LLAMA!
                      </span>
                    )}
                    
                    {game.isFree && (
                      <span className="text-white font-carnival drop-shadow-md">
                        Earn social rewards!
                      </span>
                    )}
                  </div>
                  
                  {/* Decorative Elements */}
                  <div className="mt-3 flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Promotional Banner */}
      <div className="mt-8 bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 carnival-stripes rounded-xl p-6 border-4 border-white text-center">
        <h4 className="text-3xl font-carnival text-white mb-2 drop-shadow-lg">
          🎊 Grand Opening Special! 🎊
        </h4>
        <p className="text-white font-fredoka text-lg mb-4">
          Play any game and get a 25% bonus on your first win today!
        </p>
        <div className="flex justify-center space-x-4">
          <div className="bg-white/20 rounded-full px-4 py-2">
            <span className="text-white font-carnival">🎁 Bonus Active</span>
          </div>
          <div className="bg-white/20 rounded-full px-4 py-2">
            <span className="text-white font-carnival">🦙 Larry Approved</span>
          </div>
        </div>
      </div>
    </section>
  );
}
