import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Outfit, ParrotState } from '../types';

interface ParrotPetProps {
  state: ParrotState;
  activeOutfit: Outfit;
  goodwill: number;
  satiety: number;
  onPet: () => void;
  bubbleText?: string;
}

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export default function ParrotPet({
  state,
  activeOutfit,
  goodwill,
  satiety,
  onPet,
  bubbleText
}: ParrotPetProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [particleId, setParticleId] = useState(0);

  // Trigger particles when state changes
  useEffect(() => {
    if (state === 'petted') {
      // Spawn hearts
      const newParticles: Particle[] = Array.from({ length: 8 }).map((_, i) => ({
        id: particleId + i,
        emoji: '❤️',
        x: 40 + Math.random() * 20, // percentage near center
        y: 40 + Math.random() * 20,
        scale: 0.8 + Math.random() * 0.8,
        rotation: -30 + Math.random() * 60,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setParticleId((prev) => prev + 8);
    } else if (state === 'happy') {
      // Spawn star/sparkle particles
      const newParticles: Particle[] = Array.from({ length: 6 }).map((_, i) => ({
        id: particleId + i,
        emoji: '✨',
        x: 35 + Math.random() * 30,
        y: 35 + Math.random() * 30,
        scale: 0.8 + Math.random() * 0.7,
        rotation: Math.random() * 360,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setParticleId((prev) => prev + 6);
    } else if (state === 'singing') {
      // Spawn music notes
      const emojis = ['🎵', '🎶', '♩', '♪'];
      const newParticles: Particle[] = Array.from({ length: 4 }).map((_, i) => ({
        id: particleId + i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        x: 25 + Math.random() * 20, // closer to beak (left side)
        y: 30 + Math.random() * 20,
        scale: 0.9 + Math.random() * 0.6,
        rotation: -15 + Math.random() * 30,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setParticleId((prev) => prev + 4);
    } else if (state === 'eating') {
      // Spawn food crumbs
      const crumbs = ['🍪', '🍎', '🐛', '✨'];
      const newParticles: Particle[] = Array.from({ length: 5 }).map((_, i) => ({
        id: particleId + i,
        emoji: '✨',
        x: 35 + Math.random() * 20,
        y: 55 + Math.random() * 15,
        scale: 0.5 + Math.random() * 0.5,
        rotation: Math.random() * 360,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setParticleId((prev) => prev + 5);
    } else if (state === 'refuse') {
      // Spawn sweat/no emojis
      const newParticles: Particle[] = Array.from({ length: 4 }).map((_, i) => ({
        id: particleId + i,
        emoji: Math.random() > 0.5 ? '💦' : '❌',
        x: 45 + Math.random() * 20,
        y: 30 + Math.random() * 20,
        scale: 0.8 + Math.random() * 0.5,
        rotation: -20 + Math.random() * 40,
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setParticleId((prev) => prev + 4);
    }
  }, [state]);

  // Clean up old particles after 1.5 seconds
  useEffect(() => {
    if (particles.length > 0) {
      const timer = setTimeout(() => {
        setParticles((prev) => prev.slice(5));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [particles]);

  // Determine eye expression based on state
  const getEyes = () => {
    switch (state) {
      case 'petted':
      case 'happy':
        // Curved happy eyes ^ _ ^
        return (
          <>
            {/* Left Eye */}
            <path d="M 52,43 Q 57,37 62,43" stroke="#2D3748" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Right Eye */}
            <path d="M 78,43 Q 83,37 88,43" stroke="#2D3748" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        );
      case 'refuse':
        // X _ X eyes
        return (
          <>
            {/* Left Eye X */}
            <path d="M 53,40 L 61,48 M 61,40 L 53,48" stroke="#4A5568" strokeWidth="4" strokeLinecap="round" />
            {/* Right Eye X */}
            <path d="M 79,40 L 87,48 M 87,40 L 79,48" stroke="#4A5568" strokeWidth="4" strokeLinecap="round" />
          </>
        );
      case 'eating':
      case 'singing':
        // Winking or cute dot eyes with reflection
        return (
          <>
            {/* Left Eye */}
            <circle cx="57" cy="44" r="7" fill="#1A202C" />
            <circle cx="55" cy="41" r="2.5" fill="#FFFFFF" />
            {/* Right Eye - happy winking */}
            <path d="M 78,44 Q 83,39 88,44" stroke="#2D3748" strokeWidth="4" strokeLinecap="round" fill="none" />
          </>
        );
      default:
        // Idle large sparkling eyes
        return (
          <>
            {/* Left Eye */}
            <circle cx="57" cy="44" r="8" fill="#1A202C" />
            <circle cx="55" cy="41" r="3" fill="#FFFFFF" />
            <circle cx="59" cy="46" r="1" fill="#FFFFFF" />
            {/* Right Eye */}
            <circle cx="83" cy="44" r="8" fill="#1A202C" />
            <circle cx="81" cy="41" r="3" fill="#FFFFFF" />
            <circle cx="85" cy="46" r="1" fill="#FFFFFF" />
          </>
        );
    }
  };

  // Background decoration cards based on active outfit
  const getBackgroundClass = () => {
    switch (activeOutfit) {
      case 'beach':
        return 'bg-gradient-to-b from-sky-300 via-orange-100 to-amber-200 border-amber-300 shadow-amber-100';
      case 'classical':
        return 'bg-gradient-to-b from-stone-200 via-yellow-50 to-amber-100 border-stone-300 shadow-stone-100';
      case 'noble':
        return 'bg-gradient-to-b from-indigo-900 via-purple-950 to-slate-900 border-purple-500/30 shadow-indigo-900/10 dark';
      case 'sporty':
        return 'bg-gradient-to-b from-emerald-100 via-emerald-50 to-green-100 border-emerald-300 shadow-emerald-100';
      default:
        return 'bg-gradient-to-b from-blue-50 via-teal-50/20 to-teal-50 border-teal-100 shadow-teal-50';
    }
  };

  // Determine parrot main color scheme
  const bodyColor = '#10B981'; // Vivid green emerald
  const bellyColor = '#A7F3D0'; // Soft green mint
  const cheekColor = '#F43F5E'; // Rose pink
  const beakColor = '#FBBF24'; // Golden amber
  const crestColor = '#059669'; // Darker emerald for head crest

  return (
    <div className={`relative flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-500 overflow-hidden shadow-xl w-full h-[410px] ${getBackgroundClass()}`}>
      {/* Decorative scenery elements based on dress-up */}
      <AnimatePresence mode="wait">
        {activeOutfit === 'beach' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Coconut tree SVG silhouette */}
            <svg className="absolute bottom-0 right-0 w-32 h-32 text-amber-600/30" viewBox="0 0 100 100">
              <path d="M 90,100 Q 75,50 85,10 Q 70,30 60,10 Q 60,35 70,45 Q 50,45 40,30 Q 55,60 70,65 Q 65,85 75,100" fill="currentColor" />
            </svg>
            <div className="absolute top-4 right-6 text-3xl opacity-60">☀️</div>
            <div className="absolute bottom-2 left-4 text-xs font-medium text-amber-800/40">夏日椰林沙滩 🏖️</div>
          </motion.div>
        )}
        {activeOutfit === 'classical' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-4 left-4 text-2xl opacity-30">📜</div>
            <div className="absolute top-8 right-6 text-2xl opacity-30">🖋️</div>
            <div className="absolute bottom-2 left-4 text-xs font-medium text-stone-600/40">书香古典雅院 📚</div>
          </motion.div>
        )}
        {activeOutfit === 'noble' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-4 left-6 text-2xl opacity-40">✨</div>
            <div className="absolute top-12 right-6 text-2xl opacity-30">🏰</div>
            <div className="absolute bottom-2 left-4 text-xs font-medium text-purple-300/40">皇家璀璨殿堂 👑</div>
          </motion.div>
        )}
        {activeOutfit === 'sporty' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-4 right-6 text-2xl opacity-40">⚽</div>
            <div className="absolute bottom-2 left-4 text-xs font-medium text-green-700/40">活力青春赛场 🏆</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none z-30">
        <AnimatePresence>
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, scale: 0.2, x: `${p.x}%`, y: `${p.y}%` }}
              animate={{ 
                opacity: 0, 
                scale: p.scale, 
                y: `${p.y - 45}%`, 
                x: `${p.x + (Math.random() * 20 - 10)}%`,
                rotate: p.rotation
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="absolute text-2xl"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Speech bubble */}
      <div className="h-16 flex items-center justify-center w-full z-10 select-none">
        <AnimatePresence mode="wait">
          {bubbleText ? (
            <motion.div
              key={bubbleText}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -10 }}
              className={`px-4 py-2 rounded-2xl text-sm font-medium shadow-md border max-w-[90%] text-center relative ${
                activeOutfit === 'noble' 
                  ? 'bg-slate-800 text-purple-100 border-purple-500/30' 
                  : 'bg-white text-gray-800 border-teal-100'
              }`}
            >
              {bubbleText}
              {/* Bubble Arrow */}
              <div className={`absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 rotate-45 border-r border-b ${
                activeOutfit === 'noble' 
                  ? 'bg-slate-800 border-purple-500/30' 
                  : 'bg-white border-teal-100'
              }`} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              className={`text-xs text-center font-medium ${
                activeOutfit === 'noble' ? 'text-purple-300/60' : 'text-teal-600/60'
              }`}
            >
              点击“啾啾”摸摸它，增加好感度啾！👇
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive Parrot Body Container */}
      <motion.div
        id="parrot-character-interactive"
        onClick={onPet}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={
          state === 'happy'
            ? { y: [0, -25, 0, -15, 0], rotate: [0, 5, -5, 5, 0] }
            : state === 'refuse'
            ? { x: [0, -12, 12, -12, 12, -8, 8, 0] }
            : state === 'petted'
            ? { y: [0, 4, 0, 4, 0], rotate: [0, -3, 3, -3, 0], scale: 1.03 }
            : state === 'singing'
            ? { y: [0, -6, 0, -6, 0], rotate: [-2, 4, -4, 4, 0] }
            : state === 'eating'
            ? { rotate: [0, 10, -5, 10, -5, 0], y: [0, 8, 0, 8, 0] }
            : { y: [0, -4, 0] } // Idle breathing
        }
        transition={
          state === 'happy'
            ? { duration: 0.7 }
            : state === 'refuse'
            ? { duration: 0.5 }
            : state === 'petted'
            ? { duration: 1 }
            : state === 'singing'
            ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
            : state === 'eating'
            ? { duration: 0.8 }
            : { repeat: Infinity, duration: 4, ease: "easeInOut" }
        }
        className="w-48 h-48 cursor-pointer relative mt-2 z-20 select-none flex items-center justify-center"
      >
        <svg
          viewBox="0 0 140 140"
          className="w-full h-full drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 1. Tail Feathers */}
          <motion.path
            d="M 60,110 L 40,135 L 55,135 L 70,110 Z"
            fill={crestColor}
            animate={state === 'singing' ? { rotate: [-10, 15, -10] } : { rotate: [-2, 2, -2] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ transformOrigin: "70px 110px" }}
          />
          <motion.path
            d="M 80,110 L 100,135 L 85,135 L 70,110 Z"
            fill={crestColor}
            animate={state === 'singing' ? { rotate: [15, -10, 15] } : { rotate: [2, -2, 2] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            style={{ transformOrigin: "70px 110px" }}
          />

          {/* 2. Feet */}
          <circle cx="55" cy="115" r="5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="85" cy="115" r="5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2" />
          {/* Feet pads */}
          <path d="M 50,117 L 60,117 M 48,120 L 58,120" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <path d="M 80,117 L 90,117 M 82,120 L 92,120" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

          {/* 3. Left Wing (behind body or layered) */}
          <motion.path
            d="M 35,65 Q 10,60 25,90 Q 40,100 45,80 Z"
            fill={crestColor}
            animate={
              state === 'happy'
                ? { rotate: [0, -45, 0, -45, 0] }
                : state === 'singing'
                ? { rotate: [0, -15, 10, -15, 0] }
                : { rotate: [0, -3, 0] }
            }
            transition={state === 'happy' ? { duration: 0.7 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
            style={{ transformOrigin: "35px 65px" }}
          />

          {/* 4. Body Base */}
          <circle cx="70" cy="75" r="42" fill={bodyColor} />

          {/* 5. Head Crest (Hair Feathers) */}
          <motion.path
            d="M 70,35 Q 60,10 55,18 Q 65,15 70,35"
            fill={crestColor}
            animate={state === 'happy' ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          />
          <motion.path
            d="M 70,35 Q 75,5 82,14 Q 75,12 70,35"
            fill={crestColor}
            animate={state === 'happy' ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.5 }}
          />

          {/* 6. Soft Fluffy Belly */}
          <ellipse cx="70" cy="88" rx="28" ry="24" fill={bellyColor} />

          {/* 7. Eyes (Dynamic Expression) */}
          {getEyes()}

          {/* 8. Rosy Cheeks */}
          <motion.circle
            cx="44"
            cy="52"
            r="6"
            fill={cheekColor}
            opacity="0.6"
            animate={state === 'petted' || state === 'happy' ? { scale: 1.4 } : { scale: 1 }}
          />
          <motion.circle
            cx="96"
            cy="52"
            r="6"
            fill={cheekColor}
            opacity="0.6"
            animate={state === 'petted' || state === 'happy' ? { scale: 1.4 } : { scale: 1 }}
          />

          {/* 9. Beak (Speaks/Sings) */}
          <motion.path
            d="M 63,48 Q 70,42 77,48 Q 70,68 63,48"
            fill={beakColor}
            animate={
              state === 'singing'
                ? { scaleY: [1, 1.3, 0.8, 1.3, 1], y: [0, 2, -1, 2, 0] }
                : state === 'eating'
                ? { scaleY: [1, 0.6, 1.2, 0.6, 1], y: [0, 3, 0, 3, 0] }
                : { scaleY: 1 }
            }
            transition={
              state === 'singing'
                ? { repeat: Infinity, duration: 0.6 }
                : state === 'eating'
                ? { repeat: 4, duration: 0.2 }
                : {}
            }
            style={{ transformOrigin: "70px 48px" }}
          />

          {/* 10. Right Wing (in front of body) */}
          <motion.path
            d="M 105,65 Q 130,60 115,90 Q 95,100 95,80 Z"
            fill={crestColor}
            animate={
              state === 'happy'
                ? { rotate: [0, 45, 0, 45, 0] }
                : state === 'singing'
                ? { rotate: [0, 15, -10, 15, 0] }
                : { rotate: [0, 3, 0] }
            }
            transition={state === 'happy' ? { duration: 0.7 } : { repeat: Infinity, duration: 3, ease: "easeInOut" }}
            style={{ transformOrigin: "105px 65px" }}
          />

          {/* ===================== CLOTHING OVERLAYS ===================== */}

          {/* Beach Style elements */}
          {activeOutfit === 'beach' && (
            <g id="beach-outfit">
              {/* Cool Sunglasses */}
              <motion.g
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <rect x="42" y="38" width="22" height="15" rx="5" fill="#1A202C" />
                <rect x="76" y="38" width="22" height="15" rx="5" fill="#1A202C" />
                <line x1="64" y1="43" x2="76" y2="43" stroke="#1A202C" strokeWidth="4" />
                {/* Glare */}
                <path d="M 45,41 L 52,48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                <path d="M 79,41 L 86,48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              </motion.g>
              {/* Hawaii Shirt Overlay on belly */}
              <motion.path
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                d="M 45,80 Q 70,72 95,80 Q 92,102 70,105 Q 48,102 45,80 Z"
                fill="#FF6B6B"
              >
                {/* Yellow flowers on shirt */}
                <circle cx="58" cy="88" r="3" fill="#FFE066" />
                <circle cx="70" cy="95" r="3" fill="#FFE066" />
                <circle cx="82" cy="88" r="3" fill="#FFE066" />
                {/* Shirt Collar */}
                <path d="M 60,78 L 70,86 L 80,78" fill="none" stroke="#FFE066" strokeWidth="3" />
              </motion.path>
            </g>
          )}

          {/* Classical Elegant Style elements */}
          {activeOutfit === 'classical' && (
            <g id="classical-outfit">
              {/* Scholar Mortarboard Hat */}
              <motion.g
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <polygon points="35,16 70,5 105,16 70,27" fill="#1A202C" />
                <rect x="58" y="22" width="24" height="8" rx="2" fill="#1A202C" />
                {/* Tassel */}
                <path d="M 70,16 Q 95,18 98,32" fill="none" stroke="#E11D48" strokeWidth="2" />
                <circle cx="98" cy="33" r="3" fill="#E11D48" />
              </motion.g>
              {/* Neat Red Bowtie */}
              <motion.path
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                d="M 60,71 L 80,71 L 70,76 Z"
                fill="#DC2626"
              />
              <motion.path
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                d="M 60,81 L 80,81 L 70,76 Z"
                fill="#DC2626"
              />
              <circle cx="70" cy="76" r="4" fill="#B91C1C" />
            </g>
          )}

          {/* Luxury Noble Style elements */}
          {activeOutfit === 'noble' && (
            <g id="noble-outfit">
              {/* Shiny Gold Crown */}
              <motion.path
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                d="M 50,22 L 53,8 L 63,16 L 70,5 L 77,16 L 87,8 L 90,22 Z"
                fill="#FBBF24"
                stroke="#D97706"
                strokeWidth="1.5"
              />
              {/* Gems on Crown */}
              <circle cx="53" cy="8" r="2" fill="#EF4444" />
              <circle cx="70" cy="5" r="2" fill="#3B82F6" />
              <circle cx="87" cy="8" r="2" fill="#EF4444" />
              <rect x="50" y="19" width="40" height="3" fill="#D97706" />

              {/* Classy Monocle */}
              <motion.g
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <circle cx="83" cy="44" r="11" fill="none" stroke="#FBBF24" strokeWidth="2" />
                {/* Monocle chain */}
                <path d="M 94,44 Q 110,50 112,75" fill="none" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="3,2" />
              </motion.g>

              {/* Royal Purple Cape */}
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                d="M 45,76 Q 30,85 35,108 Q 70,115 105,108 Q 110,85 95,76 Q 70,82 45,76 Z"
                fill="#7C3AED"
                stroke="#FBBF24"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Youth Sporty Style elements */}
          {activeOutfit === 'sporty' && (
            <g id="sporty-outfit">
              {/* Sporty Headband */}
              <motion.path
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                d="M 45,30 Q 70,25 95,30 L 93,36 Q 70,31 47,36 Z"
                fill="#EF4444"
              />
              <motion.path
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                d="M 52,31 Q 70,27 88,31 L 87,34 Q 70,30 53,34 Z"
                fill="#FFFFFF"
              />

              {/* Athletic Sports Jersey (No. 6) */}
              <motion.path
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                d="M 44,79 L 96,79 L 92,105 L 48,105 Z"
                fill="#3B82F6"
              />
              {/* V neck line */}
              <path d="M 60,79 L 70,87 L 80,79" fill="none" stroke="#FFFFFF" strokeWidth="3" />
              {/* Number 6 */}
              <text x="63" y="99" fill="#FFFFFF" fontSize="16" fontFamily="sans-serif" fontWeight="bold">6</text>
            </g>
          )}
        </svg>

        {/* Floating sweat drop symbol for Refusal state */}
        <AnimatePresence>
          {state === 'refuse' && (
            <motion.div
              initial={{ opacity: 0, scale: 0, x: 50, y: -20 }}
              animate={{ opacity: 1, scale: 1, x: 60, y: -40 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute text-3xl font-bold select-none text-sky-400"
            >
              💦
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* CG Animation Overlay during active touch/petting */}
      <AnimatePresence>
        {state === 'petted' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-rose-400/20 flex flex-col items-center justify-center pointer-events-none z-40"
          >
            {/* Visual ripple effects and bursts of love */}
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute w-44 h-44 rounded-full border-4 border-rose-400/60"
            />
            <div className="text-sm font-semibold text-rose-600 bg-white/95 px-3 py-1.5 rounded-full shadow-lg border border-rose-200 flex items-center gap-1.5 mt-40">
              <span>💖 好感度增加！ 💖</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Board at the bottom */}
      <div className={`mt-auto w-full px-2 py-1.5 rounded-2xl grid grid-cols-2 gap-4 text-xs font-semibold shadow-inner ${
        activeOutfit === 'noble' 
          ? 'bg-slate-900/60 text-purple-200' 
          : 'bg-black/5 text-gray-700'
      }`}>
        <div className="flex items-center gap-2 justify-center">
          <span>💖 好感度 (Pet):</span>
          <span className="text-rose-500 font-bold text-sm">{goodwill}</span>
        </div>
        <div className="flex items-center gap-2 justify-center">
          <span>🍪 饱食度 (Full):</span>
          <span className="text-amber-500 font-bold text-sm">{satiety}/100</span>
        </div>
      </div>
    </div>
  );
}
