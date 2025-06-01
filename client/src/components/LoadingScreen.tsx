import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 15;
        if (newProgress >= 100) {
          setTimeout(() => {
            onComplete();
          }, 1000);
          return 100;
        }
        return newProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-500 to-yellow-500 z-50 flex flex-col items-center justify-center">
      {/* Larry the Lucky Llama */}
      <div className="w-48 h-48 rounded-full animate-bounce-slow mb-8 border-8 border-white shadow-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-8xl">
        🦙
      </div>
      
      <h1 className="text-6xl md:text-8xl font-carnival text-white mb-4 animate-pulse-fast text-center">
        LuckyLlama Coin
      </h1>
      <p className="text-2xl md:text-3xl text-yellow-100 mb-8 animate-wiggle font-fredoka text-center">
        Larry's setting up your luck...
      </p>
      
      {/* Loading Wheel */}
      <div className="relative w-64 h-64 mb-8">
        <div className="loading-wheel w-full h-full rounded-full animate-spin-slow border-8 border-white"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center border-4 border-yellow-400">
            <span className="text-red-500 font-carnival text-2xl">
              {Math.floor(progress)}%
            </span>
          </div>
        </div>
      </div>
      
      {/* Mute Toggle */}
      <Button
        onClick={toggleSound}
        className="bg-yellow-100 text-red-500 hover:bg-white transition-all duration-300 transform hover:scale-105 font-carnival text-lg px-6 py-3 rounded-full"
      >
        {soundEnabled ? (
          <>
            <Volume2 className="w-5 h-5 mr-2" />
            Carnival Music
          </>
        ) : (
          <>
            <VolumeX className="w-5 h-5 mr-2" />
            Music Off
          </>
        )}
      </Button>

      {/* Fun Loading Messages */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-white font-fredoka text-lg animate-pulse">
          {progress < 25 && "Larry is warming up his dancing shoes..."}
          {progress >= 25 && progress < 50 && "Setting up the carnival games..."}
          {progress >= 50 && progress < 75 && "Polishing the lucky coins..."}
          {progress >= 75 && progress < 100 && "Almost ready for the show!"}
          {progress >= 100 && "Welcome to the carnival! 🎪"}
        </p>
      </div>
    </div>
  );
}
