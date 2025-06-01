import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import TaskBoard from "@/components/TaskBoard";
import GameBooths from "@/components/GameBooths";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Search } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-6xl animate-bounce-slow mb-4">
            🦙
          </div>
          <p className="text-2xl font-carnival text-yellow-400">Larry's preparing your carnival...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleSurpriseReward = () => {
    const rewards = ['50 LLAMA', '25 Tickets', '100 LLAMA', '10 Tickets'];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    
    toast({
      title: "🎁 Llama Delivery!",
      description: `Larry brought you ${randomReward}!`,
    });
  };

  const handleEasterEgg = () => {
    toast({
      title: "🎩 Find Larry's Hat Quest Started!",
      description: "Look around the carnival for clues...",
    });
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <section className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl font-carnival text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4 animate-pulse-fast">
            Larry's Lucky Carnival
          </h2>
          <p className="text-xl md:text-2xl text-yellow-100 mb-8 font-fredoka">
            Step right up and test your luck with Larry!
          </p>
          
          {/* Carnival grounds panoramic view */}
          <div className="relative h-64 rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-purple-800 to-blue-800 border-4 border-yellow-400">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-4xl animate-bounce-slow border-4 border-white mb-4">
                  🦙
                </div>
                <p className="text-white font-carnival text-xl">Welcome to the carnival grounds!</p>
              </div>
            </div>
            <div className="absolute bottom-4 right-4 text-white">
              <p className="font-carnival text-lg animate-wiggle">🎪 The show must go on!</p>
            </div>
          </div>
        </section>

        {/* Task Board */}
        <TaskBoard />

        {/* Game Booths */}
        <GameBooths />

        {/* Viral Features */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-8 border-4 border-red-500">
            <h3 className="text-4xl font-carnival text-white text-center mb-8">Special Events</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-red-500">
                <CardContent className="p-6 text-center">
                  <Gift className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce-slow" />
                  <h4 className="text-2xl font-carnival text-amber-900 mb-3">Llama Delivery!</h4>
                  <p className="text-amber-800 mb-4 font-fredoka">Random surprise rewards every hour</p>
                  <Button 
                    onClick={handleSurpriseReward}
                    className="bg-red-500 hover:bg-orange-500 text-white font-carnival"
                  >
                    Claim Surprise!
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-500">
                <CardContent className="p-6 text-center">
                  <Search className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-wiggle" />
                  <h4 className="text-2xl font-carnival text-amber-900 mb-3">Find Larry's Hat</h4>
                  <p className="text-amber-800 mb-4 font-fredoka">Hidden Easter egg mini-quest</p>
                  <Button 
                    onClick={handleEasterEgg}
                    className="bg-purple-500 hover:bg-teal-500 text-white font-carnival"
                  >
                    Start Quest
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
