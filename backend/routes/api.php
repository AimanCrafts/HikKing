<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\GuideController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\TripController;

// Public Routes
Route::get('/destinations', [DestinationController::class, 'index']);
Route::get('/destinations/{id}', [DestinationController::class, 'show']);
Route::get('/packages', [PackageController::class, 'index']);
Route::get('/packages/{id}', [PackageController::class, 'show']);
Route::get('/guides', [GuideController::class, 'index']);
Route::get('/guides/{id}', [GuideController::class, 'show']);

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    // Guide Profile & Verification
    Route::put('/guide/profile', [GuideController::class, 'updateProfile']);
    Route::post('/guide/verification-documents', [GuideController::class, 'uploadDocument']);
    Route::get('/guide/verification-status', [GuideController::class, 'verificationStatus']);
    Route::put('/admin/guides/{id}/verify', [GuideController::class, 'verifyGuide']);
    
    // Package Management
    Route::get('/my-packages', [PackageController::class, 'myPackages']);
    Route::post('/packages', [PackageController::class, 'store']);
    Route::put('/packages/{id}', [PackageController::class, 'update']);
    Route::delete('/packages/{id}', [PackageController::class, 'destroy']);
    Route::post('/packages/{packageId}/itineraries', [PackageController::class, 'addItinerary']);
    Route::delete('/packages/{packageId}/itineraries/{itineraryId}', [PackageController::class, 'removeItinerary']);
    
    // Bookings (Traveler)
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
    
    // Guide Booking Management
    Route::get('/guide/bookings', [BookingController::class, 'guideBookings']);
    Route::put('/guide/bookings/{id}/status', [BookingController::class, 'updateStatus']);
    
    // Trips
    Route::get('/trips', [TripController::class, 'index']);
    Route::get('/trips/{id}', [TripController::class, 'show']);
    Route::post('/trips/{id}/cancel', [TripController::class, 'cancel']);
    Route::put('/trips/{id}/status', [TripController::class, 'updateStatus']);
});
