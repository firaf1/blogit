export const CATEGORIES = ["All News", "Tech", "Science", "Entertainment", "Health", "Sports", "Climate"];

export const STORIES = [
  { id: 1, title: "Temple", imageUrl: "https://picsum.photos/seed/temple/200/200" },
  { id: 2, title: "City", imageUrl: "https://picsum.photos/seed/city/200/200" },
  { id: 3, title: "Street", imageUrl: "https://picsum.photos/seed/street/200/200" },
  { id: 4, title: "Classic", imageUrl: "https://picsum.photos/seed/classic/200/200" },
  { id: 5, title: "Forest", imageUrl: "https://picsum.photos/seed/forest/200/200" },
];

export const FEATURED_STORIES = [
  { 
    id: 1, 
    title: "MacBook Pro mit M4: Displays liegen im Zeitplan für Launch im Herbst", 
    subtitle: "The next generation of Apple silicon is almost here.",
    imageUrl: "https://picsum.photos/seed/laptop/800/450",
    likes: 124,
    category: "Tech"
  },
  { 
    id: 2, 
    title: "SpaceX Starship: Preparing for the next big leap in Mars exploration", 
    subtitle: "A giant leap for mankind as testing enters final stages.",
    imageUrl: "https://picsum.photos/seed/mars/800/450",
    likes: 85,
    category: "Science"
  }
];

export const BREAKING_NEWS = [
  { 
    id: 1, 
    title: "When will climate change turn life in the US inside down?", 
    summary: "Extreme weather patterns are shifting demographics across the continent as temperatures reach record highs.",
    category: "Climate", 
    date: "21 Aug 2024",
    imageUrl: "https://picsum.photos/seed/climate/400/300",
    isSaved: false,
    author: "Elena Mitrovic",
    authorAvatar: "https://i.pravatar.cc/150?u=elena",
    content: "The landscape of North America is undergoing a profound transformation. As drought conditions intensify in the West and sea levels rise along the Eastern seaboard, millions are reconsidering their long-term residency. This article explores the economic and social implications of climate-driven migration within the United States."
  },
  { 
    id: 2, 
    title: "Giants do exactly what they were supposed to and had to", 
    summary: "A decisive victory at the stadium last night secures their position in the playoffs for the first time in a decade.",
    category: "Sports", 
    date: "20 Aug 2024",
    imageUrl: "https://picsum.photos/seed/baseball/400/300",
    isSaved: true,
    author: "Marcus Thorne",
    authorAvatar: "https://i.pravatar.cc/150?u=marcus",
    content: "The atmospheric pressure at the stadium was electric. With the bases loaded and two outs in the bottom of the ninth, the Giants didn't just win a game; they reclaimed their legacy. The 5-4 victory over the Titans is being hailed as the greatest comeback of the season."
  },
  { 
    id: 3, 
    title: "New AI breakthrough: Machines can now understand human emotions", 
    summary: "Scientists in Zurich have developed a neural network capable of identifying subtle micro-expressions with 98% accuracy.",
    category: "Tech", 
    date: "19 Aug 2024",
    imageUrl: "https://picsum.photos/seed/ai/400/300",
    isSaved: false,
    author: "Dr. Sarah Chen",
    authorAvatar: "https://i.pravatar.cc/150?u=sarah",
    content: "Artificial Intelligence has long been criticized for its lack of empathy. However, the new 'EMO-Net' framework changes the game. By analyzing over 40 distinct facial muscle movements in real-time, the system can distinguish between genuine smiles and forced ones, opening new doors for mental health diagnostics."
  },
  { 
    id: 4, 
    title: "James Webb Telescope discovers water vapor on a distant exoplanet", 
    summary: "The discovery marks a significant milestone in our search for Earth-like conditions outside our solar system.",
    category: "Science", 
    date: "18 Aug 2024",
    imageUrl: "https://picsum.photos/seed/space/400/300",
    isSaved: false,
    author: "Prof. Julian Vane",
    authorAvatar: "https://i.pravatar.cc/150?u=julian",
    content: "Orbiting a red dwarf star 40 light-years away, exoplanet GJ 1214 b has long been a mystery to astronomers. Recent spectroscopic data from the James Webb Space Telescope confirms a thick, steam-rich atmosphere. While the surface temperature is likely too hot for liquid water, the presence of vapor suggests a complex hydrological cycle."
  }
];
