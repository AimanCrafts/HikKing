<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // Public: list reviews (e.g. ?package_id=5 for a package's reviews)
    public function index(Request $request)
    {
        $query = Review::with(['traveler', 'package']);

        if ($request->filled('package_id')) {
            $query->where('package_id', $request->query('package_id'));
        }

        return response()->json($query->latest('review_id')->get());
    }

    public function show($id)
    {
        $review = Review::with(['traveler', 'package'])->findOrFail($id);

        return response()->json($review);
    }

    // Traveler leaves a review for a completed booking
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,booking_id|unique:reviews,booking_id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);

        $review = Review::create([
            'booking_id' => $booking->booking_id,
            'traveler_id' => $booking->traveler_id,
            'package_id' => $booking->package_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        // Recalculate the package's guide's average rating across all their packages
        $guideProfile = $booking->package?->guideProfile;
        if ($guideProfile) {
            $avg = Review::whereHas('package', function ($q) use ($guideProfile) {
                $q->where('guide_profile_id', $guideProfile->id);
            })->avg('rating');

            $guideProfile->update(['rating_avg' => round($avg, 2)]);
        }

        return response()->json($review->load(['traveler', 'package']), 201);
    }

    public function update(Request $request, $id)
    {
        $review = Review::findOrFail($id);

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $review->update($validated);

        return response()->json($review);
    }

    public function destroy($id)
    {
        Review::findOrFail($id)->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}
