<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Complaint;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    // List complaints (traveler: only their own via ?mine=1, admin: all)
    public function index(Request $request)
    {
        $query = Complaint::with(['booking.package', 'user']);

        if ($request->boolean('mine')) {
            $query->where('user_id', $request->user()->id);
        }

        return response()->json($query->latest('complaint_id')->get());
    }

    public function show($id)
    {
        $complaint = Complaint::with(['booking.package', 'user'])->findOrFail($id);

        return response()->json($complaint);
    }

    // File a complaint about a booking
    public function store(Request $request)
    {
        $validated = $request->validate([
            'booking_id' => 'required|exists:bookings,booking_id',
            'subject' => 'required|string|max:150',
        ]);

        $complaint = Complaint::create([
            'booking_id' => $validated['booking_id'],
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'status' => 'open',
        ]);

        return response()->json($complaint->load(['booking.package', 'user']), 201);
    }

    // Admin resolves/updates a complaint's status
    public function update(Request $request, $id)
    {
        $complaint = Complaint::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,resolved,rejected',
        ]);

        $complaint->update($validated);

        return response()->json($complaint);
    }

    public function destroy($id)
    {
        Complaint::findOrFail($id)->delete();

        return response()->json(['message' => 'Complaint deleted successfully']);
    }
}
