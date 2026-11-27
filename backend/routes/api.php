<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\DestinationController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\HotelController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PackageController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes (no login needed)
|--------------------------------------------------------------------------
| Browsing only. Anything that creates, changes or deletes data lives
| further down behind authentication, and the catalogue writes behind the
| admin middleware.
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::apiResource('destinations', DestinationController::class)->only(['index', 'show']);
Route::apiResource('packages', PackageController::class)->only(['index', 'show']);
Route::apiResource('hotels', HotelController::class)->only(['index', 'show']);
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);

Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/{id}', [ReviewController::class, 'show']);

// Approved traveler stories. The controller also reads an optional token so
// travelers can see their own (?mine=1) and admins everything (?all=1).
Route::get('/experiences', [ExperienceController::class, 'index']);


/*
|--------------------------------------------------------------------------
| Signed-in routes (any logged-in user; ownership is checked in controllers)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Account
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
        Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::put('/me/password', [AuthController::class, 'updatePassword']);
    
    // Reservations (a traveler only ever sees and changes their own)
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::put('/bookings/{id}', [BookingController::class, 'update']);

    // Payment records
    Route::get('/bookings/{id}/payments', [PaymentController::class, 'forBooking']);
    Route::post('/bookings/{id}/payments', [PaymentController::class, 'store']);

    // Reviews (completed trips only)
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Support requests
    Route::get('/complaints', [ComplaintController::class, 'index']);
    Route::get('/complaints/{id}', [ComplaintController::class, 'show']);
    Route::post('/complaints', [ComplaintController::class, 'store']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

    // Traveler stories
    Route::post('/experiences', [ExperienceController::class, 'store']);
    Route::delete('/experiences/{id}', [ExperienceController::class, 'destroy']);

    // Saved trips
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::post('/wishlist', [WishlistController::class, 'store']);
    Route::delete('/wishlist/{packageId}', [WishlistController::class, 'destroy']);


    /*
    |--------------------------------------------------------------------------
    | Admin-only routes
    |--------------------------------------------------------------------------
    */

    Route::middleware('admin')->group(function () {

        // Catalogue management (full CRUD, read side is public above)
        Route::apiResource('destinations', DestinationController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('packages', PackageController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('hotels', HotelController::class)->only(['store', 'update', 'destroy']);
        Route::apiResource('categories', CategoryController::class)->only(['store', 'update', 'destroy']);

        Route::post('/packages/{id}/categories', [PackageController::class, 'syncCategories']);
        Route::post('/packages/{id}/hotels', [PackageController::class, 'syncHotels']);
        Route::post('/packages/{id}/itinerary', [PackageController::class, 'syncItinerary']);

        // Payments: admin visibility and status updates
        Route::get('/payments', [PaymentController::class, 'index']);
        Route::put('/payments/{id}', [PaymentController::class, 'update']);

        // Reservation clean-up
        Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

        // Support request handling
        Route::put('/complaints/{id}', [ComplaintController::class, 'update']);
        Route::delete('/complaints/{id}', [ComplaintController::class, 'destroy']);

        // Story moderation
        Route::put('/experiences/{id}', [ExperienceController::class, 'update']);

        // Users
        Route::get('/users', [UserController::class, 'index']);
    });
});
