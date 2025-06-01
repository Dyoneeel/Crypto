import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Coins, Gamepad2, Users } from "lucide-react";
import type { User } from "@shared/schema";

type TopEarner = User & { totalEarnings: string };
type TopWinner = User & { totalWins: number };
type TopReferrer = User & { referralCount: number };

export default function Leaderboard() {
  const { data: topEarners } = useQuery<TopEarner[]>({
    queryKey: ['/api/leaderboard/earners'],
  });

  const { data: topWinners } = useQuery<TopWinner[]>({
    queryKey: ['/api/leaderboard/winners'],
  });

  const { data: topReferrers } = useQuery<TopReferrer[]>({
    queryKey: ['/api/leaderboard/referrers'],
  });

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `#${index + 1}`;
    }
  };

  const getDisplayName = (user: User) => {
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email?.split('@')[0] || 'Anonymous Llama';
  };

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h2 className="text-5xl md:text-7xl font-carnival text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
            ByteBoard Champions
          </h2>
          <p className="text-xl md:text-2xl text-yellow-100 mb-8 font-fredoka">
            See who's leading Larry's carnival!
          </p>
          
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-4">
              <Trophy className="w-16 h-16 text-white" />
            </div>
          </div>
        </section>

        <Tabs defaultValue="earners" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-amber-900/80 border-2 border-yellow-400 mb-8">
            <TabsTrigger 
              value="earners" 
              className="font-carnival text-lg data-[state=active]:bg-yellow-400 data-[state=active]:text-amber-900"
            >
              <Coins className="w-5 h-5 mr-2" />
              Top Earners
            </TabsTrigger>
            <TabsTrigger 
              value="winners" 
              className="font-carnival text-lg data-[state=active]:bg-yellow-400 data-[state=active]:text-amber-900"
            >
              <Gamepad2 className="w-5 h-5 mr-2" />
              Game Winners
            </TabsTrigger>
            <TabsTrigger 
              value="referrers" 
              className="font-carnival text-lg data-[state=active]:bg-yellow-400 data-[state=active]:text-amber-900"
            >
              <Users className="w-5 h-5 mr-2" />
              Top Referrers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earners">
            <Card className="bg-gradient-to-br from-red-800 to-orange-800 border-4 border-yellow-400">
              <CardHeader>
                <CardTitle className="text-3xl font-carnival text-yellow-400 text-center">
                  💰 Top LLAMA Earners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topEarners?.map((user, index) => (
                    <div 
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        index < 3 
                          ? 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-2 border-yellow-400' 
                          : 'bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl font-carnival">
                          {getMedalEmoji(index)}
                        </span>
                        <div>
                          <p className="font-carnival text-yellow-400 text-lg">
                            {getDisplayName(user)}
                          </p>
                          {index < 3 && (
                            <p className="text-yellow-200 text-sm font-fredoka">
                              🦙 Legendary Earner
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-carnival text-xl text-yellow-400">
                          {parseFloat(user.totalEarnings).toLocaleString()} LLAMA
                        </p>
                        <p className="text-yellow-200 text-sm font-fredoka">
                          Total Earned
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-center text-yellow-200 font-fredoka">Loading leaderboard...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="winners">
            <Card className="bg-gradient-to-br from-purple-800 to-blue-800 border-4 border-yellow-400">
              <CardHeader>
                <CardTitle className="text-3xl font-carnival text-yellow-400 text-center">
                  🎮 Top Game Winners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topWinners?.map((user, index) => (
                    <div 
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        index < 3 
                          ? 'bg-gradient-to-r from-purple-400/20 to-blue-400/20 border-2 border-yellow-400' 
                          : 'bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl font-carnival">
                          {getMedalEmoji(index)}
                        </span>
                        <div>
                          <p className="font-carnival text-yellow-400 text-lg">
                            {getDisplayName(user)}
                          </p>
                          {index < 3 && (
                            <p className="text-yellow-200 text-sm font-fredoka">
                              🎯 Game Master
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-carnival text-xl text-yellow-400">
                          {user.totalWins} Wins
                        </p>
                        <p className="text-yellow-200 text-sm font-fredoka">
                          Total Victories
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-center text-yellow-200 font-fredoka">Loading leaderboard...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="referrers">
            <Card className="bg-gradient-to-br from-teal-800 to-green-800 border-4 border-yellow-400">
              <CardHeader>
                <CardTitle className="text-3xl font-carnival text-yellow-400 text-center">
                  🤝 Top Referrers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topReferrers?.map((user, index) => (
                    <div 
                      key={user.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        index < 3 
                          ? 'bg-gradient-to-r from-teal-400/20 to-green-400/20 border-2 border-yellow-400' 
                          : 'bg-white/10'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-3xl font-carnival">
                          {getMedalEmoji(index)}
                        </span>
                        <div>
                          <p className="font-carnival text-yellow-400 text-lg">
                            {getDisplayName(user)}
                          </p>
                          {index < 3 && (
                            <p className="text-yellow-200 text-sm font-fredoka">
                              🎪 Party Host
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-carnival text-xl text-yellow-400">
                          {user.referralCount} Friends
                        </p>
                        <p className="text-yellow-200 text-sm font-fredoka">
                          Invited to Carnival
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-center text-yellow-200 font-fredoka">Loading leaderboard...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Achievement Gallery */}
        <section className="mt-12">
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 border-4 border-red-500">
            <CardHeader>
              <CardTitle className="text-3xl font-carnival text-white text-center">
                🏆 Achievement Gallery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-4xl mb-2">🦙</div>
                  <p className="font-carnival text-white">Llama Legend</p>
                  <p className="text-sm text-white/80 font-fredoka">Earn 10,000 LLAMA</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="font-carnival text-white">Spitball Pro</p>
                  <p className="text-sm text-white/80 font-fredoka">Win 50 Spitball games</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-4xl mb-2">🎪</div>
                  <p className="font-carnival text-white">Carnival King</p>
                  <p className="text-sm text-white/80 font-fredoka">Complete all daily tasks for 30 days</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-4xl mb-2">👥</div>
                  <p className="font-carnival text-white">Friend Maker</p>
                  <p className="text-sm text-white/80 font-fredoka">Refer 25 friends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
