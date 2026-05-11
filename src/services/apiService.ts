import { NewsItem, FeaturedStory } from '../types';

const BASE_URL = 'https://blogit.freedomforexacademy.com/api';

async function handleResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data;
}

export const apiService = {
  async getHomeData(): Promise<{ featured: FeaturedStory[], breaking: NewsItem[] }> {
    try {
      const blogs = await this.getBlogList();
      return {
        featured: blogs.slice(0, 3).map(b => ({
          id: b.id,
          title: b.title,
          imageUrl: b.imageUrl,
          likes: Math.floor(Math.random() * 100),
          category: b.category
        })),
        breaking: blogs
      };
    } catch (error) {
      console.error("Error fetching home data:", error);
      return { featured: [], breaking: [] };
    }
  },

  async getBlogList(page: number = 1): Promise<NewsItem[]> {
    try {
      const response = await fetch(`${BASE_URL}/blog-list?page=${page}`);
      const data = await handleResponse(response);
      
      const allBlogs: NewsItem[] = [];
      // The API returns category objects, each containing a blogs object with a data array
      if (data.data && Array.isArray(data.data)) {
        data.data.forEach((category: any) => {
          if (category.blogs && category.blogs.data && Array.isArray(category.blogs.data)) {
            category.blogs.data.forEach((blog: any) => {
              allBlogs.push({
                id: blog.id,
                title: blog.title || "Untitled",
                summary: blog.description ? blog.description.replace(/<[^>]*>/g, '').substring(0, 150) + "..." : "No description",
                category: category.name || "General",
                date: blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Recently",
                imageUrl: (blog.images && blog.images.length > 0) ? blog.images[0] : (blog.background_image || `https://picsum.photos/seed/${blog.id}/800/450`),
                isSaved: false,
                author: blog.source_name || "OnePlus News",
                authorAvatar: `https://i.pravatar.cc/150?u=${blog.id}`,
                content: blog.description || "No content available"
              });
            });
          }
        });
      }
      return allBlogs;
    } catch (error) {
      console.error("Error fetching blog list:", error);
      return [];
    }
  },

  async getBlogDetail(id: number | string): Promise<NewsItem | null> {
    try {
      const response = await fetch(`${BASE_URL}/blog-detail/${id}`);
      const data = await handleResponse(response);
      const blog = data.data;
      if (!blog) return null;

      return {
        id: blog.id,
        title: blog.title,
        summary: blog.description ? blog.description.replace(/<[^>]*>/g, '').substring(0, 150) + "..." : "No summary available",
        category: blog.category?.name || "General",
        date: blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Recently",
        imageUrl: (blog.images && blog.images.length > 0) ? blog.images[0] : (blog.background_image || `https://picsum.photos/seed/${blog.id}/800/450`),
        isSaved: false,
        author: blog.source_name || "OnePlus News",
        authorAvatar: `https://i.pravatar.cc/150?u=${blog.id}`,
        content: blog.description || "No content available"
      };
    } catch (error) {
      console.error("Error fetching blog detail:", error);
      return null;
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${BASE_URL}/blog-list`);
      const data = await handleResponse(response);
      if (Array.isArray(data.data)) {
        const cats = data.data.map((cat: any) => cat.name);
        return ["All News", ...cats];
      }
      return ["All News", "Tech", "Science", "Entertainment", "Health", "Sports"];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return ["All News", "Tech", "Science", "Entertainment", "Health", "Sports"];
    }
  },

  async updateToken(token: string): Promise<void> {
    if (!BASE_URL) return;
    try {
      await fetch(`${BASE_URL}/update-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    } catch (e) {}
  },

  async submitQuery(queryData: any): Promise<void> {
    if (!BASE_URL) return;
    try {
      await fetch(`${BASE_URL}/submit-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryData)
      });
    } catch (e) {}
  }
};
