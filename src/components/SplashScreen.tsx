import React, { useState, useEffect } from 'react';
import { Zap, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onEnter }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [quote] = useState("Productivity is never an accident. It is always the result of commitment to excellence.");

  useEffect(() => {
    // Auto-enter after 3 seconds if user doesn't click
    const timer = setTimeout(() => {
      handleEnter();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    setIsVisible(false);
    setTimeout(onEnter, 500);
  };

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-slate-900 animate-fadeOut pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-orange-500/20" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-orange-500/20 animate-pulse" />
      
      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6 animate-slideUp">
        {/* Logo */}
        <div className="mb-8 animate-bounce">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-400 to-orange-500 rounded-full mb-6 shadow-2xl shadow-cyan-500/50">
            <Zap className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-white to-orange-400 bg-clip-text text-transparent mb-6 animate-glow">
          ProductivityPulse
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-300 mb-8 font-light tracking-wide">
          AI-Powered Task & Time Management
        </p>

        {/* Quote */}
        <div className="mb-12 max-w-2xl mx-auto">
          <p className="text-lg text-slate-400 italic leading-relaxed border-l-4 border-cyan-400 pl-6">
            "{quote}"
          </p>
        </div>

        {/* Enter Button */}
        <button
          onClick={handleEnter}
          className="group relative inline-flex items-center px-12 py-4 bg-gradient-to-r from-cyan-500 to-orange-500 text-white font-bold text-xl rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/50 animate-pulse"
        >
          <span className="mr-3">Enter the Future</span>
          <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-2" />
          
          {/* Ripple Effect */}
          <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500" />
        </button>

        {/* Loading Indicator */}
        <div className="mt-8">
          <div className="w-64 h-1 bg-slate-700 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-orange-500 rounded-full animate-loadingBar" />
          </div>
          <p className="text-sm text-slate-500 mt-2">Loading your productivity workspace...</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;