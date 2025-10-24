<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RestaurantController;

Route::post('/restaurants', [RestaurantController::class, 'store']);
Route::get('/restaurants/search', [RestaurantController::class, 'search']);
Route::get('/restaurants', [App\Http\Controllers\Api\RestaurantController::class, 'index']);
