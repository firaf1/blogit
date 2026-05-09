import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock News Data
  const categories = ["All News", "Tech", "Science", "Entertainment", "Health", "Sports"];
  
  const smallStories = [
    { id: 1, title: "Temple", imageUrl: "https://picsum.photos/seed/temple/200/200" },
    { id: 2, title: "City", imageUrl: "https://picsum.photos/seed/city/200/200" },
    { id: 3, title: "Street", imageUrl: "https://picsum.photos/seed/street/200/200" },
    { id: 4, title: "Classic", imageUrl: "https://picsum.photos/seed/classic/200/200" },
    { id: 5, title: "Forest", imageUrl: "https://picsum.photos/seed/forest/200/200" },
  ];

  const featuredStories = [
    { 
      id: 1, 
      title: "MacBook Pro mit M4: Displays liegen im Zeitplan für Launch im Herbst", 
      subtitle: "The next generation of Apple silicon is almost here.",
      imageUrl: "https://picsum.photos/seed/laptop/800/450",
      likes: 124
    },
    { 
      id: 2, 
      title: "SpaceX Starship: Preparing for the next big leap in Mars exploration", 
      subtitle: "A giant leap for mankind as testing enters final stages.",
      imageUrl: "https://picsum.photos/seed/mars/800/450",
      likes: 85
    }
  ];

  const breakingNews = [
    { 
      id: 1, 
      title: "When will climate change turn life in the US inside down?", 
      summary: "Extreme weather patterns are shifting demographics across the continent as temperatures reach record highs.",
      category: "Climate", 
      date: "21 Aug 2024",
      imageUrl: "https://picsum.photos/seed/climate/400/300",
      isSaved: false
    },
    { 
      id: 2, 
      title: "Giants do exactly what they were supposed to and had to", 
      summary: "A decisive victory at the stadium last night secures their position in the playoffs for the first time in a decade.",
      category: "Sports", 
      date: "20 Aug 2024",
      imageUrl: "https://picsum.photos/seed/baseball/400/300",
      isSaved: true
    },
    { 
      id: 3, 
      title: "New AI breakthrough: Machines can now understand human emotions", 
      summary: "Scientists in Zurich have developed a neural network capable of identifying subtle micro-expressions with 98% accuracy.",
      category: "Tech", 
      date: "19 Aug 2024",
      imageUrl: "https://picsum.photos/seed/ai/400/300",
      isSaved: false
    },
    { 
      id: 4, 
      title: "James Webb Telescope discovers water vapor on a distant exoplanet", 
      summary: "The discovery marks a significant milestone in our search for Earth-like conditions outside our solar system.",
      category: "Science", 
      date: "18 Aug 2024",
      imageUrl: "https://picsum.photos/seed/space/400/300",
      isSaved: false
    }
  ];

  // API Routes
  app.get("/api/news/categories", (req, res) => res.json(categories));
  app.get("/api/news/stories", (req, res) => res.json(smallStories));
  app.get("/api/news/featured", (req, res) => res.json(featuredStories));
  app.get("/api/news/breaking", (req, res) => res.json(breakingNews));

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
