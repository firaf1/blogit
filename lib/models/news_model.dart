class Story {
  final int id;
  final String imageUrl;

  Story({required this.id, required this.imageUrl});

  factory Story.fromJson(Map<String, dynamic> json) {
    return Story(
      id: json['id'],
      imageUrl: json['imageUrl'],
    );
  }
}

class FeaturedStory {
  final int id;
  final String title;
  final String imageUrl;
  final int likes;
  final String category;

  FeaturedStory({
    required this.id,
    required this.title,
    required this.imageUrl,
    required this.likes,
    required this.category,
  });

  factory FeaturedStory.fromJson(Map<String, dynamic> json) {
    return FeaturedStory(
      id: json['id'],
      title: json['title'],
      imageUrl: json['imageUrl'],
      likes: json['likes'],
      category: json['category'] ?? 'All News',
    );
  }
}

class NewsItem {
  final int id;
  final String title;
  final String summary;
  final String category;
  final String date;
  final String imageUrl;
  final bool isSaved;
  final String author;
  final String authorAvatar;
  final String content;

  NewsItem({
    required this.id,
    required this.title,
    required this.summary,
    required this.category,
    required this.date,
    required this.imageUrl,
    required this.isSaved,
    required this.author,
    required this.authorAvatar,
    required this.content,
  });

  factory NewsItem.fromJson(Map<String, dynamic> json) {
    return NewsItem(
      id: json['id'],
      title: json['title'],
      summary: json['summary'],
      category: json['category'],
      date: json['date'],
      imageUrl: json['imageUrl'],
      isSaved: json['isSaved'],
      author: json['author'] ?? 'Anonymous',
      authorAvatar: json['authorAvatar'] ?? 'https://i.pravatar.cc/150?u=news',
      content: json['content'] ?? 'No content available.',
    );
  }
}
