<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    // List payments (traveler: only their own via ?mine=1, admin: all)
    public function index(Request $request)
    {
        $query = Payment::with('booking.package');

        if ($request->boolean('mine')) {
            $query->whereHas('booking', function ($q) use ($request) {
                $q->where('traveler_id', $request->user()->id);
            });
        }

        return response()->json($query->latest('payment_id')->get());
    }

    public function show($id)
    {
        $payment = Payment::with('booking.package')->findOrFail($id);

        return response()->json($payment);
    }

    // Pay for a booking
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,booking_id',
        ]);

        $booking = Booking::with('package.guideProfile')->findOrFail($validated['booking_id']);

        $payment = Payment::create([
            'booking_id' => $booking->booking_id,
            'transaction_id' => 'TXN-' . strtoupper(Str::random(10)),
            'amount' => $booking->total_price,
            'payment_status' => 'paid',
        ]);

        // Confirm the booking once payment succeeds
        $booking->update(['booking_status' => 'confirmed']);

        // Notify the guide who owns the package that a booking is paid & confirmed
        $guideUserId = $booking->package?->guideProfile?->user_id;
        if ($guideUserId) {
            Notification::create([
                'user_id' => $guideUserId,
                'type' => 'booking_confirmed',
                'message' => "A new booking for \"{$booking->package->title}\" has been confirmed.",
                'is_read' => false,
            ]);
        }

        // Notify the traveler as well
        Notification::create([
            'user_id' => $booking->traveler_id,
            'type' => 'payment_success',
            'message' => "Your payment for booking #{$booking->booking_id} was successful.",
            'is_read' => false,
        ]);

        return response()->json($payment->load('booking.package'), 201);
    }

    public function update(Request $request, $id)
    {
        $payment = Payment::findOrFail($id);

        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
        ]);

        $payment->update($validated);

        return response()->json($payment);
    }

    public function destroy($id)
    {
        Payment::findOrFail($id)->delete();

        return response()->json(['message' => 'Payment deleted successfully']);
    }
}
