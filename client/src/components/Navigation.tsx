import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Volume2, VolumeX } from "lucide-react";

export default function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const navItems = [
    { href: "/", label: "Carnival", icon: "🎪" },
    { href: "/games", label: "Games", icon: "🎮" },
    { href: "/wallet", label: "Feed Bag", icon: "💰" },
    { href: "/leaderboard", label: "ByteBoard", icon: "🏆" },
  ];

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const NavContent = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={location === item.href ? "default" : "ghost"}
            className={`font-fredoka font-semibold transition-colors duration-300 ${
              location === item.href
                ? "bg-yellow-400 text-amber-900 hover:bg-yellow-300"
                : "text-yellow-100 hover:text-yellow-400 hover:bg-amber-800/50"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </Button>
        </Link>
      ))}
    </>
  );

  return (
    <nav className="bg-amber-900/90 backdrop-blur-sm border-b-4 border-yellow-400 sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-4 cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl animate-float border-2 border-white">
                🦙
              </div>
              <h1 className="text-2xl md:text-3xl font-carnival text-yellow-400">
                LuckyLlama Coin
              </h1>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavContent />
          </div>
          
          {/* User Info & Actions */}
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            {user && (
              <div className="hidden sm:flex items-center space-x-3">
                <div className="ticket-style px-3 py-1 rounded-lg border border-red-500">
                  <span className="text-red-600 font-carnival text-sm">
                    {parseFloat(user.llamaBalance || "0").toLocaleString()} LLAMA
                  </span>
                </div>
                <div className="ticket-style px-3 py-1 rounded-lg border border-purple-500">
                  <span className="text-purple-600 font-carnival text-sm">
                    {(user.ticketBalance || 0).toLocaleString()} Tickets
                  </span>
                </div>
              </div>
            )}

            {/* Sound Toggle */}
            <Button
              onClick={toggleSound}
              size="icon"
              variant="outline"
              className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-amber-900"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>

            {/* User Avatar & Logout */}
            {user && (
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-yellow-400 overflow-hidden bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold">
                      {(user.firstName?.[0] || user.email?.[0] || 'L').toUpperCase()}
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => window.location.href = '/api/logout'}
                  variant="outline"
                  className="hidden sm:flex border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-amber-900 font-fredoka"
                >
                  Logout
                </Button>
              </div>
            )}
            
            {/* Mobile Menu Toggle */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-amber-900"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="bg-gradient-to-br from-amber-900 to-red-900 border-yellow-400"
              >
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl animate-float border-2 border-white mx-auto mb-2">
                      🦙
                    </div>
                    <h2 className="text-xl font-carnival text-yellow-400">Larry's Menu</h2>
                  </div>
                  
                  {/* Mobile Balance Display */}
                  {user && (
                    <div className="space-y-2 mb-4">
                      <div className="ticket-style px-3 py-2 rounded-lg text-center">
                        <span className="text-red-600 font-carnival">
                          {parseFloat(user.llamaBalance || "0").toLocaleString()} LLAMA
                        </span>
                      </div>
                      <div className="ticket-style px-3 py-2 rounded-lg text-center">
                        <span className="text-purple-600 font-carnival">
                          {(user.ticketBalance || 0).toLocaleString()} Tickets
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <NavContent />
                  
                  {user && (
                    <Button
                      onClick={() => window.location.href = '/api/logout'}
                      variant="outline"
                      className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-amber-900 font-fredoka"
                    >
                      Logout
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
