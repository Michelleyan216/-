import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  BookOpen, 
  Volume2, 
  Music, 
  MessageCircle, 
  RotateCcw, 
  Send, 
  HelpCircle,
  Apple,
  Search,
  BookOpenCheck,
  Heart,
  UserCheck,
  Flame,
  Globe,
  Compass
} from 'lucide-react';
import ParrotPet from './components/ParrotPet';
import { Outfit, ParrotState, FoodType, Message } from './types';
import { PRESET_TRACKS, playTrack, stopAudio, generateTrackFromTitle, Track } from './utils/audio';

// Feed Food definition
interface FoodItem {
  id: FoodType;
  name: string;
  emoji: string;
  color: string;
  hoverColor: string;
}

const FOODS: FoodItem[] = [
  { id: 'apple', name: '美味苹果', emoji: '🍎', color: 'bg-rose-500 hover:bg-rose-600', hoverColor: 'hover:border-rose-400' },
  { id: 'worm', name: '营养小虫', emoji: '🐛', color: 'bg-emerald-500 hover:bg-emerald-600', hoverColor: 'hover:border-emerald-400' },
  { id: 'pepper', name: '刺激辣椒', emoji: '🌶️', color: 'bg-amber-500 hover:bg-amber-600', hoverColor: 'hover:border-amber-400' },
  { id: 'chocolate', name: '香甜巧克力', emoji: '🍫', color: 'bg-amber-800 hover:bg-amber-900', hoverColor: 'hover:border-amber-700' },
];

