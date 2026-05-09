import 'package:flutter/material.dart';
import 'dart:async';
import 'models/news_model.dart';
import 'services/news_service.dart';

void main() {
  runApp(const ZenithApp());
}

class ZenithApp extends StatelessWidget {
  const ZenithApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Zenith News',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF000080)),
        useMaterial3: true,
        fontFamily: 'SF Pro Display',
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

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

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final filteredNews = _allBreaking.where((item) => 
      _activeCategory == 'All News' || item.category == _activeCategory
    ).toList();

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
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.abc, color: Colors.white), // Placeholder for logo
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Search Stories',
                      hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),
                      prefixIcon: const Icon(Icons.search, color: Colors.grey),
                      filled: true,
                      fillColor: Colors.grey[100],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(vertical: 0),
                    ),
                  ),
                ),
                const SizedBox(width: 15),
                const Icon(Icons.nightlight_round, color: Colors.grey),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF000080),
        unselectedItemColor: Colors.grey,
        currentIndex: 0,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'HOME'),
          BottomNavigationBarItem(icon: Icon(Icons.play_circle_outline), label: 'SHORTS'),
          BottomNavigationBarItem(icon: Icon(Icons.rss_feed), label: 'FEED'),
          BottomNavigationBarItem(icon: Icon(Icons.grid_view), label: 'CATEGORY'),
          BottomNavigationBarItem(icon: Icon(Icons.settings), label: 'SETTINGS'),
        ],
      ),
      body: SingleChildScrollView(
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
                    onTap: () => setState(() => _activeCategory = cat),
                    child: Container(
                      margin: const EdgeInsets.right(20),
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                      decoration: BoxDecoration(
                        color: isActive ? const Color(0xFF000080) : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        cat,
                        style: TextStyle(
                          color: isActive ? Colors.white : Colors.grey,
                          fontWeight: FontWeight.bold,
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
                itemCount: _featured.length,
                itemBuilder: (context, index) {
                  final item = _featured[index];
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
              children: List.generate(_featured.length, (index) => 
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
                  child: Padding(
                    padding: const EdgeInsets.bottom(20),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(15),
                          child: Image.network(item.imageUrl, width: 100, height: 100, fit: BoxFit.cover),
                        ),
                        const SizedBox(width: 15),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${item.category} • ${item.date}',
                                style: const TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 5),
                              Text(
                                item.title,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                              const SizedBox(height: 5),
                              Text(
                                item.summary,
                                style: TextStyle(color: Colors.grey[600], fontSize: 12),
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
      backgroundColor: Colors.white,
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
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.only(
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
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Color(0xFF333333)),
                  ),
                  const SizedBox(height: 20),
                  Text(
                    news.content,
                    style: TextStyle(fontSize: 16, height: 1.8, color: Colors.grey[800]),
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
