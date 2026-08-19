<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Package;
use App\Models\Trip;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $bookings = Booking::where('user_id', $user->id)
            ->with(['package.destination', 'package.guideProfile.user'])
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'package_id' => 'required|exists:packages,id',
            'travel_date' => 'required|date|after:today',
            'total_travelers' => 'required|integer|min:1',
            'special_requests' => 'nullable|string',
        ]);
        $package = Package::findOrFail($validated['package_id']);
        if ($package->status !== 'published') {
            return response()->json(['message' => 'This package is not available for booking'], 422);
        }
        if ($package->max_travelers && $validated['total_travelers'] > $package->max_travelers) {
            return response()->json(['message' => "Maximum {$package->max_travelers} travelers allowed"], 422);
        }
        $totalPrice = $package->price * $validated['total_travelers'];
        $booking = Booking::create([
            'user_id' => $user->id,
            'package_id' => $validated['package_id'],
            'travel_date' => $validated['travel_date'],
            'total_travelers' => $validated['total_travelers'],
            'total_price' => $totalPrice,
            'status' => 'pending',
            'special_requests' => $validated['special_requests'] ?? null,
        ]);
        return response()->json([
            'message' => 'Booking created successfully',
            'booking' => $booking->load(['package.destination', 'package.guideProfile.user']),
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::with(['package.destination', 'package.guideProfile.user'])->findOrFail($id);
        if ($booking->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($booking);
    }

    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $booking = Booking::findOrFail($id);
        if ($booking->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if ($booking->status === 'cancelled') {
            return response()->json(['message' => 'Booking is already cancelled'], 422);
        }
        if ($booking->status === 'completed') {
            return response()->json(['message' => 'Completed bookings cannot be cancelled'], 422);
        }
        $booking->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Booking cancelled successfully', 'booking' => $booking]);
    }

    public function guideBookings(Request $request)
    {
        $user = $request->user();
        $guide = $user->guideProfile;
        if (!$guide) {
            return response()->json(['message' => 'Guide profile not found'], 404);
        }
        $bookings = Booking::with(['user', 'package.destination'])
            ->whereHas('package', function ($query) use ($guide) {
                $query->where('guide_profile_id', $guide->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($bookings);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        $guide = $user->guideProfile;
        if (!$guide) {
            return response()->json(['message' => 'Guide profile not found'], 404);
        }
        $booking = Booking::findOrFail($id);
        if ($booking->package->guide_profile_id !== $guide->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $validated = $request->validate(['status' => 'required|in:confirmed,cancelled,completed']);
        $booking->update(['status' => $validated['status']]);

        // Create trip when booking is confirmed
        if ($validated['status'] === 'confirmed') {
            $package = $booking->package;
            $startDate = $booking->travel_date;
            $endDate = $startDate->copy()->addDays($package->duration_days - 1);
            
            $trip = Trip::create([
                'user_id' => $booking->user_id,
                'booking_id' => $booking->id,
                'package_id' => $booking->package_id,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'status' => 'upcoming',
            ]);
            
            return response()->json([
                'message' => 'Booking confirmed and trip created',
                'booking' => $booking->load(['user', 'package']),
                'trip' => $trip,
            ]);
        }

        return response()->json(['message' => 'Booking status updated', 'booking' => $booking->load(['user', 'package'])]);
    }
}
