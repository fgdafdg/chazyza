import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Globe, 
  Settings, 
  Search, 
  Cpu, 
  Lock, 
  Activity,
  Menu,
  X,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Zap,
  Terminal,
  Bot,
  Gamepad2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Hooks & Utilities ---

const useCloak = () => {
  const [cloaked, setCloaked] = useState(localStorage.getItem('cloaked') === 'true');

  useEffect(() => {
    // Register UV Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/uv/uv.sw.js', {
        scope: '/uv/service/'
      }).then(() => {
        console.log('SCRAMJET: Service Worker Active');
      }).catch(err => {
        console.error('SCRAMJET: Worker Failure', err);
      });
    }

    if (cloaked) {
      document.title = 'Google Docs';
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = 'https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico';
    } else {
      document.title = "Chazaya's Place";
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = '/favicon.ico';
    }
    localStorage.setItem('cloaked', cloaked.toString());
  }, [cloaked]);

  return [cloaked, setCloaked] as const;
};

const openAboutBlank = () => {
  const win = window.open('about:blank', '_blank');
  if (!win) return;
  const iframe = win.document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.position = 'fixed';
  iframe.style.inset = '0';
  iframe.src = window.location.href;
  win.document.body.style.margin = '0';
  win.document.body.appendChild(iframe);
};

// --- Components ---

const Sidebar = () => {
  const location = useLocation();
  const [cloaked, setCloaked] = useCloak();
  const menuItems = [
    { icon: Globe, label: 'Proxy Hub', path: '/' },
    { icon: MessageSquare, label: 'AI Oracle', path: '/ai' },
    { icon: Gamepad2, label: 'Entertainment', path: '/games' },
    { icon: Shield, label: 'VPN Nodes', path: '/vpn' },
    { icon: Activity, label: 'Network', path: '/status' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ ease: [0.19, 1.0, 0.22, 1.0], duration: 0.8 }}
      id="sidebar" 
      className="w-64 bg-[#080809] border-r border-white/5 h-screen fixed left-0 top-0 flex flex-col p-8 z-40 hidden md:flex"
    >
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col h-full">
        <motion.div variants={itemVariants} className="flex flex-col mb-12">
          <h1 className="text-2xl font-serif italic text-white tracking-tight">chazaya's place</h1>
          <p className="text-[9px] uppercase tracking-[0.3em] text-[#8a8a8a] mt-1">Encrypted Gateway</p>
        </motion.div>

        <motion.nav variants={containerVariants} className="flex-1 space-y-6">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <motion.div variants={itemVariants} key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 transition-colors group py-1 border-b relative",
                    isActive 
                      ? "border-white/40 text-white" 
                      : "border-transparent text-[#8a8a8a] hover:text-white hover:border-white/20"
                  )}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeSideBarNav"
                      className="absolute -left-4 w-1 h-1 rounded-full bg-white"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon className={cn("w-4 h-4 transition-all duration-500", isActive ? "opacity-100" : "opacity-50")} />
                  <span className="font-semibold text-[11px] uppercase tracking-widest">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>

        <motion.div variants={itemVariants} className="mt-auto pt-8 space-y-2">
          <button 
            onClick={() => setCloaked(!cloaked)}
            className="w-full py-2 border border-white/5 text-[9px] uppercase font-bold tracking-widest text-[#444] hover:text-[#888] transition-all text-left px-2"
          >
            {cloaked ? 'Disable Cloak' : 'Enable Cloak'}
          </button>
          <button 
            onClick={openAboutBlank}
            className="w-full py-2 border border-white/5 text-[9px] uppercase font-bold tracking-widest text-[#444] hover:text-[#888] transition-all text-left px-2"
          >
            Ab:Blank Tab
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.19, 1.0, 0.22, 1.0] } }
};

