import 'package:flutter/material.dart';
import 'dart:async';
import 'models/news_model.dart';
import 'services/news_service.dart';

void main() {
  runApp(const OnePlusApp());
}

class OnePlusApp extends StatefulWidget {
  const OnePlusApp({super.key});

  @override
  State<OnePlusApp> createState() => _OnePlusAppState();
}

class _OnePlusAppState extends State<OnePlusApp> {
  ThemeMode _themeMode = ThemeMode.light;

  void _toggleTheme() {
    setState(() {
      _themeMode = _themeMode == ThemeMode.light ? ThemeMode.dark : ThemeMode.light;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OnePlus News',
      debugShowCheckedModeBanner: false,
      themeMode: _themeMode,
      scrollBehavior: const MaterialScrollBehavior().copyWith(
        scrollbars: false,
      ),
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF000080),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'SF Pro Display',
        scaffoldBackgroundColor: Colors.white,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF000080),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        fontFamily: 'SF Pro Display',
        scaffoldBackgroundColor: const Color(0xFF0F0F12),
      ),
      home: HomeScreen(onThemeToggle: _toggleTheme, isDarkMode: _themeMode == ThemeMode.dark),
    );
  }
}

class HomeScreen extends StatefulWidget {
  final VoidCallback onThemeToggle;
  final bool isDarkMode;
  const HomeScreen({super.key, required this.onThemeToggle, required this.isDarkMode});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final NewsService _newsService = NewsService();
  final PageController _featuredController = PageController();
  
