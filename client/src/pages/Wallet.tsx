import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navigation from "@/components/Navigation";
import type { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, Ticket, RefreshCw, Plus, Minus, ArrowUpDown } from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function Wallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [convertAmount, setConvertAmount] = useState("");
  const [convertDirection, setConvertDirection] = useState<'llama_to_tickets' | 'tickets_to_llama'>('llama_to_tickets');

  const { data: transactions, refetch: refetchTransactions } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });

  const convertMutation = useMutation({
    mutationFn: async (data: { amount: number; direction: string }) => {
      return apiRequest('POST', '/api/convert', data);
    },
    onSuccess: (result) => {
      toast({
        title: "Conversion Successful!",
        description: `Converted ${convertAmount} ${convertDirection === 'llama_to_tickets' ? 'LLAMA to Tickets' : 'Tickets to LLAMA'}`,
      });
      setConvertAmount("");
      refetchTransactions();
      // Force refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Conversion Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConvert = () => {
    const amount = parseFloat(convertAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to convert",
        variant: "destructive",
      });
      return;
    }

    if (convertDirection === 'llama_to_tickets') {
      const userLlama = parseFloat((user as User)?.llamaBalance || "0");
      if (amount > userLlama) {
        toast({
          title: "Insufficient LLAMA",
          description: "You don't have enough LLAMA to convert",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (amount > ((user as User)?.ticketBalance || 0)) {
        toast({
          title: "Insufficient Tickets",
          description: "You don't have enough tickets to convert",
          variant: "destructive",
        });
        return;
      }
    }

    convertMutation.mutate({ amount, direction: convertDirection });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-5xl md:text-7xl font-carnival text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mb-4">
            Larry's Feed Bag
          </h2>
          <p className="text-xl md:text-2xl text-yellow-100 font-fredoka">
            Your digital treasure chest
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 wallet-grid">
          {/* Balance Cards */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
              <Card className="ticket-style border-4 border-red-500">
                <CardContent className="p-6 text-center">
                  <Coins className="w-16 h-16 text-red-500 mx-auto mb-4 coin-animation" />
                  <h4 className="text-3xl font-carnival text-red-500 mb-2">
                    {parseFloat((user as User).llamaBalance || "0").toLocaleString()}
                  </h4>
                  <p className="text-amber-800 font-semibold font-fredoka">LLAMA Coins</p>
                </CardContent>
              </Card>
              
              <Card className="ticket-style border-4 border-purple-500">
                <CardContent className="p-6 text-center">
                  <Ticket className="w-16 h-16 text-purple-500 mx-auto mb-4 animate-pulse-fast" />
                  <h4 className="text-3xl font-carnival text-purple-500 mb-2">
                    {((user as User).ticketBalance || 0).toLocaleString()}
                  </h4>
                  <p className="text-amber-800 font-semibold font-fredoka">Game Tickets</p>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Section */}
            <Card className="bg-gradient-to-br from-teal-800 to-blue-800 border-4 border-yellow-400">
              <CardHeader>
                <CardTitle className="text-2xl font-carnival text-yellow-400 text-center">
                  <ArrowUpDown className="w-8 h-8 inline-block mr-2" />
                  Currency Converter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-yellow-100 font-fredoka text-lg mb-4">
                    1 LLAMA = 1 Ticket (1:1 Exchange Rate)
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label htmlFor="amount" className="text-yellow-100 font-fredoka">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={convertAmount}
                      onChange={(e) => setConvertAmount(e.target.value)}
                      className="bg-white/90 border-yellow-400"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-yellow-100 font-fredoka">Direction</Label>
                    <div className="flex bg-white/90 rounded border-yellow-400 border">
                      <Button
                        variant={convertDirection === 'llama_to_tickets' ? 'default' : 'ghost'}
                        onClick={() => setConvertDirection('llama_to_tickets')}
                        className="flex-1 rounded-r-none"
                      >
                        LLAMA → Tickets
                      </Button>
                      <Button
                        variant={convertDirection === 'tickets_to_llama' ? 'default' : 'ghost'}
                        onClick={() => setConvertDirection('tickets_to_llama')}
                        className="flex-1 rounded-l-none"
                      >
                        Tickets → LLAMA
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleConvert}
                    disabled={convertMutation.isPending}
                    className="bg-green-500 hover:bg-green-600 text-white font-carnival"
                  >
                    {convertMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <ArrowUpDown className="w-4 h-4 mr-2" />
                    )}
                    Convert Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Button 
                className="bg-green-500 hover:bg-green-600 text-white py-6 px-8 rounded-xl font-carnival text-xl transform hover:scale-105 transition-all duration-300"
                onClick={() => toast({ title: "Deposit Feature", description: "Coming soon!" })}
              >
                <Plus className="w-6 h-6 mr-3" />
                Deposit LLAMA
              </Button>
              
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white py-6 px-8 rounded-xl font-carnival text-xl transform hover:scale-105 transition-all duration-300"
                onClick={() => toast({ title: "Withdraw Feature", description: "Coming soon!" })}
              >
                <Minus className="w-6 h-6 mr-3" />
                Withdraw LLAMA
              </Button>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <Card className="ticket-style border-4 border-amber-800">
              <CardHeader>
                <CardTitle className="text-xl font-carnival text-amber-800">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions?.map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex justify-between items-center py-2 border-b border-amber-800/20"
                    >
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">
                          {transaction.type === 'game_win' && '🎮'}
                          {transaction.type === 'game_loss' && '🎯'}
                          {transaction.type === 'task_reward' && '🎁'}
                          {transaction.type === 'convert' && '🔄'}
                          {transaction.type === 'deposit' && '💰'}
                          {transaction.type === 'withdraw' && '💸'}
                        </div>
                        <div>
                          <p className="font-semibold text-amber-800 text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-amber-600">
                            {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      <span className={`font-carnival text-sm ${
                        parseFloat(transaction.amount) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(transaction.amount) >= 0 ? '+' : ''}{parseFloat(transaction.amount)} {transaction.currency}
                      </span>
                    </div>
                  )) || (
                    <p className="text-amber-600 text-center font-fredoka">No transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