const ProxyPage = () => {
  const [url, setUrl] = useState('');
  const [proxyFrameUrl, setProxyFrameUrl] = useState<string | null>(null);
  const [engine, setEngine] = useState('Scramjet V4');
  const [terminalText, setTerminalText] = useState('');
  const [activeRegionId, setActiveRegionId] = useState('zurich');

  const regions = [
    { id: 'zurich', name: 'Zurich', ping: '12ms' },
    { id: 'reykjavik', name: 'Reykjavik', ping: '38ms' },
    { id: 'tokyo', name: 'Tokyo', ping: '142ms' },
    { id: 'panama', name: 'Panama', ping: '84ms' },
  ];
  const activeRegion = regions.find(r => r.id === activeRegionId) || regions[0];
  
  useEffect(() => {
    const text = "BOOTING SCRAMJET V4 ENGINE... NODES ENCRYPTED... GATEWAY READY.";
    let i = 0;
    const interval = setInterval(() => {
      setTerminalText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleGo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    let processedUrl = url.trim();
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      if (processedUrl.includes('.') && !processedUrl.includes(' ')) {
        processedUrl = 'https://' + processedUrl;
      } else {
        processedUrl = 'https://www.google.com/search?q=' + encodeURIComponent(processedUrl);
      }
    }

    // Actual proxy redirect logic
    const encodeUrl = (str: string) => {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.__uv$config && window.__uv$config.encodeUrl) {
        // @ts-ignore
        return window.__uv$config.encodeUrl(str);
      }
      return btoa(str);
    };

    const prefix = typeof window !== 'undefined' && (window as any).__uv$config ? (window as any).__uv$config.prefix : '/uv/service/';
    const proxyTargetUrl = window.location.origin + prefix + encodeUrl(processedUrl);
    
    // We just set the proxy frame URL and let the iframe render.
    // If the SW isn't active yet, the UVFallback component in React Router will catch it and refresh.
    setProxyFrameUrl(proxyTargetUrl);
  };

  if (proxyFrameUrl) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        <div className="h-12 bg-[#111112] border-b border-white/10 flex items-center px-4 justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setProxyFrameUrl(null)}
              className="text-white hover:text-gray-300 transition-colors p-2"
            >
              <X size={18} />
            </button>
            <div className="text-[10px] font-mono uppercase tracking-widest text-green-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Encrypted Node: {activeRegion.name}
            </div>
          </div>
          <div className="text-[9px] uppercase tracking-widest text-[#555]">Scramjet V4 Proxy</div>
        </div>
        <iframe 
          src={proxyFrameUrl}
          className="flex-1 w-full border-none bg-white"
        />
      </motion.div>
    );
  }

  return (
    <PageWrapper id="proxy-page" className="max-w-4xl mx-auto py-32 px-10 flex-1 w-full flex flex-col justify-center">
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <motion.div variants={itemVariants} className="mb-2 h-1 overflow-hidden">
          <span className="text-[#333] font-mono text-[8px] uppercase tracking-widest">{terminalText}</span>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mb-10">
          <h2 className="text-5xl font-serif italic text-white tracking-tight leading-none mb-4">Chazaya's Place</h2>
          <p className="text-[#555] text-xs uppercase tracking-widest">Global Encrypted Gateway</p>
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={handleGo} className="relative group mb-12">
          <div className="relative flex bg-[#111112] border border-white/5 focus-within:border-white/20 transition-all shadow-2xl">
            <input 
              type="text" 
              placeholder="enter destination url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-transparent px-6 py-4 text-white placeholder-[#222] outline-none font-mono text-sm"
            />
            <button 
              id="launch-btn"
              type="submit"
              className="bg-white text-black px-12 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all border-l border-white/10"
            >
              Launch
            </button>
          </div>
        </motion.form>

        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 gap-1">
          <motion.div whileHover={{ scale: 1.02 }} transition={{ ease: [0.19, 1.0, 0.22, 1.0] }} className="p-4 border border-white/5 text-center flex flex-col justify-center items-center">
            <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold">Latency: {activeRegion.ping}</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ ease: [0.19, 1.0, 0.22, 1.0] }} className="p-4 border border-white/5 text-center relative group flex flex-col items-center justify-center">
            <select 
              value={activeRegionId}
              onChange={(e) => setActiveRegionId(e.target.value)}
              className="appearance-none bg-transparent w-full h-full absolute inset-0 opacity-0 cursor-pointer z-10"
            >
              {regions.map(r => (
                <option key={r.id} value={r.id} className="bg-[#111112]">Node: {r.name}</option>
              ))}
            </select>
            <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold group-hover:text-white transition-colors">Node: {activeRegion.name} ▼</span>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ ease: [0.19, 1.0, 0.22, 1.0] }} className="hidden md:block p-4 border border-white/5 text-center flex flex-col justify-center items-center">
            <span className="text-[9px] uppercase tracking-widest text-[#444] font-bold">Engine: {engine}</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
};

