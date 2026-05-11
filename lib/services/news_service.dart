import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../models/news_model.dart';

class NewsService {
  final String baseUrl = 'https://blogit.freedomforexacademy.com/api';

  bool _isConfigured() {
    return baseUrl.contains('freedomforexacademy');
  }

  bool _isJsonResponse(http.Response response) {
    final contentType = response.headers['content-type'] ?? '';
    return contentType.contains('application/json');
  }

  Future<List<String>> getCategories() async {
    if (!_isConfigured()) return ["All News", "Tech", "Science", "Entertainment", "Health", "Sports", "Climate"];
    try {
      final response = await http.get(Uri.parse('$baseUrl/blog-list'));
      if (response.statusCode == 200 && _isJsonResponse(response)) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] is List) {
          final List<dynamic> cats = data['data'];
          final names = cats.map((e) => e['name'].toString()).toList();
          return ["All News", ...names];
        }
      }
    } catch (e) {
      print('Error getting categories: $e');
    }
    return ["All News", "Tech", "Science", "Entertainment", "Health", "Sports", "Climate"];
  }

  Future<List<Story>> getStories() async {
    if (!_isConfigured()) {
       return [
        Story(id: 1, imageUrl: "https://picsum.photos/seed/temple/200/200"),
        Story(id: 2, imageUrl: "https://picsum.photos/seed/city/200/200"),
        Story(id: 3, imageUrl: "https://picsum.photos/seed/street/200/200"),
        Story(id: 4, imageUrl: "https://picsum.photos/seed/classic/200/200"),
        Story(id: 5, imageUrl: "https://picsum.photos/seed/forest/200/200"),
      ];
    }
    try {
      final response = await http.get(Uri.parse('$baseUrl/get-app-home-page'));
      if (response.statusCode == 200 && _isJsonResponse(response)) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null && data['data']['stories'] != null) {
          final List<dynamic> stories = data['data']['stories'];
          return stories.map((json) => Story.fromJson(json)).toList();
        }
      }
    } catch (e) {
      print('Error getting stories: $e');
    }
    return [];
  }

  Future<List<FeaturedStory>> getFeatured() async {
    if (!_isConfigured()) {
      return [
        FeaturedStory(
          id: 1,
          title: "MacBook Pro mit M4: Displays liegen im Zeitplan für Launch im Herbst",
          imageUrl: "https://picsum.photos/seed/laptop/800/450",
          likes: 124,
          category: "Tech",
        ),
      ];
    }
    try {
      final response = await http.get(Uri.parse('$baseUrl/get-app-home-page'));
      if (response.statusCode == 200 && _isJsonResponse(response)) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] != null && data['data']['featured'] != null) {
          final List<dynamic> featured = data['data']['featured'];
          return featured.map((json) => FeaturedStory.fromJson(json)).toList();
        }
      }
      
      // Fallback to blogs if featured is empty
      final blogs = await getBreaking();
      if (blogs.isNotEmpty) {
        return blogs.take(3).map((b) => FeaturedStory(
          id: b.id,
          title: b.title,
          imageUrl: b.imageUrl,
          likes: 42,
          category: b.category,
        )).toList();
      }
    } catch (e) {
      print('Error getting featured: $e');
    }
    return [];
  }

  Future<List<NewsItem>> getBreaking() async {
    if (!_isConfigured()) {
       return [
        NewsItem(
          id: 1,
          title: "Demo Breaking News",
          summary: "This is a demo summary.",
          category: "Climate",
          date: "21 Aug 2024",
          imageUrl: "https://picsum.photos/seed/climate/400/300",
          isSaved: false,
          author: "Elena Mitrovic",
          authorAvatar: "https://i.pravatar.cc/150?u=elena",
          content: "Demo content.",
        ),
      ];
    }
    try {
      final response = await http.get(Uri.parse('$baseUrl/blog-list'));
      if (response.statusCode == 200 && _isJsonResponse(response)) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['data'] is List) {
          final List<NewsItem> allBlogs = [];
          final List<dynamic> categories = data['data'];
          
          for (var cat in categories) {
            if (cat['blogs'] != null && cat['blogs']['data'] is List) {
              final List<dynamic> blogs = cat['blogs']['data'];
              for (var blog in blogs) {
                DateTime? dt = DateTime.tryParse(blog['created_at'] ?? '');
                String formattedDate = dt != null ? DateFormat('dd MMM yyyy').format(dt) : 'Today';
                
                allBlogs.add(NewsItem(
                  id: blog['id'],
                  title: blog['title'] ?? 'Untitled',
                  summary: blog['description'] ?? 'No summary',
                  category: cat['name'] ?? 'General',
                  date: formattedDate,
                  imageUrl: blog['background_image'] ?? 'https://picsum.photos/seed/${blog['id']}/400/300',
                  isSaved: false,
                  author: blog['source_name'] ?? 'OnePlus News',
                  authorAvatar: 'https://i.pravatar.cc/150?u=${blog['id']}',
                  content: blog['description'] ?? 'No content',
                ));
              }
            }
          }
          return allBlogs;
        }
      }
    } catch (e) {
      print('Error getting breaking: $e');
    }
    return [];
  }
}
