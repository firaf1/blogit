export interface Story {
  id: number;
  title: string;
  imageUrl: string;
}

export interface FeaturedStory {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  likes: number;
  category?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
  date: string;
  imageUrl: string;
  isSaved: boolean;
  author?: string;
  authorAvatar?: string;
  content?: string;
  views?: number;
}
