import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Games from "@/pages/Games";
import Wallet from "@/pages/Wallet";
import Leaderboard from "@/pages/Leaderboard";
import LoadingScreen from "@/components/LoadingScreen";
import FloatingLarry from "@/components/FloatingLarry";
import { useState, useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} />;
  }

  return (
    <>
      <Switch>
        {isLoading || !isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Dashboard} />
            <Route path="/games" component={Games} />
            <Route path="/wallet" component={Wallet} />
            <Route path="/leaderboard" component={Leaderboard} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
      {isAuthenticated && <FloatingLarry />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
