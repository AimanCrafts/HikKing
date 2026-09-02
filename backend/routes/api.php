<?php

use Illuminate\Support\Facades\Route;

// Authentication
use App\Http\Controllers\Api\AuthController;

// Main resources
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

// Database operation controllers
use App\Http\Controllers\Api\GuideManagementQueriesController;
use App\Http\Controllers\Api\PackageManagementQueriesController;
use App\Http\Controllers\Api\BookingManagementQueriesController;


/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


/*
|--------------------------------------------------------------------------
| Public Resource Routes
|--------------------------------------------------------------------------
*/

Route::apiResource('destinations', DestinationController::class);

Route::apiResource('packages', PackageController::class);

Route::apiResource('hotels', HotelController::class);

Route::apiResource('categories', CategoryController::class);

Route::apiResource('guide-profiles', GuideProfileController::class);


/*
|--------------------------------------------------------------------------
| Public Review Routes
|--------------------------------------------------------------------------
*/

Route::get('/reviews', [ReviewController::class, 'index']);

Route::get('/reviews/{id}', [ReviewController::class, 'show']);


/*
|--------------------------------------------------------------------------
| Authentication Protected Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', [AuthController::class, 'me']);


    /*
    |--------------------------------------------------------------------------
    | User
    |--------------------------------------------------------------------------
    */

    Route::get('/users', [UserController::class, 'index']);


    /*
    |--------------------------------------------------------------------------
    | Guide Profile
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/guide-profiles-me',
        [GuideProfileController::class, 'me']
    );


    /*
    |--------------------------------------------------------------------------
    | Package Relationships
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/packages/{id}/categories',
        [PackageController::class, 'syncCategories']
    );

    Route::post(
        '/packages/{id}/hotels',
        [PackageController::class, 'syncHotels']
    );

    Route::post(
        '/packages/{id}/itinerary',
        [PackageController::class, 'syncItinerary']
    );


    /*
    |--------------------------------------------------------------------------
    | Bookings
    |--------------------------------------------------------------------------
    */

    Route::apiResource('bookings', BookingController::class);


    /*
    |--------------------------------------------------------------------------
    | Payments
    |--------------------------------------------------------------------------
    */

    Route::apiResource('payments', PaymentController::class);


    /*
    |--------------------------------------------------------------------------
    | Reviews
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/reviews',
        [ReviewController::class, 'store']
    );

    Route::put(
        '/reviews/{id}',
        [ReviewController::class, 'update']
    );

    Route::delete(
        '/reviews/{id}',
        [ReviewController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Complaints
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'complaints',
        ComplaintController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/notifications',
        [NotificationController::class, 'index']
    );

    Route::post(
        '/notifications/{id}/read',
        [NotificationController::class, 'markRead']
    );

    Route::delete(
        '/notifications/{id}',
        [NotificationController::class, 'destroy']
    );


    /*
    |--------------------------------------------------------------------------
    | Verification Documents
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'verification-documents',
        VerificationDocumentController::class
    );
});


/*
|--------------------------------------------------------------------------
| DATABASE OPERATION ROUTES
|--------------------------------------------------------------------------
|
| These routes are specifically for the database assignment.
|
| Each group has:
|
| 1. JOIN
| 2. AGGREGATE FUNCTIONS
| 3. SUBQUERY
|
| They are kept separate so that one member's result does not
| automatically appear in another member's result.
|
|--------------------------------------------------------------------------
*/


Route::prefix('query-results')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | GUIDE MANAGEMENT
    |--------------------------------------------------------------------------
    |
    | Tables:
    |
    | users
    | guide_profiles
    | verification_documents
    | notifications
    | complaints
    |
    */

    Route::get(
        '/guides/join',
        [GuideManagementQueriesController::class, 'join']
    );

    Route::get(
        '/guides/aggregate',
        [GuideManagementQueriesController::class, 'aggregate']
    );

    Route::get(
        '/guides/subquery',
        [GuideManagementQueriesController::class, 'subquery']
    );


    /*
    |--------------------------------------------------------------------------
    | PACKAGE MANAGEMENT
    |--------------------------------------------------------------------------
    |
    | Tables:
    |
    | destinations
    | packages
    | package_itineraries
    | categories
    | package_categories
    |
    */

    Route::get(
        '/packages/join',
        [PackageManagementQueriesController::class, 'join']
    );

    Route::get(
        '/packages/aggregate',
        [PackageManagementQueriesController::class, 'aggregate']
    );

    Route::get(
        '/packages/subquery',
        [PackageManagementQueriesController::class, 'subquery']
    );


    /*
    |--------------------------------------------------------------------------
    | BOOKING MANAGEMENT
    |--------------------------------------------------------------------------
    |
    | Tables:
    |
    | hotels
    | package_hotels
    | bookings
    | payments
    | reviews
    |
    */

    Route::get(
        '/bookings/join',
        [BookingManagementQueriesController::class, 'join']
    );

    Route::get(
        '/bookings/aggregate',
        [BookingManagementQueriesController::class, 'aggregate']
    );

    Route::get(
        '/bookings/subquery',
        [BookingManagementQueriesController::class, 'subquery']
    );
<<<<<<< HEAD
});
=======
});
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
