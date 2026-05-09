import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/news_model.dart';

class NewsService {
  final String baseUrl = 'YOUR_SERVER_URL_HERE/api/news'; // Replace with your actual server URL

  Future<List<String>> getCategories() async {
    final response = await http.get(Uri.parse('$baseUrl/categories'));
    if (response.statusCode == 200) {
      return List<String>.from(json.decode(response.body));
    }
    throw Exception('Failed to load categories');
  }

  Future<List<Story>> getStories() async {
    final response = await http.get(Uri.parse('$baseUrl/stories'));
    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      return data.map((item) => Story.fromJson(item)).toList();
    }
    throw Exception('Failed to load stories');
  }

  Future<List<FeaturedStory>> getFeatured() async {
    final response = await http.get(Uri.parse('$baseUrl/featured'));
    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      return data.map((item) => FeaturedStory.fromJson(item)).toList();
    }
    throw Exception('Failed to load featured stories');
  }

  Future<List<NewsItem>> getBreaking() async {
    final response = await http.get(Uri.parse('$baseUrl/breaking'));
    if (response.statusCode == 200) {
      List data = json.decode(response.body);
      return data.map((item) => NewsItem.fromJson(item)).toList();
    }
    throw Exception('Failed to load breaking news');
  }
}