const VPNPage = () => {
  const regions = [
    { id: 'zurich', name: 'Zurich, CH', flag: '🇨🇭', ping: '12ms', load: '12%' },
    { id: 'reykjavik', name: 'Reykjavík, IS', flag: '🇮🇸', ping: '41ms', load: '8%' },
    { id: 'tokyo', name: 'Tokyo, JP', flag: '🇯🇵', ping: '168ms', load: '56%' },
    { id: 'ashburn', name: 'Ashburn, US', flag: '🇺🇸', ping: '24ms', load: '45%' },
    { id: 'london', name: 'London, UK', flag: '🇬🇧', ping: '18ms', load: '30%' },
    { id: 'singapore', name: 'Singapore, SG', flag: '🇸🇬', ping: '192ms', load: '22%' },
    { id: 'mumbai', name: 'Mumbai, IN', flag: '🇮🇳', ping: '210ms', load: '15%' },
    { id: 'sydney', name: 'Sydney, AU', flag: '🇦🇺', ping: '280ms', load: '9%' },
    { id: 'tor-1', name: 'Onion Relay (DE)', flag: '🧅', ping: '840ms', load: '2%' },
    { id: 'tor-2', name: 'Onion Relay (NL)', flag: '🧅', ping: '920ms', load: '4%' },
  ];

  const [active, setActive] = useState('zurich');

  return (
    <PageWrapper id="vpn-page" className="max-w-4xl mx-auto py-20 px-10 flex-1 w-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <motion.div variants={itemVariants} className="mb-12 border-b border-white/10 pb-6">
          <h2 className="text-3xl font-serif italic text-white tracking-tight">VPN Nodes</h2>
          <p className="text-[#8a8a8a] text-[10px] uppercase tracking-widest mt-1">Select an encrypted tunnel for your session</p>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {regions.map((reg) => (
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.02)' }}
              transition={{ ease: [0.19, 1.0, 0.22, 1.0] }}
              key={reg.id}
              onClick={() => setActive(reg.id)}
              className={cn(
                "p-4 border transition-colors cursor-pointer rounded-sm flex justify-between items-center group",
                active === reg.id 
                  ? "bg-white text-black border-white" 
                  : "bg-[#111112] border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex items-center gap-4">
                <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{reg.flag}</span>
                <span className={cn("text-[10px] uppercase tracking-widest font-bold transition-colors", active === reg.id ? "text-black" : "text-[#8a8a8a]")}>
                  {reg.name}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className={cn("text-[9px] font-mono transition-colors", active === reg.id ? "text-black/60" : "text-[#555]")}>
                  {reg.ping}
                </span>
                <span className={cn("text-[8px] font-mono uppercase transition-colors", active === reg.id ? "text-black/40" : "text-[#333]")}>
                  Load: {reg.load}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
};

const SettingsPage = () => {
  const [proxyEngine, setProxyEngine] = useState('Scramjet V4');
  const [stealthMode, setStealthMode] = useState(true);
  const [theme, setTheme] = useState('Dark');
  const [customDomain, setCustomDomain] = useState('');
  const [cloaked, setCloaked] = useCloak();

  return (
    <PageWrapper id="settings-page" className="max-w-4xl mx-auto py-20 px-10 flex-1 w-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <motion.div variants={itemVariants} className="mb-12 border-b border-white/10 pb-6">
          <h2 className="text-3xl font-serif italic text-white tracking-tight">Settings</h2>
          <p className="text-[#8a8a8a] text-[10px] uppercase tracking-widest mt-1">Configure your browsing ecosystem</p>
        </motion.div>

        <motion.div variants={containerVariants} className="space-y-12">
          <motion.section variants={itemVariants}>
            <h3 className="text-[11px] uppercase tracking-widest font-bold text-white mb-6">Proxy Configuration</h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-white">Default Engine</p>
                  <p className="text-[10px] text-[#555]">Primary worker used for request routing</p>
                </div>
                <select 
                  value={proxyEngine} 
                  onChange={(e) => setProxyEngine(e.target.value)}
                  className="bg-[#111112] border border-white/10 text-[10px] p-2 outline-none uppercase tracking-widest font-bold focus:border-white/40 transition-colors"
                >
                  <option>Scramjet V4</option>
                  <option>Ultraviolet</option>
                  <option>Chemical</option>
                </select>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-white">Advanced Stealth</p>
                  <p className="text-[10px] text-[#555]">Mask hardware fingerprints and canvas data</p>
                </div>
                <button 
                  onClick={() => setStealthMode(!stealthMode)}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    stealthMode ? "bg-emerald-500" : "bg-white/10"
                  )}
                >
                  <motion.div 
                    layout
                    transition={{ ease: [0.19, 1.0, 0.22, 1.0], duration: 0.5 }}
                    className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", stealthMode ? "right-1" : "left-1")} 
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-white">Tab Cloaking</p>
                  <p className="text-[10px] text-[#555]">Disguise tab as an educational platform</p>
                </div>
                <button 
                  onClick={() => setCloaked(!cloaked)}
                  className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    cloaked ? "bg-emerald-500" : "bg-white/10"
                  )}
                >
                  <motion.div 
                    layout
                    transition={{ ease: [0.19, 1.0, 0.22, 1.0], duration: 0.5 }}
                    className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", cloaked ? "right-1" : "left-1")} 
                  />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-white">Custom Domain</p>
                  <p className="text-[10px] text-[#555]">Route traffic through a custom domain</p>
                </div>
                <input 
                  type="text" 
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="e.g. math-help.com"
                  className="bg-[#111112] border border-white/10 text-[10px] p-2 outline-none uppercase tracking-widest font-bold focus:border-white/40 transition-colors text-right placeholder-[#333] w-48 text-white"
                />
              </div>
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h3 className="text-[11px] uppercase tracking-widest font-bold text-white mb-6">Appearance</h3>
            <div className="flex gap-4">
              {['Dark', 'Blackout', 'Modern'].map(t => (
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  transition={{ ease: [0.19, 1.0, 0.22, 1.0] }}
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "flex-1 p-4 border text-[10px] uppercase tracking-widest font-bold rounded-sm transition-colors",
                    theme === t ? "bg-white text-black border-white" : "bg-[#111112] border-white/5 text-[#8a8a8a] hover:border-white/20"
                  )}
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </motion.section>

          <motion.section variants={itemVariants}>
            <h3 className="text-[11px] uppercase tracking-widest font-bold text-white mb-6">Tools</h3>
            <motion.button 
              whileHover={{ scale: 1.01 }} 
              transition={{ ease: [0.19, 1.0, 0.22, 1.0] }}
              onClick={openAboutBlank}
              className="w-full p-4 border border-white/5 text-[10px] uppercase tracking-widest font-bold text-[#8a8a8a] text-left hover:border-white/20 hover:text-white transition-colors bg-[#111112]"
            >
              Open in About:Blank Tab
            </motion.button>
          </motion.section>
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
};

const AI_PERSONAS = [
  {
    id: 'oracle',
    name: "brecken's bot",
    icon: Sparkles,
    color: '#fff',
    description: 'General intelligence and knowledge base.',
    instruction: 'You are "brecken\'s bot", an AI assistant embedded in Chazaya\'s Place. You are helpful, friendly, and extremely knowledgeable. Keep responses concise and insightful.'
  },
  {
    id: 'cyber',
    name: "rainey's security runner",
    icon: Shield,
    color: '#10b981',
    description: 'Security, networking, and technical specialist.',
    instruction: 'You are "rainey\'s security runner", a cybersecurity and networking expert. You speak in concise, technical terms. You are dedicated to privacy and digital freedom.'
  },
  {
    id: 'ghost',
    name: "rey's essay writer",
    icon: Zap,
    color: '#f59e0b',
    description: 'Writing, creative ideas, and expansion.',
    instruction: 'You are "rey\'s essay writer", an AI specialized in academic and creative writing. You provide structured, well-argued, and eloquent text.'
  },
  {
    id: 'syntax',
    name: "tyson's coder 2000",
    icon: Terminal,
    color: '#3b82f6',
    description: 'Code debugging and software architecture.',
    instruction: 'You are "tyson\'s coder 2000", a master software architect. You analyze code for efficiency and elegance. You prefer direct and informative solutions.'
  }
];

const GamesPage = () => {
  useEffect(() => {
    const initLumin = () => {
      // @ts-ignore
      if (window.Lumin) {
        // @ts-ignore
        window.Lumin.init({ container: '#games-container', theme: 'dark' });
      } else {
        setTimeout(initLumin, 100);
      }
    };
    initLumin();
  }, []);

  return (
    <PageWrapper id="games-page" className="max-w-[1400px] mx-auto py-12 px-6 w-full flex-1 flex flex-col">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex-1 flex flex-col">
        <motion.div variants={itemVariants} className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h2 className="text-5xl font-serif italic text-white tracking-tight leading-none">billy and jesse's entertainment</h2>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-mono text-emerald-500/80 uppercase tracking-[0.2em]">Neural Uplink Active</span>
              </div>
              <span className="text-[9px] font-mono text-[#333] uppercase tracking-[0.2em]">Cluster: B-ALPHA-09</span>
            </div>
          </div>
          <div className="flex gap-12 font-mono text-[8px] uppercase tracking-[0.3em] text-[#444]">
            <div>
              <p className="text-white/40 mb-1">Bandwidth</p>
              <p>1.2 GB/s [Encrypted]</p>
            </div>
            <div>
              <p className="text-white/40 mb-1">Latency</p>
              <p>14ms [Stable]</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col xl:flex-row gap-6 flex-1">
          {/* Main Console */}
          <div className="flex-1 relative group p-[2px] bg-white/5 rounded-sm overflow-hidden min-h-[850px] shadow-[0_0_80px_-20px_rgba(255,255,255,0.05)]">
            {/* Corner Decals */}
            <div className="absolute top-0 left-0 w-32 h-[1px] bg-white/20 z-40" />
            <div className="absolute top-0 left-0 w-[1px] h-32 bg-white/20 z-40" />
            <div className="absolute bottom-0 right-0 w-32 h-[1px] bg-white/20 z-40" />
            <div className="absolute bottom-0 right-0 w-[1px] h-32 bg-white/20 z-40" />

            <div id="games-container" className="relative z-10 w-full h-full min-h-[850px] bg-[#050505] p-6 overflow-y-auto custom-scrollbar" />
          </div>

          {/* Diagnostic Sidebar */}
          <div className="w-full xl:w-72 flex flex-col gap-6">
             <div className="p-6 border border-white/5 bg-white/[0.01] rounded-sm">
               <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em] mb-6 flex justify-between">
                 System Logs <span>0x4F</span>
               </h3>
               <div className="space-y-4 font-mono text-[9px] leading-relaxed">
                 {[
                   { time: '01:04:58', msg: 'Handshake successful with CDN_NODE_8' },
                   { time: '01:04:59', msg: 'Injecting Lumin runtime v3.4.1' },
                   { time: '01:05:01', msg: 'Syncing asset cache (144.2MB)' },
                   { time: '01:05:02', msg: 'Ready for interaction.' }
                 ].map((log, i) => (
                   <motion.div 
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                     key={i} 
                     className="flex gap-3 text-[#333]"
                   >
                     <span className="text-white/20">[{log.time}]</span>
                     <span className="flex-1">{log.msg}</span>
                   </motion.div>
                 ))}
               </div>
             </div>

             <div className="p-6 border border-white/5 bg-white/[0.01] rounded-sm flex-1">
               <h3 className="text-[10px] font-mono text-white/40 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                 <Zap className="w-3 h-3 text-emerald-500" /> Decryption State
               </h3>
               <div className="space-y-6">
                 {[
                   { label: 'Neural', value: 88 },
                   { label: 'Sub-Relay', value: 42 },
                   { label: 'Matrix', value: 96 }
                 ].map((stat, i) => (
                   <div key={i}>
                     <div className="flex justify-between text-[8px] font-mono uppercase tracking-widest text-[#555] mb-2">
                       <span>{stat.label}</span>
                       <span>{stat.value}%</span>
                     </div>
                     <div className="h-[2px] bg-white/5 w-full">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${stat.value}%` }}
                         transition={{ duration: 1.5, delay: 0.8 + i * 0.2, ease: [0.19, 1.0, 0.22, 1.0] }}
                         className="h-full bg-white/20" 
                       />
                     </div>
                   </div>
                 ))}
               </div>
               
               <div className="mt-12 pt-12 border-t border-white/5 text-center">
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 1.5, duration: 0.8 }}
                   className="inline-block p-4 border border-white/10 grayscale opacity-20"
                 >
                   <Bot className="w-8 h-8 text-white mx-auto mb-2" />
                   <p className="text-[7px] uppercase tracking-widest">Verify Signal</p>
                 </motion.div>
               </div>
             </div>
           </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 grid grid-cols-4 gap-4 opacity-[0.03] pointer-events-none select-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[1px] bg-white flex justify-between">
              <div className="w-1 h-1 bg-white" />
              <div className="w-1 h-1 bg-white" />
            </div>
          ))}
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
};

const AIChatPage = () => {
  const [activePersona, setActivePersona] = useState(AI_PERSONAS[0]);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('API Key missing');

      const genAI = new GoogleGenAI({ apiKey });
      
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const modelName = "gemini-3-flash-preview";
      const response = await genAI.models.generateContent({
        model: modelName,
        contents: [
          { role: 'user', parts: [{ text: `SYSTEM INSTRUCTION: ${activePersona.instruction}` }] },
          ...history,
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        tools: [{ googleSearch: {} }],
      });

      const aiText = response.text || "Connection lost. Signal weak.";
      setMessages(prev => [...prev, { role: 'ai', content: aiText }]);
    } catch (err) {
      console.error('AI ERROR:', err);
      setMessages(prev => [...prev, { role: 'ai', content: "CRITICAL FAILURE: THE ORACLE IS OFFLINE." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageWrapper id="ai-page" className="max-w-5xl mx-auto py-12 px-6 h-[calc(100vh-80px)] w-full flex flex-col">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col h-full">
        <motion.div variants={itemVariants} className="mb-8 flex justify-between items-end border-b border-white/5 pb-6">
          <div>
            <h2 className="text-3xl font-serif italic text-white tracking-tight flex items-center gap-3">
              <activePersona.icon className="w-6 h-6 transition-colors duration-500" style={{ color: activePersona.color }} />
              <motion.span 
                key={activePersona.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }}
              >
                {activePersona.name}
              </motion.span>
            </h2>
            <p className="text-[#555] text-[10px] uppercase tracking-widest mt-1">Multi-Agent Neural Relay</p>
          </div>
          <div className="flex gap-2">
            {AI_PERSONAS.map(p => (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                key={p.id}
                onClick={() => {
                  setActivePersona(p);
                  setMessages([]);
                }}
                title={p.description}
                className={cn(
                  "p-2 border transition-colors rounded-sm",
                  activePersona.id === p.id 
                    ? "border-white bg-white/5" 
                    : "border-white/5 hover:border-white/20"
                )}
              >
                <p.icon className="w-4 h-4 transition-colors duration-500" style={{ color: activePersona.id === p.id ? p.color : '#333' }} />
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-8 mb-6 pr-4 custom-scrollbar scroll-smooth"
        >
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ delay: 0.5 }}
              className="h-full flex flex-col items-center justify-center filter grayscale"
            >
              <Bot className="w-16 h-16 mb-4" />
              <p className="text-xs uppercase tracking-[0.5em] font-mono">Standby for Interaction</p>
            </motion.div>
          )}
          <AnimatePresence>
            {messages.map((m, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.19, 1.0, 0.22, 1.0] }}
                key={idx} 
                className={cn(
                  "flex flex-col gap-2 max-w-[85%]",
                  m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div className={cn(
                  "text-[8px] uppercase tracking-widest font-bold",
                  m.role === 'user' ? "text-[#555]" : ""
                )} style={{ color: m.role === 'ai' ? activePersona.color : undefined }}>
                  {m.role === 'user' ? 'Operator' : activePersona.name}
                </div>
                  {m.role === 'user' 
                    ? <div className="px-5 py-4 text-sm leading-relaxed bg-[#111112] border border-white/5 text-[#ccc] rounded-tl-xl rounded-tr-sm rounded-br-sm rounded-bl-xl shadow-lg">{m.content}</div>
                    : <div className="px-5 py-4 text-sm leading-relaxed bg-white/[0.02] border border-white/5 text-white rounded-tr-xl rounded-tl-sm rounded-bl-sm rounded-br-xl shadow-lg prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-p:mb-2 prose-a:text-blue-400">
                        <Markdown remarkPlugins={[remarkGfm]}>{m.content}</Markdown>
                      </div>
                  }
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="flex flex-col gap-2 items-start"
            >
              <div className="text-[8px] uppercase tracking-widest font-bold" style={{ color: activePersona.color }}>
                {activePersona.name}
              </div>
              <div className="flex gap-1 py-4">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }} className="w-1 h-1 bg-white" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.1 }} className="w-1 h-1 bg-white" />
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.2 }} className="w-1 h-1 bg-white" />
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.form variants={itemVariants} onSubmit={handleSend} className="relative mt-auto">
          <textarea
            rows={1}
            placeholder={`Input query for ${activePersona.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="w-full bg-[#111112] border border-white/10 p-5 pr-16 text-white placeholder-[#333] outline-none font-mono text-sm resize-none focus:border-white/30 transition-all rounded-sm shadow-xl"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-[#555] hover:text-white transition-all disabled:opacity-20"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </motion.form>
      </motion.div>
    </PageWrapper>
  );
};

const StatusPage = () => {
  const [latencyData, setLatencyData] = useState<{ time: string, ms: number }[]>([]);
  const [ip, setIp] = useState('Resolving...');
  const [networkInfo, setNetworkInfo] = useState({ type: '---', speed: '---' });
  const [currentPing, setCurrentPing] = useState(0);

  useEffect(() => {
    // 1. Fetch real IP
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIp(data.ip))
      .catch(() => setIp('Relay Protected'));

    // 2. Real-time Latency Monitor
    const interval = setInterval(async () => {
      const start = performance.now();
      try {
        await fetch('/api/status', { cache: 'no-store' });
        const end = performance.now();
        const ping = Math.round(end - start);
        setCurrentPing(ping);
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        
        setLatencyData(prev => [...prev.slice(-19), { time: timeStr, ms: ping }]);
      } catch (err) {
        console.error('Relay error', err);
      }
    }, 3000);

    // 3. Browser Connection API
    const conn = (navigator as any).connection;
    if (conn) {
      setNetworkInfo({ 
        type: conn.effectiveType?.toUpperCase() || 'ETH', 
        speed: (conn.downlink || '---') + ' Mbps' 
      });
    }

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Active Node', value: 'Zurich-01', sub: 'Primary Grid' },
    { label: 'Public IP', value: ip, sub: 'Assigned Mask' },
    { label: 'Connection', value: networkInfo.type, sub: 'Effective Type' },
    { label: 'Latency', value: `${currentPing} ms`, sub: 'Current Ping' },
  ];

  return (
    <PageWrapper id="status-page" className="max-w-4xl mx-auto py-20 px-10 flex-1 w-full">
      <motion.div variants={containerVariants} initial="hidden" animate="show">
        <motion.div variants={itemVariants} className="mb-12">
          <h2 className="text-2xl font-serif italic text-white tracking-tight">Network</h2>
          <p className="text-[#555] text-[10px] uppercase tracking-widest mt-1">Authentic Telemetry Stream</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111112] border border-white/5 p-8 rounded-sm mb-8 h-[300px]">
          <h3 className="text-[9px] uppercase tracking-widest font-bold text-[#444] mb-8">Relay Latency (ms)</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={latencyData}>
                <defs>
                  <linearGradient id="colorPing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="ms" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorPing)" 
                  animationDuration={300}
                />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 'dataMax + 50']} />
                <Tooltip 
                  contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                  itemStyle={{ color: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#111112] border border-white/5 p-8 rounded-sm mb-8 h-[300px]">
          <h3 className="text-[9px] uppercase tracking-widest font-bold text-[#444] mb-8">Network Traffic Flow</h3>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={latencyData}>
                <Line 
                  type="stepAfter" 
                  dataKey="ms" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#8b5cf6' }}
                  activeDot={{ r: 4, fill: '#c4b5fd' }}
                  animationDuration={300}
                />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 'dataMax + 50']} />
                <Tooltip 
                  contentStyle={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(stat => (
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ ease: [0.19, 1.0, 0.22, 1.0] }}
              key={stat.label} 
              className="p-6 bg-[#111112] border border-white/5 rounded-sm"
            >
              <div className="text-[#333] text-[9px] uppercase tracking-widest mb-1 font-bold">{stat.label}</div>
              <div className="text-white text-xs mb-1 truncate">{stat.value}</div>
              <div className="text-[9px] text-[#555] italic">{stat.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </PageWrapper>
  );
};

// --- App Layout ---

const animeEaseOut = [0.19, 1.0, 0.22, 1.0];

const PageWrapper = ({ children, id, className }: { children: React.ReactNode, id?: string, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ duration: 0.7, ease: animeEaseOut }}
      id={id}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const UVFallback = () => {
  useEffect(() => {
    // If we land here, the React router caught the /uv/service/ navigation.
    // This implies the Service Worker wasn't active yet to intercept the navigation request.
    // We can show a loading screen while we wait for SW registration, then reload.
    const attemptReload = async () => {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.ready;
        window.location.reload();
      }
    };
    attemptReload();
  }, []);

  return (
    <PageWrapper className="flex flex-col items-center justify-center flex-1 w-full text-center py-32 px-10">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-6"></div>
      <h2 className="text-2xl font-serif italic text-white tracking-tight leading-none mb-2">Decrypting Handshake...</h2>
      <p className="text-[#555] text-xs uppercase tracking-widest">Awaiting local node interception protocol. Please stand by.</p>
    </PageWrapper>
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      {/* @ts-ignore - React Router v7 and React 19 types issue with key prop */}
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<ProxyPage />} />
        <Route path="/uv/service/*" element={<UVFallback />} />
        <Route path="/ai" element={<AIChatPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/vpn" element={<VPNPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-[#080809] text-[#e0e0e0] selection:bg-white/10 font-sans">
        <Sidebar />

        {/* Mobile Header */}
        <div id="mobile-header" className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-[#080809] sticky top-0 z-50">
          <div className="flex flex-col">
            <h1 className="text-xl font-serif italic text-white tracking-tight">chazaya's place</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: animeEaseOut }}
              className="fixed inset-0 bg-[#080809]/90 z-40 flex flex-col p-12 pt-32"
            >
              <nav className="space-y-10">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-serif italic block text-white border-b border-white/10 pb-2">Proxy Hub</Link>
                <Link to="/ai" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-serif italic block text-white border-b border-white/10 pb-2">AI Oracle</Link>
                <Link to="/games" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-serif italic block text-white border-b border-white/10 pb-2">Entertainment</Link>
                <Link to="/vpn" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-serif italic block text-white border-b border-white/10 pb-2">VPN Nodes</Link>
                <Link to="/status" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-serif italic block text-white border-b border-white/10 pb-2">Status</Link>
                <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="text-4xl font-serif italic block text-white border-b border-white/10 pb-2">Settings</Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="md:ml-64 min-h-screen relative overflow-hidden flex flex-col items-center">
          {/* Subtle Grain / Ambient */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
          
          <div className="flex-1 w-full flex flex-col">
            <AnimatedRoutes />
          </div>

          {/* Footer in Main */}
          <footer className="w-full max-w-4xl mx-auto px-10 py-12 border-t border-white/5 flex flex-col items-center gap-4 opacity-40">
            <div className="flex gap-12 text-[8px] uppercase font-bold tracking-[0.3em] text-[#333]">
              <span>Identity Guard</span>
              <span>Encrypted Node</span>
              <span>Stateless Relay</span>
            </div>
            <div className="text-[7px] font-mono text-[#222] uppercase tracking-[0.4em] text-center max-w-xl leading-relaxed">
              CHAZAYA'S PLACE • BUILT FOR THE OPEN WEB • IDEA BY MINIATUREGIGGLES
            </div>
          </footer>
        </main>
      </div>
    </Router>
  );
}
