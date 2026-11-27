<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\Package;
use Illuminate\Http\Request;

/**
 * Bookings are "reservation requests": a traveler asks for a date, an admin
 * confirms it. No online payment is involved.
 */
class BookingController extends Controller
{
    private const STATUS_WORDS = [
        'pending' => 'set back to requested',
        'confirmed' => 'confirmed',
        'cancelled' => 'cancelled',
        'completed' => 'marked as completed',
    ];

    // Admin: every reservation. Traveler: only their own, whatever is asked for.
    public function index(Request $request)
    {
        $query = Booking::with(['package.destination', 'traveler', 'payments']);

        if ($request->user()->role !== 'admin' || $request->boolean('mine')) {
            $query->where('traveler_id', $request->user()->id);
        }

        return response()->json($query->latest('booking_id')->get());
    }

    public function show(Request $request, $id)
    {
        $booking = Booking::with(['package.destination', 'traveler', 'payments'])->findOrFail($id);

        if ($request->user()->role !== 'admin' && $booking->traveler_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only view your own reservations.'], 403);
        }

        return response()->json($booking);
    }

    // A traveler sends a reservation request for a published tour
    public function store(Request $request)
    {
        if ($request->user()->role !== 'traveler') {
            return response()->json(['message' => 'Only traveler accounts can make reservations.'], 403);
        }

        $validated = $request->validate([
            'package_id' => 'required|exists:packages,id',
            'travel_date' => 'required|date|after_or_equal:today',
            'total_travelers' => 'required|integer|min:1|max:50',
        ]);

        $package = Package::findOrFail($validated['package_id']);

        if ($package->status !== 'published') {
            return response()->json(['message' => 'This tour is not open for reservations.'], 422);
        }

        if ($package->max_travelers && $validated['total_travelers'] > $package->max_travelers) {
            return response()->json([
                'message' => "This tour takes up to {$package->max_travelers} travelers.",
            ], 422);
        }

        $booking = Booking::create([
            'traveler_id' => $request->user()->id,
            'package_id' => $package->id,
            'travel_date' => $validated['travel_date'],
            'total_travelers' => $validated['total_travelers'],
            'total_price' => $package->price * $validated['total_travelers'],
            'booking_status' => 'pending',
        ]);

        Notification::toAdmins(
            'new_booking',
            "{$request->user()->name} requested \"{$package->title}\" on {$validated['travel_date']} for {$validated['total_travelers']} traveler(s)."
        );

        return response()->json($booking->load(['package.destination', 'traveler', 'payments']), 201);
    }

    /**
     * Admin: set any status.
     * Traveler: can only withdraw (cancel) their own request while it is still pending.
     */
    public function update(Request $request, $id)
    {
        $booking = Booking::with('package')->findOrFail($id);
        $user = $request->user();

        $validated = $request->validate([
            'booking_status' => 'required|in:pending,confirmed,cancelled,completed',
        ]);
        $status = $validated['booking_status'];
        $title = $booking->package?->title ?? "reservation #{$booking->booking_id}";

        if ($user->role !== 'admin') {
            if ($booking->traveler_id !== $user->id) {
                return response()->json(['message' => 'You can only change your own reservations.'], 403);
            }
            if ($status !== 'cancelled' || $booking->booking_status !== 'pending') {
                return response()->json([
                    'message' => 'You can only cancel a request that has not been confirmed yet. Contact support for confirmed trips.',
                ], 403);
            }

            if ($booking->payments()->where('payment_status', 'paid')->exists()) {
                return response()->json([
                    'message' => 'This reservation has a recorded payment. Contact support to request cancellation and review any refund.',
                ], 422);
            }

            $booking->update(['booking_status' => 'cancelled']);
            Notification::toAdmins('booking_cancelled', "{$user->name} cancelled their request for \"{$title}\".");

            return response()->json($booking);
        }

        $changed = $booking->booking_status !== $status;
        $booking->update(['booking_status' => $status]);

        if ($changed) {
            Notification::create([
                'user_id' => $booking->traveler_id,
                'type' => 'booking_status_updated',
                'message' => "Your reservation for \"{$title}\" was " . self::STATUS_WORDS[$status] . '.',
                'is_read' => false,
            ]);
        }

        return response()->json($booking);
    }

    // Admin only (route-level): permanently remove a reservation record
    public function destroy($id)
    {
        Booking::findOrFail($id)->delete();

        return response()->json(['message' => 'Booking deleted successfully']);
    }
}
