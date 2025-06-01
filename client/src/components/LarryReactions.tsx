import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

interface LarryReactionsProps {
  onActionTrigger: (action: string) => void;
}

export default function LarryReactions({ onActionTrigger }: LarryReactionsProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [lastBalance, setLastBalance] = useState<{ llama: string; tickets: number } | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Memoize the trigger callback to prevent infinite loops
  const triggerAction = useCallback((action: string) => {
    onActionTrigger(action);
  }, [onActionTrigger]);

  // Track balance changes to trigger reactions
  useEffect(() => {
    if (user && (user as User).llamaBalance !== undefined) {
      const currentBalance = {
        llama: (user as User).llamaBalance || "0",
        tickets: (user as User).ticketBalance || 0
      };

      // Only trigger reactions after initial load to prevent false positives
      if (hasInitialized && lastBalance) {
        const llamaDiff = parseFloat(currentBalance.llama) - parseFloat(lastBalance.llama);
        const ticketDiff = currentBalance.tickets - lastBalance.tickets;

        if (llamaDiff > 0) {
          triggerAction('win');
        } else if (llamaDiff < 0 || ticketDiff < 0) {
          triggerAction('loss');
        }
      }

      setLastBalance(currentBalance);
      if (!hasInitialized) {
        setHasInitialized(true);
      }
    }
  }, [(user as User)?.llamaBalance, (user as User)?.ticketBalance, hasInitialized, lastBalance?.llama, lastBalance?.tickets, triggerAction]);

  // React to page changes
  useEffect(() => {
    const reactions = {
      '/': () => triggerAction('idle'),
      '/games': () => triggerAction('idle'),
      '/wallet': () => triggerAction('idle'),
      '/leaderboard': () => triggerAction('idle'),
    };

    const reaction = reactions[location as keyof typeof reactions];
    if (reaction) {
      const timer = setTimeout(reaction, 1000);
      return () => clearTimeout(timer);
    }
  }, [location, triggerAction]);

  // Listen for global events that might trigger reactions
  useEffect(() => {
    const handleTaskComplete = () => {
      triggerAction('task');
    };

    const handleGameWin = () => {
      triggerAction('win');
    };

    const handleGameLoss = () => {
      triggerAction('loss');
    };

    // Listen for custom events
    window.addEventListener('taskComplete', handleTaskComplete);
    window.addEventListener('gameWin', handleGameWin);
    window.addEventListener('gameLoss', handleGameLoss);

    return () => {
      window.removeEventListener('taskComplete', handleTaskComplete);
      window.removeEventListener('gameWin', handleGameWin);
      window.removeEventListener('gameLoss', handleGameLoss);
    };
  }, [triggerAction]);

  // Larry's mood based on user's performance
  const getLarryMood = useCallback(() => {
    if (!user || !(user as User).llamaBalance) return 'neutral';
    
    const llamaBalance = parseFloat((user as User).llamaBalance || "0");
    const ticketBalance = (user as User).ticketBalance || 0;
    
    if (llamaBalance > 1000 || ticketBalance > 50) return 'happy';
    if (llamaBalance < 100 && ticketBalance < 10) return 'concerned';
    return 'neutral';
  }, [user]);

  // Trigger mood-based reactions (less frequently to avoid loops)
  useEffect(() => {
    if (!hasInitialized) return;
    
    const mood = getLarryMood();
    const moodMessages = {
      happy: ["You're doing amazing!", "Big wins today!", "Larry's impressed!"],
      concerned: ["Need some luck?", "Don't worry, keep trying!", "Every expert was once a beginner!"],
      neutral: ["Ready for adventure?", "Let's have some fun!", "What shall we do next?"]
    };

    const timer = setTimeout(() => {
      const messages = moodMessages[mood];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      // This would ideally trigger a reaction, but we'll keep it simple for now
    }, 10000); // Increased timeout to prevent frequent updates

    return () => clearTimeout(timer);
  }, [getLarryMood, hasInitialized]);

  // This component doesn't render anything visible, it just manages Larry's reactions
  return null;
}
