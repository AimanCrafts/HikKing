<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\Package;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // Get bookings (admin: all bookings, traveler: only their own via ?mine=1)
    public function index(Request $request)
    {
        $query = Booking::with(['package.destination', 'traveler']);

        if ($request->boolean('mine')) {
            $query->where('traveler_id', $request->user()->id);
        }

        $bookings = $query->latest('booking_id')->get();

        return response()->json($bookings);
    }

    // Get a single booking (with package + traveler joined)
    public function show($id)
    {
        $booking = Booking::with(['package.destination', 'traveler'])->findOrFail($id);

        return response()->json($booking);
    }

    // Create a new booking (authenticated traveler books a package)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'required|exists:packages,id',
            'travel_date' => 'required|date|after_or_equal:today',
            'total_travelers' => 'required|integer|min:1',
        ]);

        $package = Package::with('guideProfile')->findOrFail($validated['package_id']);

        $booking = Booking::create([
            'traveler_id' => $request->user()->id,
            'package_id' => $package->id,
            'travel_date' => $validated['travel_date'],
            'total_travelers' => $validated['total_travelers'],
            'total_price' => $package->price * $validated['total_travelers'],
            'booking_status' => 'pending',
        ]);

        // ERD "Receives" relation: let the package's guide know a traveler
        // just requested a booking on their package.
        $guideUserId = $package->guideProfile?->user_id;
        if ($guideUserId) {
            Notification::create([
                'user_id' => $guideUserId,
                'type' => 'new_booking',
                'message' => "{$request->user()->name} requested a booking for \"{$package->title}\" on {$validated['travel_date']}.",
                'is_read' => false,
            ]);
        }

        return response()->json($booking->load(['package.destination', 'traveler']), 201);
    }

    // Update a booking's status (admin/guide use, e.g. confirm/cancel)
    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $validated = $request->validate([
            'booking_status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);

        $booking->update($validated);

        // Let the traveler know their booking status changed
        Notification::create([
            'user_id' => $booking->traveler_id,
            'type' => 'booking_status_updated',
            'message' => "Your booking #{$booking->booking_id} status changed to \"{$validated['booking_status']}\".",
            'is_read' => false,
        ]);

        return response()->json($booking);
    }

    // Cancel/delete a booking
    public function destroy($id)
    {
        $booking = Booking::findOrFail($id);

        $booking->delete();

        return response()->json([
            'message' => 'Booking deleted successfully'
        ]);
    }
}
