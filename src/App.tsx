/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Moon, 
  Share2, 
  Bookmark, 
  ChevronRight,
  Home,
  Play,
  Rss,
  LayoutGrid,
  Settings,
  Heart,
  X
} from 'lucide-react';
import { Story, FeaturedStory, NewsItem } from './types';
import { CATEGORIES, STORIES, FEATURED_STORIES, BREAKING_NEWS } from './data';

export default function App() {
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [stories, setStories] = useState<Story[]>(STORIES);
  const [featured, setFeatured] = useState<FeaturedStory[]>(FEATURED_STORIES);
  const [breaking, setBreaking] = useState<NewsItem[]>(BREAKING_NEWS);
  const [activeCategory, setActiveCategory] = useState('All News');
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (featured.length === 0) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % featured.length;
        if (scrollRef.current) {
          const container = scrollRef.current;
          const itemWidth = container.scrollWidth / featured.length;
          container.scrollTo({
            left: next * itemWidth,
            behavior: 'smooth'
          });
        }
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [featured.length]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const index = Math.round(container.scrollLeft / (container.scrollWidth / featured.length));
      if (index !== activeIndex) {
        setActiveIndex(index);
      }
    }
  };

  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div id="news-app" className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0f0f12] text-white' : 'bg-white text-[#1a1a1a]'} font-sans pb-24`}>
      {/* Modal for Article Detail */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-0 md:p-6"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className={`${isDarkMode ? 'bg-[#1a1a1f]' : 'bg-white'} w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video">
                <img src={selectedNews.imageUrl} alt={selectedNews.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-6 right-6 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 shadow-xl hover:bg-black/60 transition-all z-10"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-indigo-50 text-[#000080] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {selectedNews.category}
                  </span>
                  <span className="text-slate-400 text-xs font-bold">{selectedNews.date}</span>
                </div>
                
                <h2 className="text-3xl font-black leading-tight mb-8 text-slate-900 tracking-tight">
                  {selectedNews.title}
                </h2>

                <div className={`flex items-center gap-4 mb-10 p-4 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} rounded-2xl border`}>
                  <img 
                    src={selectedNews.authorAvatar || `https://i.pravatar.cc/150?u=${selectedNews.author}`} 
                    alt={selectedNews.author} 
                    className="w-12 h-12 rounded-full border-2 border-white/10 shadow-sm" 
                  />
                  <div className="flex-1">
                    <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-tight text-base`}>{selectedNews.author || 'Zenith Editorial'}</p>
                    <p className="text-xs text-slate-500 font-medium italic">Verified Contributor</p>
                  </div>
                  <button className="px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                    Follow
                  </button>
                </div>
                
                <div className={`prose prose-slate max-w-none ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} leading-relaxed space-y-6`}>
                  <p className={`text-xl font-bold ${isDarkMode ? 'text-white bg-white/5' : 'text-slate-800 bg-slate-50'} border-l-4 border-[#000080] p-6 rounded-r-2xl`}>
                    {selectedNews.summary}
                  </p>
                  <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {selectedNews.content || "LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. SED DO EIUSMOD TEMPOR INCIDIDUNT UT LABORE ET DOLORE MAGNA ALIQUA. UT ENIM AD MINIM VENIAM, QUIS NOSTRUD EXERCITATION ULLAMCO LABORIS NISI UT ALIQUIP EX EA COMMODO CONSEQUAT."}
                  </p>
                  <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    DUIS AUTE IRURE DOLOR IN REPREHENDERIT IN VOLUPTATE VELIT ESSE CILLUM DOLORE EU FUGIAT NULLA PARIATUR. EXCEPTEUR SINT OCCAECAT CUPIDATAT NON PROIDENT, SUNT IN CULPA QUI OFFICIA DESERUNT MOLLIT ANIM ID EST LABORUM.
                  </p>
                </div>

                <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-[#000080] text-white rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:scale-105 transition-transform active:scale-95">
                      <Heart size={20} fill="white" />
                      <span>Recommend</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#000080] hover:text-white transition-all shadow-sm">
                      <Share2 size={20} />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-[#000080] hover:text-white transition-all shadow-sm">
                      <Bookmark size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className={`px-5 pt-12 pb-4 flex items-center justify-between gap-4 sticky top-0 ${isDarkMode ? 'bg-[#0f0f12]/80' : 'bg-white/80'} backdrop-blur-md z-50`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${isDarkMode ? 'bg-white' : 'bg-black'} rounded-xl flex items-center justify-center`}>
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Evernote_logo.svg" 
              alt="Logo" 
              className={`w-7 h-7 ${isDarkMode ? '' : 'invert'}`} 
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#000080]">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search Stories"
            className={`w-full ${isDarkMode ? 'bg-white/5 text-white' : 'bg-[#f2f2f7] text-black'} py-2.5 pl-11 pr-4 rounded-full outline-none focus:ring-2 focus:ring-[#000080]/10 transition-all font-medium text-sm`}
          />
        </div>

        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-10 h-10 flex items-center justify-center ${isDarkMode ? 'text-yellow-400 bg-white/10' : 'text-slate-400 hover:bg-slate-100'} rounded-full transition-colors`}
        >
          <Moon size={22} className={isDarkMode ? "fill-yellow-400" : "fill-slate-400 opacity-50"} />
        </button>
      </header>

      {/* Categories Horizontal Scroll */}
      <div className="px-5 mb-6 overflow-x-auto no-scrollbar flex items-center gap-6">
        {categories.map((cat) => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold transition-all text-sm tracking-wide ${
              activeCategory === cat 
                ? 'bg-[#000080] text-white shadow-lg shadow-[#000080]/20' 
                : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Stories */}
      <section className="mb-10">
        <div className="px-5 flex items-center justify-between mb-5">
          <h2 className="text-2xl font-black tracking-tight">Featured Stories</h2>
        </div>

        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="px-5 flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory"
        >
          {featured.map((item) => (
            <div 
              key={item.id}
              className={`relative flex-shrink-0 w-[85vw] md:w-[60vw] lg:w-[500px] aspect-[16/11] rounded-[2.5rem] overflow-hidden group shadow-2xl ${isDarkMode ? 'shadow-black/20 ring-white/5' : 'shadow-indigo-100 ring-slate-100'} ring-1 cursor-pointer snap-center`}
              onClick={() => {
                // For demo purposes, we link to a breaking news item if clicked
                if (breaking[0]) setSelectedNews({ ...breaking[0], title: item.title, imageUrl: item.imageUrl });
              }}
            >
              <img 
                src={item.imageUrl} 
                alt="Featured" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {/* Like Pill */}
              <div className="absolute top-4 right-4">
                <div className={`${isDarkMode ? 'bg-black/40 text-white' : 'bg-white/40 text-slate-900'} backdrop-blur-xl rounded-full px-4 py-2 text-sm font-black flex items-center gap-2 border border-white/40 shadow-lg`}>
                  <Heart size={16} className={isDarkMode ? "text-white" : "text-slate-900"} /> {item.likes}
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-white text-2xl font-black leading-[1.15] line-clamp-3 tracking-tight">
                  {item.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
        
        {/* Indicators */}
        <div className="flex justify-center gap-1.5 mt-6">
          {featured.map((_, i) => (
            <div 
              key={i} 
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-[#000080] w-5' : (isDarkMode ? 'bg-white/10' : 'bg-slate-300')}`} 
            />
          ))}
        </div>
      </section>

      {/* Breaking News */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-extrabold tracking-tight">Breaking News</h2>
          <button className="text-xs font-extrabold text-[#1a1a1a] hover:underline uppercase tracking-widest">See All</button>
        </div>

        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {breaking.filter(news => activeCategory === 'All News' || news.category === activeCategory).map((news) => (
              <motion.div 
                key={news.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group cursor-pointer bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 rounded-[2rem] p-4 border border-transparent hover:border-slate-100"
                onClick={() => setSelectedNews(news)}
                layout
              >
                <div className={`flex gap-5 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-50/50 hover:bg-white hover:shadow-2xl hover:shadow-indigo-100'} transition-all duration-300 rounded-[2rem] p-4 border border-transparent hover:border-slate-100`}>
                  <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500 relative">
                    <img 
                      src={news.imageUrl} 
                      alt={news.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2">
                       <button 
                        className={`w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                          news.isSaved ? 'bg-[#000080] text-white' : 'bg-white/40 text-white hover:bg-white/60'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Toggle logic would go here
                        }}
                       >
                         <Bookmark size={14} className={news.isSaved ? 'fill-white' : ''} />
                       </button>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black text-[#000080] uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">
                        {news.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{news.date}</span>
                    </div>
                    <h3 className={`font-black text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-[#000080] transition-colors line-clamp-2 mb-2 tracking-tight`}>
                      {news.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                      {news.summary}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-50 pointer-events-none">
        <nav className="bg-black/90 backdrop-blur-2xl rounded-3xl px-8 h-18 flex items-center gap-12 shadow-2xl shadow-black/20 pointer-events-auto border border-white/10 ring-1 ring-white/5">
          <BottomNavItem icon={<Home size={22} />} label="Home" active />
          <BottomNavItem icon={<LayoutGrid size={22} />} label="Category" />
          <BottomNavItem icon={<Bookmark size={22} />} label="Fav" />
        </nav>
      </div>
    </div>
  );
}

function BottomNavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-1 transition-all ${
      active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
    }`}>
      <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-white/10 ring-1 ring-white/20 scale-110' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}
