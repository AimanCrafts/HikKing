<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hotel;
use Illuminate\Http\Request;

class HotelController extends Controller
{
    // Get all hotels
    public function index()
    {
        $hotels = Hotel::all();

        return response()->json($hotels);
    }

    // Get a single hotel (with its packages)
    public function show($id)
    {
        $hotel = Hotel::with('packages')->findOrFail($id);

        return response()->json($hotel);
    }

    // Create a new hotel
    public function store(Request $request)
    {
        $validated = $request->validate([
            'hotel_name' => 'required|string|max:150',
            'address' => 'nullable|string|max:255',
            'star_rating' => 'nullable|integer|min:1|max:5',
        ]);

        $hotel = Hotel::create($validated);

        return response()->json($hotel, 201);
    }

    // Update a hotel
    public function update(Request $request, $id)
    {
        $hotel = Hotel::findOrFail($id);

        $validated = $request->validate([
            'hotel_name' => 'required|string|max:150',
            'address' => 'nullable|string|max:255',
            'star_rating' => 'nullable|integer|min:1|max:5',
        ]);

        $hotel->update($validated);

        return response()->json($hotel);
    }

    // Delete a hotel
    public function destroy($id)
    {
        $hotel = Hotel::findOrFail($id);

        $hotel->delete();

        return response()->json([
            'message' => 'Hotel deleted successfully'
        ]);
    }
}
