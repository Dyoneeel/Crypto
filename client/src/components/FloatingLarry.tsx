import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import LarryReactions from "./LarryReactions";

export default function FloatingLarry() {
  const { user } = useAuth();
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [currentMessage, setCurrentMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isFollowingCursor, setIsFollowingCursor] = useState(false);
  const larryRef = useRef<HTMLDivElement>(null);
  const messageTimeoutRef = useRef<NodeJS.Timeout>();

  const messages = [
    "Keep playing! 🎮",
    "You're doing great! 🌟",
    "Feeling lucky today? 🍀",
    "Try the slot machine! 🎰",
    "Don't forget your daily tasks! ✅",
    "Win big at the carnival! 🎪",
    "Larry believes in you! 💪",
    "Spitball time! 🎯",
    "Invite your friends! 👫",
    "Check your wallet! 💰"
  ];

  // Show random messages periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      showLarryMessage(randomMessage);
    }, 8000 + Math.random() * 7000); // Random interval between 8-15 seconds

    return () => clearInterval(interval);
  }, []);

  // Follow cursor functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isFollowingCursor) {
        const offset = 80; // Keep Larry a bit away from cursor
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 80, e.clientX + offset)),
          y: Math.max(0, Math.min(window.innerHeight - 80, e.clientY + offset)),
        });
      }
    };

    if (isFollowingCursor) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isFollowingCursor]);

  // Auto-move Larry around occasionally when not following cursor
  useEffect(() => {
    if (!isFollowingCursor) {
      const moveInterval = setInterval(() => {
        const newX = Math.random() * (window.innerWidth - 100);
        const newY = Math.random() * (window.innerHeight - 200) + 100; // Keep away from top nav
        
        setPosition({ x: newX, y: newY });
      }, 15000); // Move every 15 seconds

      return () => clearInterval(moveInterval);
    }
  }, [isFollowingCursor]);

  const showLarryMessage = (message: string) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    
    setCurrentMessage(message);
    setShowMessage(true);
    
    messageTimeoutRef.current = setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const handleLarryClick = () => {
    setIsFollowingCursor(!isFollowingCursor);
    
    if (!isFollowingCursor) {
      showLarryMessage("I'll follow you now! 🦙");
    } else {
      showLarryMessage("I'll wander around! 🚶‍♂️");
    }
  };

  const handleGameAction = (action: string) => {
    const actionMessages = {
      win: ["Amazing win! 🎉", "You're on fire! 🔥", "Larry's proud! 🦙", "Keep it up! 💪"],
      loss: ["Don't give up! 💪", "Try again! 🎲", "Luck comes and goes! 🍀", "Next one's yours! 🎯"],
      task: ["Task complete! ✅", "Great job! 🌟", "You're awesome! 🎪", "Larry loves it! ❤️"],
      idle: ["What's next? 🤔", "Ready for fun? 🎮", "Let's play! 🎪", "Adventure awaits! ⭐"]
    };

    const messages = actionMessages[action as keyof typeof actionMessages] || actionMessages.idle;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    showLarryMessage(randomMessage);
  };

  if (!user) return null;

  return (
    <>
      <div
        ref={larryRef}
        className="fixed z-30 pointer-events-auto cursor-pointer transition-all duration-1000 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%)`
        }}
        onClick={handleLarryClick}
      >
        {/* Larry's Speech Bubble */}
        <div 
          className={`absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-lg px-3 py-2 text-sm font-fredoka text-amber-900 whitespace-nowrap shadow-lg border-2 border-yellow-400 transition-all duration-300 ${
            showMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
          }`}
        >
          {currentMessage}
          {/* Speech bubble tail */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-yellow-400"></div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 translate-y-[-2px] w-0 h-0 border-l-3 border-r-3 border-t-3 border-l-transparent border-r-transparent border-t-white"></div>
        </div>

        {/* Larry Character */}
        <div className={`w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-3xl border-2 border-white shadow-lg transition-all duration-300 ${
          isFollowingCursor ? 'animate-bounce-slow' : 'animate-float'
        } hover:scale-110 hover:carnival-lights`}>
          🦙
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-2 -left-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-2 w-1 h-1 bg-orange-400 rounded-full animate-ping delay-300"></div>
          <div className="absolute -bottom-2 -left-1 w-1 h-1 bg-red-400 rounded-full animate-ping delay-700"></div>
        </div>

        {/* Status indicator */}
        <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse flex items-center justify-center">
          <div className="w-1 h-1 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Larry Reactions Component */}
      <LarryReactions onActionTrigger={handleGameAction} />
    </>
  );
}
