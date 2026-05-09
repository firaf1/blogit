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
  Heart
} from 'lucide-react';
import { Story, FeaturedStory, NewsItem } from './types';

export default function App() {
  const [categories, setCategories] = useState<string[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [featured, setFeatured] = useState<FeaturedStory[]>([]);
  const [breaking, setBreaking] = useState<NewsItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All News');
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, strs, feat, brk] = await Promise.all([
          fetch('/api/news/categories').then(res => res.json()),
          fetch('/api/news/stories').then(res => res.json()),
          fetch('/api/news/featured').then(res => res.json()),
          fetch('/api/news/breaking').then(res => res.json()),
        ]);
        setCategories(cats);
        setStories(strs);
        setFeatured(feat);
        setBreaking(brk);
      } catch (error) {
        console.error('Data sync failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  return (
    <div id="news-app" className="min-h-screen bg-white text-[#1a1a1a] font-sans pb-24">
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
              className="bg-white w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-video">
                <img src={selectedNews.imageUrl} alt={selectedNews.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-6 right-6 w-10 h-10 bg-black/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20"
                >
                  <Settings size={20} className="rotate-45" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-indigo-50 text-[#000080] text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {selectedNews.category}
                  </span>
                  <span className="text-slate-400 text-sm font-bold">{selectedNews.date}</span>
                </div>
                
                <h2 className="text-3xl font-black leading-tight mb-6 text-slate-900 tracking-tight">
                  {selectedNews.title}
                </h2>
                
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
                  <p className="text-lg font-medium text-slate-700 italic border-l-4 border-[#000080] pl-4">
                    {selectedNews.summary}
                  </p>
                  <p>
                    LOREM IPSUM DOLOR SIT AMET, CONSECTETUR ADIPISCING ELIT. SED DO EIUSMOD TEMPOR INCIDIDUNT UT LABORE ET DOLORE MAGNA ALIQUA. UT ENIM AD MINIM VENIAM, QUIS NOSTRUD EXERCITATION ULLAMCO LABORIS NISI UT ALIQUIP EX EA COMMODO CONSEQUAT.
                  </p>
                  <p>
                    DUIS AUTE IRURE DOLOR IN REPREHENDERIT IN VOLUPTATE VELIT ESSE CILLUM DOLORE EU FUGIAT NULLA PARIATUR. EXCEPTEUR SINT OCCAECAT CUPIDATAT NON PROIDENT, SUNT IN CULPA QUI OFFICIA DESERUNT MOLLIT ANIM ID EST LABORUM.
                  </p>
                </div>

                <div className="mt-10 flex items-center justify-between pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    <div>
                      <p className="text-sm font-black">Zenith Editorial</p>
                      <p className="text-xs text-slate-400">Senior News Editor</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#000080] hover:text-white transition-all">
                      <Share2 size={20} />
                    </button>
                    <button className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-[#000080] hover:text-white transition-all">
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
      <header className="px-5 pt-12 pb-4 flex items-center justify-between gap-4 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/4/44/Evernote_logo.svg" 
              alt="Logo" 
              className="w-7 h-7 invert" 
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
            className="w-full bg-[#f2f2f7] py-2.5 pl-11 pr-4 rounded-full outline-none focus:ring-2 focus:ring-[#000080]/10 transition-all font-medium text-sm"
          />
        </div>

        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
          <Moon size={22} className="fill-slate-400 opacity-50" />
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
              className="relative flex-shrink-0 w-[85vw] md:w-[60vw] lg:w-[500px] aspect-[16/11] rounded-[2.5rem] overflow-hidden group shadow-2xl shadow-indigo-100 ring-1 ring-slate-100 cursor-pointer snap-center"
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
                <div className="bg-white/40 backdrop-blur-xl rounded-full px-4 py-2 text-slate-900 text-sm font-black flex items-center gap-2 border border-white/40 shadow-lg">
                  <Heart size={16} className="text-slate-900" /> {item.likes}
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
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-[#000080] w-5' : 'bg-slate-300'}`} 
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
                className="group cursor-pointer"
                onClick={() => setSelectedNews(news)}
                layout
              >
                <div className="flex gap-5 items-start">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={news.imageUrl} 
                      alt={news.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 flex flex-col min-h-[112px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-[#000080] uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                        {news.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">{news.date}</span>
                    </div>
                    <h3 className="font-bold text-base leading-tight text-slate-900 group-hover:text-[#000080] transition-colors line-clamp-2 mb-1.5">
                      {news.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {news.summary}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-4 text-slate-400">
                        <button className="hover:text-[#000080] transition-colors">
                          <Share2 size={16} />
                        </button>
                        <button className="hover:text-[#000080] transition-colors">
                          <Bookmark size={16} className={news.isSaved ? 'fill-[#000080] text-[#000080]' : ''} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 border-b border-slate-100 last:border-none" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 px-6 flex items-center justify-between z-50">
        <BottomNavItem icon={<Home size={24} />} label="Home" active />
        <BottomNavItem icon={<Play size={24} />} label="Shorts" />
        <BottomNavItem icon={<Rss size={24} />} label="My Feed" />
        <BottomNavItem icon={<LayoutGrid size={24} />} label="Category" />
        <BottomNavItem icon={<Settings size={24} />} label="Settings" />
      </nav>
    </div>
  );
}

function BottomNavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`flex flex-col items-center gap-1 transition-all ${
      active ? 'text-[#000080]' : 'text-slate-400 hover:text-slate-600'
    }`}>
      <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-[#000080]/10 ring-1 ring-[#000080]/20 scale-110' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}
