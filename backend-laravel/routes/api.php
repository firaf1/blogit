<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NewsController;

Route::prefix('news')->group(function () {
    Route::get('/categories', [NewsController::class, 'getCategories']);
    Route::get('/stories', [NewsController::class, 'getStories']);
    Route::get('/featured', [NewsController::class, 'getFeatured']);
    Route::get('/breaking', [NewsController::class, 'getBreaking']);
});
