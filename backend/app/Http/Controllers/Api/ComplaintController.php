<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Complaint;
use App\Models\Notification;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    // Admin: all support requests. Traveler: only their own.
    public function index(Request $request)
    {
        $query = Complaint::with(['booking.package', 'user']);

        if ($request->user()->role !== 'admin' || $request->boolean('mine')) {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->latest('complaint_id')->get());
    }

    public function show(Request $request, $id)
    {
        $complaint = Complaint::with(['booking.package', 'user'])->findOrFail($id);

        if ($request->user()->role !== 'admin' && $complaint->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only view your own support requests.'], 403);
        }

        return response()->json($complaint);
    }

    // A traveler raises a support request about one of their reservations
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,booking_id',
            'subject' => 'required|string|max:150',
        ]);

        $booking = Booking::with('package')->findOrFail($validated['booking_id']);

        if ($booking->traveler_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only raise requests about your own reservations.'], 403);
        }

        $complaint = Complaint::create([
            'booking_id' => $booking->booking_id,
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'status' => 'open',
        ]);

        Notification::toAdmins(
            'complaint_new',
            "{$request->user()->name} opened a support request about \"" . ($booking->package?->title ?? "reservation #{$booking->booking_id}") . '".'
        );

        return response()->json($complaint->load(['booking.package', 'user']), 201);
    }

    // Admin updates the status and the traveler is told about it
    public function update(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,resolved,rejected',
        ]);

        $changed = $complaint->status !== $validated['status'];
        $complaint->update($validated);

        if ($changed) {
            $words = [
                'open' => 'reopened',
                'in_progress' => 'being looked into',
                'resolved' => 'marked as resolved',
                'rejected' => 'closed without action',
            ];

            Notification::create([
                'user_id' => $complaint->user_id,
                'type' => 'complaint_status_updated',
                'message' => "Your support request \"{$complaint->subject}\" is now {$words[$validated['status']]}.",
                'is_read' => false,
            ]);
        }

        return response()->json($complaint);
    }

    public function destroy($id)
    {
        Complaint::findOrFail($id)->delete();

        return response()->json(['message' => 'Complaint deleted successfully']);
    }
}