export default function App() {
  // Persistence state
  const [goodwill, setGoodwill] = useState<number>(() => {
    const saved = localStorage.getItem('jiujiu_goodwill');
    return saved ? parseInt(saved, 10) : 20;
  });
  
  const [satiety, setSatiety] = useState<number>(() => {
    const saved = localStorage.getItem('jiujiu_satiety');
    return saved ? parseInt(saved, 10) : 50;
  });

  const [activeOutfit, setActiveOutfit] = useState<Outfit>(() => {
    const saved = localStorage.getItem('jiujiu_outfit');
    return (saved as Outfit) || 'none';
  });

  // UI state
  const [parrotState, setParrotState] = useState<ParrotState>('idle');
  const [bubbleText, setBubbleText] = useState<string>('小主人，今天想和啾啾玩什么呀？嘎嘎！');
  const [activeTab, setActiveTab] = useState<'poetry' | 'word' | 'music' | 'chat'>('chat');

  // Interactive functions state
  // 1. Poetry State
  const [poetryQuery, setPoetryQuery] = useState('');
  const [poetryLoading, setPoetryLoading] = useState(false);
  const [poetryData, setPoetryData] = useState<{
    title: string;
    author: string;
    paragraphs: string[];
    explanation: string;
    jiujiuFeedback: string;
  } | null>({
    title: "静夜思",
    author: "[唐] 李白",
    paragraphs: ["床前明月光，", "疑是地上霜。", "举头望明月，", "低头思故乡。"],
    explanation: "《静夜思》写于李白在扬州旅舍独处的一个月夜。诗人抬头看着如白霜铺地的月光，想起了自己远方的家乡。这首诗用词极为简单，但表达的思乡情感真挚深沉，成为了流传千古的传世佳作啾！",
    jiujiuFeedback: "李白伯伯写的诗太美啦！啾啾每到中秋节看到大月亮，也特别想念大森林里的家人们嘎！小主人学习真自觉，啾啾给你拍翅膀！✨"
  });

  // 2. Word Helper State
  const [wordQuery, setWordQuery] = useState('');
  const [wordLoading, setWordLoading] = useState(false);
  const [wordData, setWordData] = useState<{
    word: string;
    ipa: string;
    meaning: string;
    exampleEn: string;
    exampleCn: string;
    jiujiuFeedback: string;
  } | null>({
    word: "Parrot",
    ipa: "/ˈpærət/",
    meaning: "n. 鹦鹉",
    exampleEn: "JiuJiu is a very smart and cute parrot.",
    exampleCn: "啾啾是一只非常聪明和可爱的小鹦鹉。",
    jiujiuFeedback: "‘Parrot’就是指像我一样的大帅鸟啾！发音的时候要注意嘴唇圆圆的，舌头往后缩，‘啪-热特’，嘎嘎！你读得真好听！"
  });

  // 3. Music State
  const [customMusicTitle, setCustomMusicTitle] = useState('');
  const [playingTrackInfo, setPlayingTrackInfo] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  // 4. Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'jiujiu',
      text: '小主人你好呀！我是你的好伙伴“啾啾”，一只最懂你、最爱陪伴你的小鹦鹉！嘎嘎！我们可以一起背古诗、学英语单词，还可以一起讨论世界杯或者分享日常趣事啾！快喂我一个好吃的吧！拍拍翅膀！',
      timestamp: Date.now()
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save progress
  useEffect(() => {
    localStorage.setItem('jiujiu_goodwill', goodwill.toString());
  }, [goodwill]);

  useEffect(() => {
    localStorage.setItem('jiujiu_satiety', satiety.toString());
  }, [satiety]);

  useEffect(() => {
    localStorage.setItem('jiujiu_outfit', activeOutfit);
  }, [activeOutfit]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatLoading]);

  // Handle auto resetting state to idle after animations
  useEffect(() => {
    if (parrotState !== 'idle' && parrotState !== 'singing') {
      const timer = setTimeout(() => {
        setParrotState('idle');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [parrotState]);

  // 1. Text-To-Speech function
  const speakText = (text: string, lang = 'zh-CN') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean descriptive actions like (歪头) from TTS for natural speech
      const cleanText = text.replace(/\([^)]+\)/g, '').replace(/（[^）]+）/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang;
      utterance.rate = 1.05;
      utterance.pitch = 1.25; // slightly higher pitch for parrot
      window.speechSynthesis.speak(utterance);
    }
  };

  // 2. Click/Pet Parrot
  const handlePetParrot = () => {
    setParrotState('petted');
    const petLines = [
      '好舒服啾~ (眯着眼睛歪头) 小主人摸得太温柔啦！',
      '摸摸翅膀，考上名校！(拍翅膀嘎嘎) 啾啾今天更有精神啦！',
      '贴贴贴贴！(用小脑袋蹭你) 啾啾最喜欢贴心的小主人了嘎！',
      '痒痒的啾~ 咯咯咯，小主人，等会吃完苹果我们再背诗好不好？'
    ];
    const speech = petLines[Math.floor(Math.random() * petLines.length)];
    setBubbleText(speech);
    setGoodwill(prev => prev + 1);
    speakText(speech);
  };

  // 3. Feeding interaction
  const handleFeedFood = (foodId: FoodType) => {
    if (foodId === 'apple' || foodId === 'worm') {
      setParrotState('eating');
      const foodName = foodId === 'apple' ? '香香红苹果 🍎' : '肥肥大青虫 🐛';
      
      setTimeout(() => {
        setParrotState('happy');
        const feedback = foodId === 'apple' 
          ? '啾啾！甜甜的苹果太好吃啦！嘎嘎！谢谢小主人！好感度蹭蹭往上涨！'
          : '哇塞！是多汁饱满的虫虫！嘎嘎！味道美极了，啾啾拍翅膀感谢你！';
        
        setBubbleText(feedback);
        speakText(feedback);
        setSatiety(prev => Math.min(100, prev + 20));
        setGoodwill(prev => prev + 10);
      }, 1500);

      setBubbleText(`(砸吧嘴) 唔唔唔... 啾啾正在开心地嚼着小主人喂的${foodName}...`);
    } else {
      setParrotState('refuse');
      let explanation = '';
      if (foodId === 'chocolate') {
        explanation = '嘎嘎！危险危险！绝对不能给鸟吃巧克力！因为巧克力里的可可碱对鹦鹉有剧毒，会导致我们心脏衰竭的啾！快拿走！(拍翅膀惊恐)';
      } else {
        explanation = '哎呀呀，红辣椒太红太刺激喉咙啦！啾啾在家里娇生惯养，怕辣怕辣！(歪头吐舌头) 啾啾拒绝吃辣椒嘎！';
      }
      setBubbleText(explanation);
      speakText(explanation);
    }
  };

  // 4. Poetry Submission
  const handleFetchPoetry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poetryQuery.trim()) return;
    setPoetryLoading(true);
    setParrotState('eating'); // listening/processing movement

    try {
      const res = await fetch('/api/poetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: poetryQuery })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setPoetryData(data);
      setParrotState('happy');
      setBubbleText(`背得好不好？嘎嘎！我最喜欢《${data.title}》了啾！`);
      speakText(`我来为小主人背诵《${data.title}》：${data.paragraphs.join('。')}`);
    } catch (err: any) {
      const errorMsg = err.message || '啾？没听说过这首诗，小主人能换一首吗？';
      setBubbleText(errorMsg);
      speakText(errorMsg);
    } finally {
      setPoetryLoading(false);
    }
  };

  // 5. Word Submission
  const handleFetchWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordQuery.trim()) return;
    setWordLoading(true);
    setParrotState('eating');

    try {
      const res = await fetch('/api/word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: wordQuery })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setWordData(data);
      setParrotState('happy');
      setBubbleText(`单词“${data.word}”学习完毕！跟我读：${data.word}，嘎嘎！`);
      speakText(`跟我读：${data.word}。意思是：${data.meaning}`);
    } catch (err: any) {
      const errorMsg = err.message || '哎呀，啾啾没查到这个单词，小主人是不是拼错了嘎？';
      setBubbleText(errorMsg);
      speakText(errorMsg);
    } finally {
      setWordLoading(false);
    }
  };

  // 6. Play Music
  const handlePlayMusic = (track: Track) => {
    setPlayingTrackInfo(track);
    setIsPlaying(true);
    setParrotState('singing');
    setBubbleText(`(张嘴唱歌) 啦啦啦~ 啾啾正在快乐地为你演奏《${track.title}》！快和我一起摇摆！嘎嘎！`);

    playTrack(
      track,
      (remain) => {
        setSecondsRemaining(remain);
      },
      () => {
        setIsPlaying(false);
        setParrotState('idle');
        setBubbleText(`《${track.title}》播放完毕啦！啾啾唱得好听吗？拍翅膀！`);
      }
    );
  };

  const handleStopMusic = () => {
    stopAudio();
    setIsPlaying(false);
    setParrotState('idle');
    setBubbleText("音乐停了啾，我们来做点别的学习活动吧！");
  };

  const handleCustomMusicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMusicTitle.trim()) return;
    const customTrack = generateTrackFromTitle(customMusicTitle);
    handlePlayMusic(customTrack);
  };

  // 7. Chat Send
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsgText = chatInput.trim();
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userMsgText,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);
    setParrotState('singing'); // processing, bobbing head

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsgText,
          history: chatHistory.slice(-10) // Send recent context for better conversational depth
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const jiujiuMsg: Message = {
        id: `jiujiu-${Date.now()}`,
        sender: 'jiujiu',
        text: data.text,
        timestamp: Date.now(),
        metadata: data.groundingUrls ? { groundingUrls: data.groundingUrls } : undefined
      };

      setChatHistory(prev => [...prev, jiujiuMsg]);
      setParrotState('happy');
      setBubbleText(data.text.length > 50 ? data.text.substring(0, 47) + "..." : data.text);
      speakText(data.text);
    } catch (err: any) {
      const errorMsg = err.message || '啾？网络开小差啦，啾啾现在有点头晕，重新对我说一句好吗？';
      const errorMsgObj: Message = {
        id: `jiujiu-err-${Date.now()}`,
        sender: 'jiujiu',
        text: errorMsg,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorMsgObj]);
      setParrotState('refuse');
      setBubbleText(errorMsg);
      speakText(errorMsg);
    } finally {
      setChatLoading(false);
    }
  };

  // Preset quick chat prompts
  const CHAT_PROMPTS = [
    "2026年美加墨世界杯什么时候开打？",
    "给我讲一个关于小鹦鹉的搞笑笑话！",
    "帮我写一个六年级的暑期复习计划！",
    "鹦鹉真的能听懂人说话吗？"
  ];

  const triggerPresetPrompt = (prompt: string) => {
    setChatInput(prompt);
  };

  // Quick reset stats
  const resetPetStats = () => {
    setGoodwill(20);
    setSatiety(50);
    setBubbleText("哎呀，数据清除啦！从头和啾啾交朋友吧！嘎嘎！");
    speakText("从头和啾啾交朋友吧！");
  };

  return (
    <div className="w-full min-h-screen relative font-sans flex items-center justify-center p-4 overflow-x-hidden md:p-8 selection:bg-orange-300 selection:text-orange-900"
         style={{ background: 'radial-gradient(circle at 0% 0%, #FFF3E0 0%, #FFE0B2 50%, #FFCC80 100%)' }}>
      
      {/* Absolute Frosted glass backplate container to constraint app width and layout */}
      <div className="w-full max-w-6xl backdrop-blur-xl bg-white/40 border border-white/60 rounded-[40px] shadow-2xl p-6 md:p-8 flex flex-col gap-6 relative z-10">
        
        {/* ===================== HEADER BAR ===================== */}
        <div className="backdrop-blur-md bg-white/50 border border-white/50 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center text-white text-2xl animate-bounce shadow-md">
              🦜
            </div>
            <div className="text-center sm:text-left">
              <h1 className="font-extrabold text-orange-950 text-xl tracking-wide flex items-center justify-center sm:justify-start gap-2">
                智能萌宠鹦鹉 <span>“啾啾”</span>
                <span className="text-xs bg-orange-500 text-white px-2.5 py-0.5 rounded-full font-bold shadow-inner">VI级小主人专属</span>
              </h1>
              <p className="text-orange-800/80 text-xs font-semibold mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                <span>⚡ 心情状态：</span>
                <span className="text-orange-600 font-bold">
                  {isPlaying ? '嗨唱中 🎵' : parrotState === 'happy' ? '超级开心！✨' : parrotState === 'eating' ? '美味享用中 🍪' : parrotState === 'refuse' ? '委屈拒绝 💦' : '活蹦乱跳 🌟'}
                </span>
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="flex flex-col items-end">
              <span className="text-[10px] tracking-wider text-orange-900/80 font-bold flex items-center gap-1">
                🍪 饱食度 <span className="text-orange-600">({satiety}/100)</span>
              </span>
              <div className="w-32 h-3 bg-orange-200/50 rounded-full mt-1 overflow-hidden border border-white/40 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${satiety}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${satiety < 30 ? 'bg-rose-500' : 'bg-orange-500'}`}
                />
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] tracking-wider text-pink-900/80 font-bold flex items-center gap-1">
                💖 亲密好感度 <span className="text-pink-600">({goodwill})</span>
              </span>
              <div className="w-32 h-3 bg-pink-200/50 rounded-full mt-1 overflow-hidden border border-white/40 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, goodwill)}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-pink-500 rounded-full"
                />
              </div>
            </div>

            <button 
              onClick={resetPetStats}
              title="重置鹦鹉数据"
              className="p-2 rounded-xl bg-orange-100/60 hover:bg-orange-200 border border-orange-200 text-orange-950/80 hover:text-orange-900 transition-colors shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ===================== MAIN GRID LAYOUT ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDEBAR: PET PANEL (Parrot model, dressing, feeding) */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            
            {/* Interactive Bird Screen */}
            <div className="relative">
              <ParrotPet 
                state={parrotState}
                activeOutfit={activeOutfit}
                goodwill={goodwill}
                satiety={satiety}
                onPet={handlePetParrot}
                bubbleText={bubbleText}
              />
            </div>

            {/* Feeding Box */}
            <div className="backdrop-blur-md bg-white/40 border border-white/50 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-orange-950 flex items-center gap-1.5">
                  <span className="text-lg">🍎</span> 投喂美食给啾啾
                </h3>
                <span className="text-[10px] text-orange-800/60 font-semibold">投喂健康食物可提高饱食度与亲密度！</span>
              </div>
              
              <div className="grid grid-cols-4 gap-2.5">
                {FOODS.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleFeedFood(food.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl bg-white/60 hover:bg-white/90 border border-white/40 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer hover:shadow-md ${food.hoverColor}`}
                  >
                    <span className="text-3xl filter drop-shadow-sm mb-1.5">{food.emoji}</span>
                    <span className="text-[11px] font-bold text-orange-950">{food.name.slice(2)}</span>
                    <span className={`text-[9px] mt-1 px-1.5 py-0.5 rounded-full text-white font-extrabold ${food.id === 'apple' || food.id === 'worm' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                      {food.id === 'apple' || food.id === 'worm' ? '美味' : '不能吃'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dress-up Center */}
            <div className="backdrop-blur-md bg-white/40 border border-white/50 rounded-3xl p-5 flex flex-col gap-3 shadow-sm">
              <h3 className="text-sm font-extrabold text-orange-950 flex items-center gap-1.5">
                <span className="text-lg">👑</span> 萌鸟百变变装
              </h3>
              
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={() => {
                    setActiveOutfit('none');
                    setParrotState('happy');
                    setBubbleText('返璞归真！我的原生态绿羽毛也是超级帅的啾！');
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all border text-center cursor-pointer ${
                    activeOutfit === 'none' 
                      ? 'bg-orange-500 text-white border-orange-500 shadow-sm' 
                      : 'bg-white/45 text-orange-950 border-white/30 hover:bg-white/70'
                  }`}
                >
                  <span className="text-lg">🌿</span>
                  <span className="text-[10px] font-bold">素颜</span>
                </button>

                <button
                  onClick={() => {
                    setActiveOutfit('beach');
                    setParrotState('happy');
                    setBubbleText('嘎嘎！夏日海滩风！带上墨镜穿上花衬衫，啾啾是沙滩上最靓的仔！🌊');
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all border text-center cursor-pointer ${
                    activeOutfit === 'beach' 
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm' 
                      : 'bg-white/45 text-orange-950 border-white/30 hover:bg-white/70'
                  }`}
                >
                  <span className="text-lg">🏖️</span>
                  <span className="text-[10px] font-bold">夏日海滩</span>
                </button>

                <button
                  onClick={() => {
                    setActiveOutfit('classical');
                    setParrotState('happy');
                    setBubbleText('啾啾！古典高雅风！戴上博士帽扎着红领结，感觉自己学富五车，嘎嘎！✍️');
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all border text-center cursor-pointer ${
                    activeOutfit === 'classical' 
                      ? 'bg-stone-700 text-white border-stone-700 shadow-sm' 
                      : 'bg-white/45 text-orange-950 border-white/30 hover:bg-white/70'
                  }`}
                >
                  <span className="text-lg">🎓</span>
                  <span className="text-[10px] font-bold">书香古典</span>
                </button>

                <button
                  onClick={() => {
                    setActiveOutfit('noble');
                    setParrotState('happy');
                    setBubbleText('吾乃皇家啾啾伯爵！(眨眼睛) 戴上皇冠单片镜，再系上高贵紫披风，奢华极了！👑');
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all border text-center cursor-pointer ${
                    activeOutfit === 'noble' 
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm' 
                      : 'bg-white/45 text-orange-950 border-white/30 hover:bg-white/70'
                  }`}
                >
                  <span className="text-lg">💎</span>
                  <span className="text-[10px] font-bold">奢华贵族</span>
                </button>

                <button
                  onClick={() => {
                    setActiveOutfit('sporty');
                    setParrotState('happy');
                    setBubbleText('接招！青春运动风！戴上红色束发带穿上6号球衣，今天的世界杯我非上场不可，啾！🏀');
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all border text-center cursor-pointer ${
                    activeOutfit === 'sporty' 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-white/45 text-orange-950 border-white/30 hover:bg-white/70'
                  }`}
                >
                  <span className="text-lg">⚽</span>
                  <span className="text-[10px] font-bold">青春活力</span>
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR: POWERFUL FUNCTION TABS (Chat, Poetry, Word Helper, Music player) */}
          <div className="lg:col-span-7 flex flex-col gap-4 w-full">
            
            {/* Tabs Selector Bar */}
            <div className="flex bg-white/40 p-1.5 rounded-2xl border border-white/40 gap-1 shadow-inner">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'chat'
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-orange-950 hover:bg-white/50'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                聊天互动 & 搜索
              </button>

              <button
                onClick={() => setActiveTab('poetry')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'poetry'
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-orange-950 hover:bg-white/50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                古诗背诵
              </button>

              <button
                onClick={() => setActiveTab('word')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'word'
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-orange-950 hover:bg-white/50'
                }`}
              >
                <BookOpenCheck className="w-4 h-4" />
                单词小助手
              </button>

              <button
                onClick={() => setActiveTab('music')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'music'
                    ? 'bg-orange-500 text-white shadow'
                    : 'text-orange-950 hover:bg-white/50'
                }`}
              >
                <Music className="w-4 h-4" />
                音乐盒
              </button>
            </div>

            {/* TAB CONTENTS (Each wrapped inside a gorgeous Frosted glass body with a stable minimum height) */}
            <div className="min-h-[460px] max-h-[580px] flex flex-col backdrop-blur-md bg-white/35 border border-white/50 rounded-3xl p-5 shadow-lg overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* 1. CHAT & WORLD CUP INTERFACE */}
                {activeTab === 'chat' && (
                  <motion.div
                    key="chat-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full flex-1 justify-between overflow-hidden"
                  >
                    {/* Chat header explanation */}
                    <div className="flex items-center justify-between border-b border-orange-200/50 pb-2 mb-3">
                      <div>
                        <h4 className="text-xs font-extrabold text-orange-950 flex items-center gap-1">
                          <Compass className="w-4 h-4 text-orange-600 animate-spin-slow" />
                          啾啾树洞：闲聊日常与世界杯搜索
                        </h4>
                        <p className="text-[10px] text-orange-900/60 font-semibold">
                          问“世界杯”话题，啾啾会自动开启联网搜索并进行回答嘎！
                        </p>
                      </div>
                      <Globe className="w-4 h-4 text-sky-500" />
                    </div>

                    {/* Messages flow */}
                    <div className="flex-1 overflow-y-auto space-y-3 px-1.5 py-1 mb-3 scrollbar-thin scrollbar-thumb-orange-200/50">
                      {chatHistory.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md ${
                            msg.sender === 'user' ? 'bg-orange-600 text-white' : 'bg-emerald-500 text-white'
                          }`}>
                            {msg.sender === 'user' ? '👧' : '🦜'}
                          </div>
                          
                          <div className="max-w-[75%] flex flex-col gap-1">
                            <div className={`rounded-2xl px-3.5 py-2.5 text-xs font-semibold leading-relaxed shadow-sm border ${
                              msg.sender === 'user'
                                ? 'bg-orange-500 text-white border-orange-400 rounded-tr-none'
                                : 'bg-white/70 text-orange-950 border-white/50 rounded-tl-none'
                            }`}>
                              {msg.text}

                              {/* Search grounding links */}
                              {msg.metadata?.groundingUrls && (
                                <div className="mt-2.5 pt-2 border-t border-dashed border-orange-200/50 text-[10px] text-orange-900/80">
                                  <div className="font-extrabold flex items-center gap-1 text-sky-700 mb-1">
                                    <Globe className="w-3 h-3" /> 联网搜索参考来源：
                                  </div>
                                  <ul className="space-y-1">
                                    {msg.metadata.groundingUrls.map((url, idx) => (
                                      <li key={idx} className="truncate">
                                        <a
                                          href={url.uri}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sky-600 hover:underline font-bold"
                                        >
                                          🔗 [{idx + 1}] {url.title}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <span className="text-[9px] text-orange-900/40 px-1 font-semibold">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}

                      {chatLoading && (
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm animate-spin-slow">
                            🦜
                          </div>
                          <div className="bg-white/60 text-orange-950 border border-white/50 rounded-2xl px-4 py-2 text-xs font-semibold rounded-tl-none shadow-sm flex items-center gap-2">
                            <span className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                            <span>啾啾拍着翅膀在思考中...</span>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Predefined prompt buttons */}
                    <div className="flex gap-1.5 flex-wrap overflow-x-auto py-1.5 border-t border-orange-200/30">
                      {CHAT_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => triggerPresetPrompt(prompt)}
                          className="text-[10px] bg-white/60 hover:bg-orange-100 border border-white/50 hover:border-orange-200 px-2.5 py-1 rounded-full text-orange-950 font-bold transition-all cursor-pointer shrink-0"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>

                    {/* Chat Input form */}
                    <form onSubmit={handleSendChat} className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="想对啾啾说什么？(比如：世界杯谁夺冠次数最多？)"
                        className="flex-1 bg-white/75 border border-white/60 hover:border-orange-300 focus:border-orange-500 rounded-2xl text-xs font-semibold px-4 py-3 outline-none transition-all shadow-inner text-orange-950 placeholder-orange-900/40"
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-5 rounded-2xl flex items-center justify-center transition-all cursor-pointer hover:shadow shadow-md font-bold text-xs gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        发送
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* 2. POETRY RECITAL TABS */}
                {activeTab === 'poetry' && (
                  <motion.div
                    key="poetry-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full flex-1 justify-between overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-orange-200/50 pb-2 mb-3">
                      <div>
                        <h4 className="text-xs font-extrabold text-orange-950 flex items-center gap-1">
                          <span>📜</span> 古诗背诵小专家
                        </h4>
                        <p className="text-[10px] text-orange-900/60 font-semibold">输入古诗名字，啾啾就会为你倒背如流并通俗解释含义啾！</p>
                      </div>
                    </div>

                    {/* Display poetry document scroll */}
                    <div className="flex-1 bg-amber-50/50 rounded-2xl p-4 border border-orange-200/40 overflow-y-auto mb-3 scrollbar-thin scrollbar-thumb-orange-200/50">
                      {poetryData ? (
                        <div className="flex flex-col items-center">
                          <span className="text-2xl filter drop-shadow mb-1">📜</span>
                          <h4 className="font-extrabold text-lg text-orange-950 text-center mb-0.5">
                            《{poetryData.title}》
                          </h4>
                          <span className="text-[10px] text-orange-800 font-bold mb-4">{poetryData.author}</span>
                          
                          {/* Paragraph line layout */}
                          <div className="text-center space-y-2 mb-6">
                            {poetryData.paragraphs.map((para, i) => (
                              <p key={i} className="text-sm font-extrabold text-orange-900 leading-relaxed tracking-wider">
                                {para}
                              </p>
                            ))}
                          </div>

                          {/* Explanation block */}
                          <div className="w-full bg-white/70 rounded-xl p-3 border border-orange-100 mb-4 text-xs">
                            <div className="font-extrabold text-orange-950 flex items-center gap-1.5 mb-1.5 border-b border-orange-100 pb-1">
                              <Sparkles className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                              <span>古诗白话文大意：</span>
                            </div>
                            <p className="text-orange-950/90 leading-relaxed font-semibold">
                              {poetryData.explanation}
                            </p>
                          </div>

                          {/* Parrot review commentary */}
                          <div className="w-full bg-emerald-50/60 rounded-xl p-3 border border-emerald-100/40 text-xs flex gap-3">
                            <span className="text-2xl">🦜</span>
                            <div>
                              <div className="font-extrabold text-emerald-950 mb-0.5">啾啾的趣味讲解：</div>
                              <p className="text-emerald-900 font-semibold italic">
                                {poetryData.jiujiuFeedback}
                              </p>
                              <button
                                onClick={() => speakText(`啾啾要给小主人讲一段悄悄话：${poetryData.jiujiuFeedback}`)}
                                className="mt-1.5 text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Volume2 className="w-3 h-3" />
                                听啾啾语音读这段
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                          <span className="text-4xl filter grayscale opacity-40 mb-3">📖</span>
                          <p className="text-xs font-bold text-orange-900/50">输入你想背诵的古诗名，让啾啾展现才华吧！</p>
                        </div>
                      )}
                    </div>

                    {/* Poetry search bar */}
                    <form onSubmit={handleFetchPoetry} className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={poetryQuery}
                          onChange={(e) => setPoetryQuery(e.target.value)}
                          placeholder="输入古诗名称 (如：登鹳雀楼、春晓、草...)"
                          className="w-full bg-white/75 border border-white/60 hover:border-orange-300 focus:border-orange-500 rounded-2xl text-xs font-semibold pl-10 pr-4 py-3 outline-none transition-all shadow-inner text-orange-950"
                        />
                        <Search className="w-4 h-4 text-orange-800/40 absolute left-3.5 top-3.5" />
                      </div>
                      <button
                        type="submit"
                        disabled={poetryLoading || !poetryQuery.trim()}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow flex items-center gap-1.5"
                      >
                        {poetryLoading ? '正在翻阅诗书...' : '背诵古诗'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* 3. ENGLISH WORD HELPER */}
                {activeTab === 'word' && (
                  <motion.div
                    key="word-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full flex-1 justify-between overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-orange-200/50 pb-2 mb-3">
                      <div>
                        <h4 className="text-xs font-extrabold text-orange-950 flex items-center gap-1">
                          <span>🔤</span> 单词复习小助手
                        </h4>
                        <p className="text-[10px] text-orange-900/60 font-semibold">输入六年级英文单词，啾啾反馈准确发音、释义、以及经典例句！</p>
                      </div>
                    </div>

                    {/* Word explanation result */}
                    <div className="flex-1 bg-blue-50/20 rounded-2xl p-4 border border-blue-100/30 overflow-y-auto mb-3 scrollbar-thin">
                      {wordData ? (
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-3 bg-white/60 p-3 rounded-xl border border-white/70 shadow-sm">
                            <div>
                              <span className="text-3xl font-extrabold text-orange-950 tracking-wide">
                                {wordData.word}
                              </span>
                              <span className="ml-3 text-xs text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full font-extrabold">
                                {wordData.ipa}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => speakText(wordData.word, 'en-US')}
                              className="bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-full flex items-center justify-center shadow transition-all cursor-pointer hover:scale-105"
                              title="播放美式发音"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Meaning panel */}
                          <div className="bg-white/70 rounded-xl p-3 border border-orange-100/50 mb-4 text-xs">
                            <div className="font-extrabold text-orange-950 flex items-center gap-1.5 mb-1.5 pb-1 border-b border-orange-100">
                              <span>📚 中文释义：</span>
                            </div>
                            <p className="text-orange-950 font-bold text-sm">
                              {wordData.meaning}
                            </p>
                          </div>

                          {/* Sentence panel */}
                          <div className="bg-white/70 rounded-xl p-3 border border-orange-100/50 mb-4 text-xs">
                            <div className="font-extrabold text-orange-950 flex items-center gap-1.5 mb-1.5 pb-1 border-b border-orange-100">
                              <span>✏️ 活学活用英文例句：</span>
                            </div>
                            <p className="text-blue-900 font-bold text-sm italic mb-1.5">
                              {wordData.exampleEn}
                            </p>
                            <p className="text-orange-950/80 font-bold">
                              {wordData.exampleCn}
                            </p>
                            <button
                              onClick={() => speakText(wordData.exampleEn, 'en-US')}
                              className="mt-2 text-[9px] bg-sky-600 hover:bg-sky-700 text-white px-2.5 py-1 rounded-full font-extrabold flex items-center gap-1 cursor-pointer transition-colors w-max"
                            >
                              <Volume2 className="w-3 h-3" />
                              听整句英文发音
                            </button>
                          </div>

                          {/* Parrot advice */}
                          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100/40 text-xs flex gap-3">
                            <span className="text-2xl">🦜</span>
                            <div>
                              <div className="font-extrabold text-emerald-950 mb-0.5">啾啾的学习诀窍：</div>
                              <p className="text-emerald-900 font-semibold italic">
                                {wordData.jiujiuFeedback}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center py-10">
                          <span className="text-4xl filter grayscale opacity-40 mb-3">🔤</span>
                          <p className="text-xs font-bold text-orange-900/50">输入你想学习的单词，让啾啾帮你拼读吧！</p>
                        </div>
                      )}
                    </div>

                    {/* Word Form */}
                    <form onSubmit={handleFetchWord} className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={wordQuery}
                          onChange={(e) => setWordQuery(e.target.value)}
                          placeholder="输入英文单词 (如：school, summer, friend...)"
                          className="w-full bg-white/75 border border-white/60 hover:border-orange-300 focus:border-orange-500 rounded-2xl text-xs font-semibold pl-10 pr-4 py-3 outline-none transition-all shadow-inner text-orange-950"
                        />
                        <HelpCircle className="w-4 h-4 text-orange-800/40 absolute left-3.5 top-3.5" />
                      </div>
                      <button
                        type="submit"
                        disabled={wordLoading || !wordQuery.trim()}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow flex items-center gap-1.5"
                      >
                        {wordLoading ? '正在查词...' : '查询单词'}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* 4. PROCEDURAL MUSIC PLAYBOX */}
                {activeTab === 'music' && (
                  <motion.div
                    key="music-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col h-full flex-1 justify-between overflow-hidden"
                  >
                    <div className="flex items-center justify-between border-b border-orange-200/50 pb-2 mb-3">
                      <div>
                        <h4 className="text-xs font-extrabold text-orange-950 flex items-center gap-1">
                          <span>🎵</span> 啾啾八音琴盒
                        </h4>
                        <p className="text-[10px] text-orange-900/60 font-semibold">输入一首歌曲的名字，啾啾会为你现场吹奏1分钟好听的曲子！</p>
                      </div>
                    </div>

                    {/* Play progress state card */}
                    <div className="flex-1 bg-orange-900/5 rounded-2xl p-4 flex flex-col items-center justify-center mb-3 border border-orange-900/5 relative overflow-hidden">
                      {isPlaying && playingTrackInfo ? (
                        <div className="flex flex-col items-center justify-center w-full z-10">
                          {/* Spinning Vinyl Record with current dress-up styles! */}
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                            className="w-28 h-28 bg-neutral-900 rounded-full border-4 border-amber-500 flex items-center justify-center relative shadow-lg"
                          >
                            <div className="absolute inset-2 border border-dashed border-neutral-700/60 rounded-full" />
                            <div className="absolute inset-5 border border-neutral-700/60 rounded-full" />
                            <div className="absolute inset-8 border border-neutral-700/60 rounded-full" />
                            {/* Colorful Center sticker */}
                            <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner">
                              🦜
                            </div>
                          </motion.div>

                          {/* Music info */}
                          <div className="text-center mt-4 w-full">
                            <h4 className="text-sm font-extrabold text-orange-950 truncate max-w-[80%] mx-auto">
                              正在播放：《{playingTrackInfo.title}》
                            </h4>
                            <p className="text-[10px] text-orange-800/80 font-bold mt-1">
                              音乐类型/心情：<span className="text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">{playingTrackInfo.mood}</span>
                            </p>

                            {/* Bouncing audio wave bars */}
                            <div className="flex items-end justify-center gap-1.5 h-8 mt-3">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                                <motion.div
                                  key={bar}
                                  animate={{ height: [12, Math.random() * 28 + 6, 12] }}
                                  transition={{ repeat: Infinity, duration: 0.4 + Math.random() * 0.4, ease: "easeInOut" }}
                                  className="w-1.5 bg-orange-500 rounded-full"
                                />
                              ))}
                            </div>

                            {/* Countdown bar */}
                            <div className="w-full max-w-[80%] mx-auto mt-4">
                              <div className="w-full h-1.5 bg-orange-200 rounded-full overflow-hidden shadow-inner">
                                <motion.div
                                  initial={{ width: '100%' }}
                                  animate={{ width: `${(secondsRemaining / 60) * 100}%` }}
                                  transition={{ duration: 1, ease: 'linear' }}
                                  className="h-full bg-orange-500 rounded-full"
                                />
                              </div>
                              <div className="flex justify-between text-[9px] text-orange-900/60 mt-1 font-bold">
                                <span>已播放 {60 - secondsRemaining} 秒</span>
                                <span className="text-orange-600 animate-pulse">倒计时播放中：{secondsRemaining}s</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={handleStopMusic}
                            className="mt-4 bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-6 py-2 rounded-full text-xs shadow-md transition-all cursor-pointer hover:scale-105"
                          >
                            ⏹️ 停止演奏
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-6 flex flex-col items-center">
                          <div className="w-20 h-20 bg-orange-200/40 rounded-full flex items-center justify-center text-4xl text-orange-950/40 mb-3 shadow-inner">
                            💿
                          </div>
                          <p className="text-xs font-bold text-orange-950/70 mb-1">八音盒处于待命状态</p>
                          <p className="text-[10px] text-orange-900/50 max-w-[80%] leading-relaxed font-semibold">
                            选择下方经典古诗曲库，或直接在输入框中给啾啾指定一首歌吧！
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quick Preset music triggers */}
                    <div className="bg-white/40 p-3 rounded-2xl border border-white/50 mb-3">
                      <span className="text-[10px] font-extrabold text-orange-950/80 block mb-2">🎈 经典啾啾好歌推荐：</span>
                      <div className="grid grid-cols-2 gap-2">
                        {PRESET_TRACKS.map((track, i) => (
                          <button
                            key={i}
                            onClick={() => handlePlayMusic(track)}
                            className="flex items-center gap-2.5 px-3 py-2 bg-white/70 hover:bg-orange-100 rounded-xl border border-white/40 text-left cursor-pointer transition-colors"
                          >
                            <span className="text-lg">💿</span>
                            <div className="truncate flex-1">
                              <span className="text-xs font-bold text-orange-950 block truncate">{track.title}</span>
                              <span className="text-[9px] text-orange-900/50 font-bold">{track.mood}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Song Title input */}
                    <form onSubmit={handleCustomMusicSubmit} className="flex gap-2">
                      <input
                        type="text"
                        value={customMusicTitle}
                        onChange={(e) => setCustomMusicTitle(e.target.value)}
                        placeholder="想听什么歌？(如：两只老虎、孤勇者、龙的传人...)"
                        className="flex-1 bg-white/75 border border-white/60 hover:border-orange-300 focus:border-orange-500 rounded-2xl text-xs font-semibold px-4 py-3 outline-none transition-all shadow-inner text-orange-950"
                      />
                      <button
                        type="submit"
                        disabled={!customMusicTitle.trim()}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow flex items-center gap-1.5"
                      >
                        🎵 啾啾现场吹奏
                      </button>
                    </form>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
