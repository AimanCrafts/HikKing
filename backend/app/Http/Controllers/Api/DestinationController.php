<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    // Get all destinations
    public function index()
    {
        $destinations = Destination::with('packages')->get();

        return response()->json($destinations);
    }

    // Get a single destination
    public function show($id)
    {
        $destination = Destination::with([
            'packages.itineraries',
        ])->findOrFail($id);

        return response()->json($destination);
    }

    // Create a new destination
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
        ]);

        $destination = Destination::create($validated);

        return response()->json($destination, 201);
    }

    // Update a destination
    public function update(Request $request, $id)
    {
        $destination = Destination::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
        ]);

        $destination->update($validated);

        return response()->json($destination);
    }

    // Delete a destination
    public function destroy($id)
    {
        $destination = Destination::findOrFail($id);

        $destination->delete();

        return response()->json([
            'message' => 'Destination deleted successfully'
        ]);
    }
}