  List<String> _categories = [];
  List<Story> _stories = [];
  List<FeaturedStory> _featured = [];
  List<NewsItem> _allBreaking = [];
  String _activeCategory = 'All News';
  int _featuredIndex = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
    _startAutoScroll();
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        _newsService.getCategories(),
        _newsService.getStories(),
        _newsService.getFeatured(),
        _newsService.getBreaking(),
      ]);

      setState(() {
        _categories = results[0] as List<String>;
        _stories = results[1] as List<Story>;
        _featured = results[2] as List<FeaturedStory>;
        _allBreaking = results[3] as List<NewsItem>;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading data: $e');
    }
  }

  void _startAutoScroll() {
    Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_featured.isNotEmpty) {
        int nextIndex = (_featuredIndex + 1) % _featured.length;
        _featuredController.animateToPage(
          nextIndex,
          duration: const Duration(milliseconds: 800),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final filteredNews = _allBreaking.where((item) => 
      _activeCategory == 'All News' || item.category == _activeCategory
    ).toList();
    final filteredFeatured = _featured.where((item) => 
      _activeCategory == 'All News' || item.category == _activeCategory
    ).toList();
    final displayFeatured = filteredFeatured.isNotEmpty ? filteredFeatured : _featured;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(100),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: widget.isDarkMode ? Colors.white : const Color(0xFF000080),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: widget.isDarkMode ? Colors.white.withOpacity(0.1) : const Color(0xFF000080).withOpacity(0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      )
                    ],
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '1',
                        style: TextStyle(
                          color: widget.isDarkMode ? Colors.black : Colors.white, 
                          fontWeight: FontWeight.black, 
                          fontSize: 18
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Text(
                          '+',
                          style: TextStyle(
                            color: widget.isDarkMode ? Colors.black : Colors.white, 
                            fontWeight: FontWeight.bold, 
                            fontSize: 10
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: TextField(
                    style: TextStyle(color: widget.isDarkMode ? Colors.white : Colors.black),
                    decoration: InputDecoration(
                      hintText: 'Search Stories',
                      hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),
                      prefixIcon: const Icon(Icons.search, color: Colors.grey),
                      filled: true,
                      fillColor: widget.isDarkMode ? Colors.white.withOpacity(0.05) : Colors.grey[100],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(vertical: 0),
                    ),
                  ),
                ),
                const SizedBox(width: 15),
                IconButton(
                  onPressed: widget.onThemeToggle,
                  icon: Icon(
                    widget.isDarkMode ? Icons.wb_sunny_rounded : Icons.nightlight_round,
                    color: widget.isDarkMode ? Colors.yellow : Colors.grey,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: Container(
        margin: const EdgeInsets.fromLTRB(25, 0, 25, 30),
        padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 10),
        decoration: BoxDecoration(
          color: widget.isDarkMode ? const Color(0xFF1A1A1F) : Colors.black,
          borderRadius: BorderRadius.circular(30),
          border: widget.isDarkMode ? Border.all(color: Colors.white10) : null,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(0, Icons.home_rounded, 'Home'),
            _buildNavItem(1, Icons.grid_view_rounded, 'Category'),
            _buildNavItem(2, Icons.favorite_rounded, 'Fav'),
          ],
        ),
      ),
      body: _currentIndex == 0 
        ? SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Categories
                SizedBox(
                  height: 50,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: _categories.length,
                    itemBuilder: (context, index) {
                      final cat = _categories[index];
                      bool isActive = _activeCategory == cat;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _activeCategory = cat;
                          });
                        },
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: const EdgeInsets.right(15),
                          padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 12),
                          decoration: BoxDecoration(
                            color: isActive ? const Color(0xFF000080) : (widget.isDarkMode ? Colors.white10 : Colors.grey[100]),
                            borderRadius: BorderRadius.circular(15),
                            boxShadow: isActive ? [
                              BoxShadow(
                                color: const Color(0xFF000080).withOpacity(0.3),
                                blurRadius: 10,
                                offset: const Offset(0, 4),
                              )
                            ] : null,
                          ),
                          child: Center(
                            child: Text(
                              cat,
                              style: TextStyle(
                                color: isActive ? Colors.white : (widget.isDarkMode ? Colors.grey : Colors.grey[600]),
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),
                
                // Story Circles
                SizedBox(
                  height: 100,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    itemCount: _stories.length,
                    itemBuilder: (context, index) {
                      return Container(
                        margin: const EdgeInsets.right(15),
                        width: 70,
                        height: 70,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: const Color(0xFF000080), width: 2),
                        ),
                        padding: const EdgeInsets.all(2),
                        child: CircleAvatar(
                          backgroundImage: NetworkImage(_stories[index].imageUrl),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),

                // Featured Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: const Text('Featured Stories', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                ),
                const SizedBox(height: 15),

                // Featured Carousel
                SizedBox(
                  height: 250,
                  child: PageView.builder(
                    controller: _featuredController,
                    onPageChanged: (idx) => setState(() => _featuredIndex = idx),
                    itemCount: displayFeatured.length,
                    itemBuilder: (context, index) {
                      final item = displayFeatured[index];
                      return Container(
                        margin: const EdgeInsets.symmetric(horizontal: 20),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(30),
                          image: DecorationImage(
                            image: NetworkImage(item.imageUrl),
                            fit: BoxFit.cover,
                          ),
                        ),
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(30),
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Colors.transparent, Colors.black.withOpacity(0.8)],
                            ),
                          ),
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.end,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.title,
                                style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 10),
                
                // Indicators
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(displayFeatured.length, (index) => 
                    Container(
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      width: index == _featuredIndex ? 20 : 8,
                      height: 8,
                      decoration: BoxDecoration(
                        color: index == _featuredIndex ? const Color(0xFF000080) : Colors.grey[300],
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 25),

                // Breaking News Header
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: const [
                      Text('Breaking News', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                      Text('See All', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold, fontSize: 12)),
                    ],
                  ),
                ),
                const SizedBox(height: 15),

                // Breaking News List
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: filteredNews.length,
                  itemBuilder: (context, index) {
                    final item = filteredNews[index];
                    return GestureDetector(
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ArticleDetailScreen(news: item),
                          ),
                        );
                      },
                      child: Container(
                        margin: const EdgeInsets.bottom(15),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: Theme.of(context).cardColor,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(widget.isDarkMode ? 0.2 : 0.03),
                              blurRadius: 15,
                              offset: const Offset(0, 8),
                            ),
                          ],
                          border: Border.all(color: widget.isDarkMode ? Colors.white10 : Colors.grey[100]!),
                        ),
                        child: Row(
                          children: [
                            Stack(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(16),
                                  child: Image.network(item.imageUrl, width: 85, height: 85, fit: BoxFit.cover),
                                ),
                                Positioned(
                                  top: 4,
                                  right: 4,
                                  child: Container(
                                    width: 24,
                                    height: 24,
                                    decoration: BoxDecoration(
                                      color: item.isSaved ? const Color(0xFF000080) : Colors.black.withOpacity(0.2),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      item.isSaved ? Icons.bookmark : Icons.bookmark_border,
                                      color: Colors.white,
                                      size: 12,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF000080).withOpacity(0.06),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(
                                          item.category.toUpperCase(),
                                          style: const TextStyle(
                                            color: Color(0xFF000080),
                                            fontSize: 7,
                                            fontWeight: FontWeight.w900,
                                            letterSpacing: 0.5,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        item.date,
                                        style: TextStyle(color: Colors.grey[400], fontSize: 9),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    item.title,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, height: 1.25),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          )
        : _currentIndex == 1
            ? Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Explore Categories', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 25),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 15,
                        mainAxisSpacing: 15,
                        childAspectRatio: 1.2,
                      ),
                      itemCount: _categories.length,
                      itemBuilder: (context, index) {
                        final cat = _categories[index];
                        return GestureDetector(
                          onTap: () {
                            setState(() {
                              _activeCategory = cat;
                              _currentIndex = 0;
                            });
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: widget.isDarkMode ? Colors.white.withOpacity(0.05) : const Color(0xFFF8F9FF),
                              borderRadius: BorderRadius.circular(24),
                              border: Border.all(color: widget.isDarkMode ? Colors.white10 : const Color(0xFF000080).withOpacity(0.05)),
                            ),
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF000080).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(Icons.grid_view_rounded, color: Color(0xFF000080), size: 20),
                                ),
                                Text(
                                  cat,
                                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              )
            : Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.bookmark_border, size: 80, color: Colors.grey),
                    SizedBox(height: 20),
                    Text('No saved stories yet', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                    Text('Stories you bookmark will appear here', style: TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    bool isActive = _currentIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = index),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            color: isActive ? Colors.white : Colors.grey,
            size: 26,
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              color: isActive ? Colors.white : Colors.grey,
              fontSize: 10,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}

class ArticleDetailScreen extends StatelessWidget {
  final NewsItem news;
  const ArticleDetailScreen({super.key, required this.news});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 400,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Image.network(news.imageUrl, fit: BoxFit.cover),
            ),
            leading: Padding(
              padding: const EdgeInsets.all(8.0),
              child: CircleAvatar(
                backgroundColor: Colors.black/30,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
            actions: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: CircleAvatar(
                  backgroundColor: Colors.black/30,
                  child: IconButton(
                    icon: const Icon(Icons.share, color: Colors.white, size: 20),
                    onPressed: () {},
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: CircleAvatar(
                  backgroundColor: Colors.black/30,
                  child: IconButton(
                    icon: const Icon(Icons.bookmark_border, color: Colors.white, size: 20),
                    onPressed: () {},
                  ),
                ),
              ),
            ],
          ),
          SliverToBoxAdapter(
            child: Container(
              padding: const EdgeInsets.all(25),
              decoration: BoxDecoration(
                color: Theme.of(context).scaffoldBackgroundColor,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(30),
                  topRight: Radius.circular(30),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF000080),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      news.category.toUpperCase(),
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    news.title,
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, height: 1.2),
                  ),
                  const SizedBox(height: 25),
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 24,
                        backgroundImage: NetworkImage(news.authorAvatar),
                      ),
                      const SizedBox(width: 15),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              news.author,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                            ),
                            Text(
                              'Verified Author • ${news.date}',
                              style: const TextStyle(color: Colors.grey, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.black,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                        ),
                        child: const Text('Follow', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 30),
                  Text(
                    news.summary,
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Theme.of(context).textTheme.titleLarge?.color),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    news.content,
                    style: TextStyle(fontSize: 16, height: 1.8, color: Theme.of(context).textTheme.bodyMedium?.color),
                  ),
                  const SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
