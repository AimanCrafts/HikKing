<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $trips = Trip::where('user_id', $user->id)
            ->with(['package.destination', 'package.guideProfile.user', 'itineraries'])
            ->orderBy('start_date', 'asc')
            ->get();
        return response()->json($trips);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $trip = Trip::with([
            'package.destination',
            'package.guideProfile.user',
            'itineraries',
            'booking'
        ])->findOrFail($id);
        if ($trip->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        return response()->json($trip);
    }

    public function cancel(Request $request, $id)
    {
        $user = $request->user();
        $trip = Trip::findOrFail($id);
        if ($trip->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        if ($trip->status === 'completed') {
            return response()->json(['message' => 'Completed trips cannot be cancelled'], 422);
        }
        $trip->update(['status' => 'cancelled']);
        if ($trip->booking) {
            $trip->booking->update(['status' => 'cancelled']);
        }
        return response()->json(['message' => 'Trip cancelled successfully', 'trip' => $trip]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = $request->user();
        $guide = $user->guideProfile;
        if (!$guide) {
            return response()->json(['message' => 'Only guides can update trip status'], 403);
        }
        $trip = Trip::findOrFail($id);
        if ($trip->package->guide_profile_id !== $guide->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $validated = $request->validate([
            'status' => 'required|in:upcoming,ongoing,completed,cancelled',
        ]);
        $trip->update(['status' => $validated['status']]);
        return response()->json(['message' => 'Trip status updated', 'trip' => $trip->load(['package.destination', 'itineraries'])]);
    }
}
