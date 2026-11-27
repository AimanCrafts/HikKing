<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Notification;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    private const METHODS = [
        'bkash', 'nagad', 'rocket', 'visa', 'mastercard', 'amex', 'bank_transfer', 'cash',
    ];

    private const LOCAL_PAID_METHODS = [
        'bkash', 'nagad', 'rocket', 'visa', 'mastercard', 'amex',
    ];

    public function index()
    {
        return Payment::with(['booking.package', 'booking.traveler'])
            ->latest('payment_id')
            ->get();
    }

    public function forBooking(Request $request, $bookingId)
    {
        $booking = Booking::findOrFail($bookingId);
        if ($request->user()->role !== 'admin' && $booking->traveler_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only view payments for your own reservations.'], 403);
        }

        return $booking->payments()->latest('payment_id')->get();
    }

    public function store(Request $request, $bookingId)
    {
        if ($request->user()->role !== 'traveler') {
            return response()->json(['message' => 'Only traveler accounts can make payments.'], 403);
        }

        $validated = $request->validate([
            'payment_method' => 'required|string|in:' . implode(',', self::METHODS),
            'payer_account' => 'nullable|string|digits:4',
        ]);

        $booking = Booking::with('package')->findOrFail($bookingId);
        if ($booking->traveler_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only pay for your own reservation.'], 403);
        }

        if (in_array($booking->booking_status, ['cancelled', 'completed'], true)) {
            return response()->json(['message' => 'This reservation is no longer eligible for payment.'], 422);
        }

        if ($booking->payments()->where('payment_status', 'paid')->exists()) {
            return response()->json(['message' => 'This reservation already has a recorded payment.'], 422);
        }

        if ($booking->payments()->where('payment_status', 'pending')->exists()) {
            return response()->json(['message' => 'A payment record is already awaiting confirmation.'], 422);
        }

        $method = $validated['payment_method'];
        // Local checkout: no credentials or live gateway calls are collected.
        // Cash and bank transfer are awaiting manual confirmation.
        $status = in_array($method, self::LOCAL_PAID_METHODS, true) ? 'paid' : 'pending';

        $payment = DB::transaction(function () use ($booking, $validated, $method, $status) {
            return Payment::create([
                'booking_id' => $booking->booking_id,
                'transaction_id' => 'HIK-' . strtoupper(Str::random(12)),
                'amount' => $booking->total_price,
                'payment_method' => $method,
                'payer_account' => $validated['payer_account'] ?? null,
                'payment_status' => $status,
                'paid_at' => $status === 'paid' ? now() : null,
            ]);
        });

        $message = $status === 'paid'
            ? "{$request->user()->name} recorded a local checkout payment for booking #{$booking->booking_id} ({$payment->transaction_id})."
            : "{$request->user()->name} created a {$method} payment record awaiting confirmation for booking #{$booking->booking_id}.";

        Notification::toAdmins('payment_recorded', $message);

        return response()->json($payment->load('booking'), 201);
    }

    // Admin-only payment status management (no real refund or money movement).
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
        ]);

        $payment = Payment::with('booking')->findOrFail($id);
        $next = $validated['payment_status'];
        $current = $payment->payment_status;

        $allowed = match ($next) {
            'paid' => in_array($current, ['pending', 'failed'], true),
            'failed' => in_array($current, ['pending', 'failed'], true),
            'refunded' => $current === 'paid',
            'pending' => $current === 'failed',
            default => false,
        };

        if (!$allowed && $next !== $current) {
            return response()->json(['message' => "Payment cannot be changed from {$current} to {$next}."], 422);
        }

        $payment->update([
            'payment_status' => $next,
            'paid_at' => $next === 'paid' ? ($payment->paid_at ?? now()) : $payment->paid_at,
        ]);

        Notification::create([
            'user_id' => $payment->booking->traveler_id,
            'type' => 'payment_status_updated',
            'message' => "Payment {$payment->transaction_id} for booking #{$payment->booking_id} is now {$next}.",
            'is_read' => false,
        ]);

        return response()->json($payment->load('booking'));
    }
}
