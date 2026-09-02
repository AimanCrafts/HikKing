<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\GuideProfileController;
use App\Http\Controllers\Api\VerificationDocumentController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::apiResource('destinations', DestinationController::class);

Route::apiResource('packages', PackageController::class);

Route::apiResource('hotels', HotelController::class);

Route::apiResource('categories', CategoryController::class);

Route::apiResource('guide-profiles', GuideProfileController::class);

// Public: browse a package's reviews (e.g. /reviews?package_id=5)
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/{id}', [ReviewController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/guide-profiles-me', [GuideProfileController::class, 'me']);

    Route::get('/users', [UserController::class, 'index']);

    Route::post('/packages/{id}/categories', [PackageController::class, 'syncCategories']);
    Route::post('/packages/{id}/hotels', [PackageController::class, 'syncHotels']);
    Route::post('/packages/{id}/itinerary', [PackageController::class, 'syncItinerary']);

    Route::apiResource('bookings', BookingController::class);

    Route::apiResource('payments', PaymentController::class);

    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    Route::apiResource('complaints', ComplaintController::class);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    Route::apiResource('verification-documents', VerificationDocumentController::class);
});