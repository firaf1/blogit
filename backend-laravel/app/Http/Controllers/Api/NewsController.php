<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function getCategories()
    {
        return response()->json([
            "All News", "Tech", "Science", "Entertainment", "Health", "Sports"
        ]);
    }

    public function getStories()
    {
        return response()->json([
            ["id" => 1, "title" => "Temple", "imageUrl" => "https://picsum.photos/seed/temple/200/200"],
            ["id" => 2, "title" => "City", "imageUrl" => "https://picsum.photos/seed/city/200/200"],
            ["id" => 3, "title" => "Street", "imageUrl" => "https://picsum.photos/seed/street/200/200"],
            ["id" => 4, "title" => "Classic", "imageUrl" => "https://picsum.photos/seed/classic/200/200"],
            ["id" => 5, "title" => "Forest", "imageUrl" => "https://picsum.photos/seed/forest/200/200"],
        ]);
    }

    public function getFeatured()
    {
        return response()->json([
            [
                "id" => 1,
                "title" => "MacBook Pro mit M4: Displays liegen im Zeitplan",
                "imageUrl" => "https://picsum.photos/seed/laptop/800/450",
                "likes" => 124
            ],
            [
                "id" => 2,
                "title" => "SpaceX Starship: Preparing for Mars expansion",
                "imageUrl" => "https://picsum.photos/seed/mars/800/450",
                "likes" => 85
            ]
        ]);
    }

    public function getBreaking()
    {
        return response()->json([
            [
                "id" => 1,
                "title" => "When will climate change turn life in the US inside down?",
                "summary" => "Extreme weather patterns are shifting demographics across the continent.",
                "category" => "Climate",
                "date" => "21 Aug 2024",
                "imageUrl" => "https://picsum.photos/seed/climate/400/300",
                "isSaved" => false
            ],
            [
                "id" => 2,
                "title" => "Giants do exactly what they were supposed to",
                "summary" => "A decisive victory at the stadium last night secures their position.",
                "category" => "Sports",
                "date" => "20 Aug 2024",
                "imageUrl" => "https://picsum.photos/seed/baseball/400/300",
                "isSaved" => true
            ]
        ]);
    }
}
