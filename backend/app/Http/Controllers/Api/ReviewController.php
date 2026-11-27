<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // Public: list reviews (e.g. ?package_id=5 for one tour)
    public function index(Request $request)
    {
        $query = Review::with(['traveler:id,name', 'package:id,title']);

        if ($request->filled('package_id')) {
            $query->where('package_id', $request->query('package_id'));
        }

        return response()->json($query->latest('review_id')->get());
    }

    public function show($id)
    {
        $review = Review::with(['traveler:id,name', 'package:id,title'])->findOrFail($id);

        return response()->json($review);
    }

    // A traveler reviews a trip of their own that is marked completed
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,booking_id|unique:reviews,booking_id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        $booking = Booking::findOrFail($validated['booking_id']);

        if ($booking->traveler_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only review your own trips.'], 403);
        }

        if ($booking->booking_status !== 'completed') {
            return response()->json(['message' => 'You can review a trip once it is completed.'], 422);
        }

        $review = Review::create([
            'booking_id' => $booking->booking_id,
            'traveler_id' => $booking->traveler_id,
            'package_id' => $booking->package_id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json($review->load(['traveler:id,name', 'package:id,title']), 201);
    }

    public function update(Request $request, $id)
    {
        $review = Review::findOrFail($id);

        if ($request->user()->role !== 'admin' && $review->traveler_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only edit your own reviews.'], 403);
        }

        $validated = $request->validate([
            'rating' => 'sometimes|integer|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        $review->update($validated);

        return response()->json($review);
    }

    public function destroy(Request $request, $id)
    {
        $review = Review::findOrFail($id);

        if ($request->user()->role !== 'admin' && $review->traveler_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only delete your own reviews.'], 403);
        }

        $review->delete();

        return response()->json(['message' => 'Review deleted successfully']);
    }
}
