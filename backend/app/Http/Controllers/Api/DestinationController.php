<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;
<<<<<<< HEAD
use Illuminate\Http\Request;

class DestinationController extends Controller
{
    // Get all destinations
    public function index()
    {
        $destinations = Destination::with('packages')->get();
=======

class DestinationController extends Controller
{
    public function index()
    {
        $destinations = Destination::with('packages')
            ->where('is_active', true)
            ->get();
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad

        return response()->json($destinations);
    }

<<<<<<< HEAD
    // Get a single destination
=======
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
    public function show($id)
    {
        $destination = Destination::with([
            'packages.itineraries',
<<<<<<< HEAD
=======
            'packages.guideProfile.user'
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
        ])->findOrFail($id);

        return response()->json($destination);
    }
<<<<<<< HEAD

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
=======
}
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
