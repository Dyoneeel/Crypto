import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coins, Gamepad2, Trophy, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-teal-700">
      {/* Header */}
      <header className="border-b-4 border-yellow-400 bg-amber-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl animate-bounce-slow">
                🦙
              </div>
              <h1 className="text-3xl font-carnival text-yellow-400">LuckyLlama Coin</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-carnival text-lg px-8 py-3 rounded-full transform hover:scale-105 transition-all duration-300"
            >
              Join the Carnival!
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="mb-8 animate-float">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-6xl mb-6">
              🦙
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-carnival text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-6 animate-pulse-fast">
            Larry's Lucky Carnival
          </h1>
          
          <p className="text-2xl md:text-3xl text-yellow-100 mb-8 font-fredoka">
            Step right up and test your luck with Larry!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-carnival text-xl px-12 py-4 rounded-full transform hover:scale-105 transition-all duration-300 carnival-lights"
            >
              Start Playing Now!
            </Button>
            <Button 
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-purple-900 font-carnival text-xl px-12 py-4 rounded-full"
            >
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-purple-800/80 to-blue-800/80 border-yellow-400 border-2">
              <CardContent className="p-6 text-center">
                <Gamepad2 className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-carnival text-yellow-400 mb-2">5 Unique Games</h3>
                <p className="text-yellow-100 font-fredoka">From Spitball Slam to Llama Drama</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-800/80 to-blue-800/80 border-yellow-400 border-2">
              <CardContent className="p-6 text-center">
                <Coins className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-carnival text-yellow-400 mb-2">LLAMA Rewards</h3>
                <p className="text-yellow-100 font-fredoka">Earn and convert to tickets</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-800/80 to-blue-800/80 border-yellow-400 border-2">
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-carnival text-yellow-400 mb-2">Leaderboards</h3>
                <p className="text-yellow-100 font-fredoka">Compete for top positions</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-800/80 to-blue-800/80 border-yellow-400 border-2">
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-carnival text-yellow-400 mb-2">Daily Tasks</h3>
                <p className="text-yellow-100 font-fredoka">Complete challenges for rewards</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-red-900/20 to-orange-900/20">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-carnival text-center text-yellow-400 mb-16">
            Welcome to the Show!
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-carnival text-orange-400 mb-6">
                Meet Larry the Lucky Llama
              </h3>
              <p className="text-xl text-yellow-100 mb-6 font-fredoka">
                Larry isn't just our mascot - he's your carnival guide! Watch him dance, 
                react to your wins, and provide helpful tips throughout your gaming experience.
              </p>
              <ul className="space-y-4 text-yellow-100 font-fredoka text-lg">
                <li className="flex items-center">
                  <span className="text-2xl mr-3">🎪</span>
                  Interactive carnival atmosphere with Larry's personality
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">🎮</span>
                  Five unique games with different themes and rewards
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">🎁</span>
                  Daily tasks and surprise rewards system
                </li>
                <li className="flex items-center">
                  <span className="text-2xl mr-3">👥</span>
                  Referral system to invite friends to the party
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <div className="w-64 h-64 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-8xl animate-bounce-slow border-8 border-white shadow-2xl">
                🦙
              </div>
              <p className="text-2xl font-carnival text-yellow-400 mt-6">
                "Welcome to my carnival!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-carnival text-yellow-400 mb-8">
            Ready to Join Larry's Carnival?
          </h2>
          <p className="text-2xl text-yellow-100 mb-12 font-fredoka">
            Sign up now and start your lucky adventure!
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-carnival text-2xl px-16 py-6 rounded-full transform hover:scale-105 transition-all duration-300 carnival-lights"
          >
            Enter the Carnival! 🎪
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-amber-900/80 border-t-4 border-yellow-400">
        <div className="container mx-auto px-4 text-center">
          <p className="text-yellow-100 font-fredoka">
            © 2024 LuckyLlama Coin. Larry's Lucky Carnival - Where luck meets fun!
          </p>
        </div>
      </footer>
    </div>
  );
}
