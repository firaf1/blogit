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
  ChevronLeft,
  Home,
  Play,
  Rss,
  LayoutGrid,
  Settings,
  Heart,
  X,
  Eye
} from 'lucide-react';
import { Story, FeaturedStory, NewsItem } from './types';
import { CATEGORIES, STORIES, FEATURED_STORIES, BREAKING_NEWS } from './data';
import { apiService } from './services/apiService';
import { incrementArticleView, getArticleViewCount, getMultipleArticleViewCounts } from './lib/firebase';

export default function App() {
  const [categories, setCategories] = useState<string[]>(['All News']);
  const [stories, setStories] = useState<Story[]>([]);
  const [featured, setFeatured] = useState<FeaturedStory[]>([]);
  const [breaking, setBreaking] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<NewsItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All News');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [currentTab, setCurrentTab] = useState('Home');
  const scrollRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const [cats, home] = await Promise.all([
          apiService.getCategories(),
          apiService.getHomeData()
        ]);
        if (cats) setCategories(cats);
        if (home.featured.length > 0) setFeatured(home.featured);
        if (home.breaking.length > 0) {
          setBreaking(home.breaking);
          
          // Fetch views for the breaking list
          const ids = home.breaking.map(b => String(b.id));
          getMultipleArticleViewCounts(ids).then(viewsMap => {
            setBreaking(current => current.map(item => ({
              ...item,
              views: viewsMap[String(item.id)] || 0
            })));
          });
        }
      } catch (err) {
        console.error("API Error:", err);
      } finally {
        setLoading(false);
      }
    };
    initData();
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

  const filteredFeatured = featured.filter(item => activeCategory === 'All News' || item.category === activeCategory);
  const displayFeatured = filteredFeatured.length > 0 ? filteredFeatured : featured;

  const authors = ['All Authors', ...new Set(breaking.map(item => item.author).filter(Boolean) as string[])];

  const filteredBreaking = breaking.filter(news => {
    const matchesCategory = activeCategory === 'All News' || news.category === activeCategory;
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         news.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length > 1) {
      const matches = breaking.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setSuggestions(matches);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectNews = async (news: NewsItem) => {
    setSelectedNews(news);
    try {
      // Background increment
      incrementArticleView(String(news.id));
      
      const [fullDetail, views] = await Promise.all([
        apiService.getBlogDetail(news.id),
        getArticleViewCount(String(news.id))
      ]);
      
      if (fullDetail) {
        setSelectedNews({ ...fullDetail, views: views || (news.views || 0) + 1 });
      } else {
        setSelectedNews({ ...news, views: views || (news.views || 0) + 1 });
      }
    } catch (err) {
      console.error("Error fetching detail:", err);
    }
  };

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
                <img src={selectedNews.imageUrl} alt={selectedNews.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" />
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-6 left-6 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 shadow-xl hover:bg-black/60 transition-all z-20"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setSelectedNews(null)}
                  className="absolute top-6 right-6 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 shadow-xl hover:bg-black/60 transition-all z-20"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-8 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-white/10 text-white' : 'bg-indigo-50 text-[#000080]'}`}>
                      {selectedNews.category}
                    </span>
                    <span className="text-slate-400 text-xs font-bold">{selectedNews.date}</span>
                    <div className="flex items-center gap-1.5 ml-auto text-slate-400">
                      <Eye size={14} />
                      <span className="text-xs font-bold">{selectedNews.views || 0} views</span>
                    </div>
                  </div>
                  
                  <h2 className={`text-3xl font-black leading-tight tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {selectedNews.title}
                  </h2>

                  <div className={`flex items-center gap-4 p-4 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} rounded-2xl border`}>
                    <img 
                      src={selectedNews.authorAvatar || `https://i.pravatar.cc/150?u=${selectedNews.author}`} 
                      alt={selectedNews.author} 
                      className="w-12 h-12 rounded-full border-2 border-white/10 shadow-sm" 
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-tight text-base`}>{selectedNews.author || 'Editorial Team'}</p>
                      <p className="text-xs text-slate-500 font-medium italic">Verified Contributor</p>
                    </div>
                    <button className="px-5 py-2 bg-[#000080] text-white text-xs font-bold rounded-xl hover:bg-black transition-colors shadow-sm">
                      Follow
                    </button>
                  </div>
                  
                  <div className={`prose prose-slate max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                    {/* Lead section (Summary) */}
                    <div className={`text-xl font-bold ${isDarkMode ? 'text-white bg-white/5' : 'text-slate-800 bg-slate-50'} border-l-4 border-[#000080] p-6 rounded-r-2xl mb-8`}>
                      {selectedNews.summary}
                    </div>

                    {/* Main Content Body */}
                    <div 
                      className="text-lg leading-relaxed space-y-4"
                      dangerouslySetInnerHTML={{ 
                        __html: selectedNews.content ? selectedNews.content.replace(/&nbsp;/g, ' ') : "No content available" 
                      }}
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-between pt-8 border-t border-slate-100">
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className={`px-5 pt-12 pb-4 flex items-center justify-between gap-4 sticky top-0 ${isDarkMode ? 'bg-[#0f0f12]/80' : 'bg-white/80'} backdrop-blur-md z-50`}>
        <div className="flex items-center">
          <div className={`w-11 h-11 ${isDarkMode ? 'bg-white' : 'bg-[#000080]'} rounded-xl flex items-center justify-center shadow-2xl ${isDarkMode ? 'shadow-white/10' : 'shadow-blue-900/40'} border ${isDarkMode ? 'border-white/20' : 'border-blue-800'}`}>
            <span className={`font-black text-xl leading-none flex items-start ${isDarkMode ? 'text-black' : 'text-white'}`}>
              1<span className="text-[10px] mt-0.5 ml-0.5 font-bold">+</span>
            </span>
          </div>
        </div>

        <div className="relative flex-1 group" ref={searchRef}>
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#000080]">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Search Stories"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim().length > 1 && setShowSuggestions(true)}
            className={`w-full ${isDarkMode ? 'bg-white/5 text-white' : 'bg-[#f2f2f7] text-black'} py-2.5 pl-11 pr-11 rounded-full outline-none focus:ring-2 focus:ring-[#000080]/10 transition-all font-medium text-sm`}
          />
          
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setShowSuggestions(false);
              }}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
          
          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden z-[60] border ${
                  isDarkMode ? 'bg-[#1a1a1f] border-white/10' : 'bg-white border-slate-100'
                }`}
              >
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleSelectNews(item);
                      setShowSuggestions(false);
                      setSearchQuery(item.title);
                    }}
                    className={`w-full px-5 py-3 text-left hover:bg-indigo-50/50 transition-colors flex items-center gap-3 border-b last:border-0 ${
                      isDarkMode ? 'border-white/5 hover:bg-white/5' : 'border-slate-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                      <img 
                        src={item.imageUrl} 
                        alt="" 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{item.category}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`w-10 h-10 flex items-center justify-center ${isDarkMode ? 'text-yellow-400 bg-white/10' : 'text-slate-400 hover:bg-slate-100'} rounded-full transition-colors`}
        >
          <Moon size={22} className={isDarkMode ? "fill-yellow-400" : "fill-slate-400 opacity-50"} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="pb-24 min-h-[50vh]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-[#000080] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Latest News...</p>
          </div>
        ) : (
          <>
            {currentTab === 'Home' && (
          <>
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
                {displayFeatured.map((item) => (
                  <div 
                    key={item.id}
                    className={`relative flex-shrink-0 w-[85vw] md:w-[60vw] lg:w-[500px] aspect-[16/11] rounded-[2.5rem] overflow-hidden group shadow-2xl ${isDarkMode ? 'shadow-black/20 ring-white/5' : 'shadow-indigo-100 ring-slate-100'} ring-1 cursor-pointer snap-center`}
                    onClick={() => {
                      if (breaking[0]) handleSelectNews({ ...breaking[0], id: item.id, title: item.title, imageUrl: item.imageUrl });
                    }}
                  >
                    <img 
                      src={item.imageUrl} 
                      alt="Featured" 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
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
              
              <div className="flex justify-center gap-1.5 mt-6">
                {displayFeatured.map((_, i) => (
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
                  {filteredBreaking.map((news) => (
                    <motion.div 
                      key={news.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group cursor-pointer"
                      onClick={() => handleSelectNews(news)}
                      layout
                    >
                      <div className={`flex gap-4 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:shadow-xl hover:shadow-indigo-50/50'} transition-all duration-300 rounded-3xl p-3 border ${isDarkMode ? 'border-white/5' : 'border-slate-100/60'}`}>
                        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-500 relative">
                          <img 
                            src={news.imageUrl} 
                            alt={news.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <div className="absolute top-1.5 right-1.5">
                             <button 
                              className={`w-7 h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                                news.isSaved ? 'bg-[#000080] text-white' : 'bg-white/60 text-[#000080] hover:bg-white'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                             >
                               <Bookmark size={12} className={news.isSaved ? 'fill-white' : ''} />
                             </button>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col justify-center gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isDarkMode ? 'bg-white/10 text-white' : 'bg-indigo-50 text-[#000080]'}`}>
                              {news.category}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400">{news.date}</span>
                            <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 ml-auto">
                              <Eye size={10} />
                              <span>{news.views || 0}</span>
                            </div>
                          </div>
                          <h3 className={`font-bold text-base leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-[#000080] transition-colors line-clamp-2 tracking-tight`}>
                            {news.title}
                          </h3>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </>
        )}

        {currentTab === 'Category' && (
          <section className="px-5">
            <h2 className="text-3xl font-black mb-8 tracking-tight">Explore Categories</h2>
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <motion.button
                  key={cat}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setActiveCategory(cat);
                    setCurrentTab('Home');
                  }}
                  className={`h-32 rounded-[2rem] p-6 flex flex-col justify-between items-start transition-all shadow-xl group overflow-hidden relative ${
                    isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'
                  } border`}
                >
                  <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-white/10' : 'bg-[#000080]/5'} group-hover:scale-110 transition-transform`}>
                    <LayoutGrid size={20} className={isDarkMode ? 'text-white' : 'text-[#000080]'} />
                  </div>
                  <span className={`font-black text-lg tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{cat}</span>
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <LayoutGrid size={80} />
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
        )}

        {currentTab === 'Fav' && (
          <section className="px-5">
            <h2 className="text-3xl font-black mb-8 tracking-tight">Saved Stories</h2>
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
               <Bookmark size={48} className="mb-4 opacity-20" />
               <p className="font-bold">No saved stories yet</p>
               <p className="text-sm">Stories you bookmark will appear here</p>
            </div>
          </section>
        )}
      </>
    )}
  </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center z-50 pointer-events-none">
        <nav className="bg-black/90 backdrop-blur-2xl rounded-3xl px-8 h-18 flex items-center gap-12 shadow-2xl shadow-black/20 pointer-events-auto border border-white/10 ring-1 ring-white/5">
          <BottomNavItem 
            icon={<Home size={22} />} 
            label="Home" 
            active={currentTab === 'Home'} 
            onClick={() => setCurrentTab('Home')}
          />
          <BottomNavItem 
            icon={<LayoutGrid size={22} />} 
            label="Category" 
            active={currentTab === 'Category'} 
            onClick={() => setCurrentTab('Category')}
          />
          <BottomNavItem 
            icon={<Bookmark size={22} />} 
            label="Fav" 
            active={currentTab === 'Fav'} 
            onClick={() => setCurrentTab('Fav')}
          />
        </nav>
      </div>
    </div>
  );
}

function BottomNavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${
      active ? 'text-white' : 'text-slate-400 hover:text-slate-200'
    }`}>
      <div className={`p-1.5 rounded-xl transition-all ${active ? 'bg-white/10 ring-1 ring-white/20 scale-110' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight">{label}</span>
    </button>
  );
}
