<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    // Public: only published packages
    public function index()
    {
        $packages = Package::with([
            'destination',
            'guideProfile.user',
            'itineraries',
            'categories'
        ])
        ->where('status', 'published')
        ->get();

        return response()->json($packages);
    }

    public function show($id)
    {
        $package = Package::with([
            'destination',
            'guideProfile.user',
            'itineraries',
            'categories',
            'hotels'
        ])->findOrFail($id);

        return response()->json($package);
    }

    // Admin: create a new package for a guide
    public function store(Request $request)
    {
        $validated = $request->validate([
            'destination_id' => 'required|exists:destinations,destination_id',
            'guide_profile_id' => 'required|exists:guide_profiles,id',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'duration_days' => 'required|integer|min:1',
            'duration_nights' => 'nullable|integer|min:0',
            'price' => 'required|numeric|min:0',
            'max_travelers' => 'nullable|integer|min:1',
            'status' => 'sometimes|string|in:draft,published,archived',
            'image_url' => 'nullable|string|max:500',
        ]);

        $validated['status'] = $validated['status'] ?? 'draft';

        $package = Package::create($validated);

        return response()->json($package->load(['destination', 'guideProfile.user']), 201);
    }

    // Admin: update a package's own attributes
    public function update(Request $request, $id)
    {
        $package = Package::findOrFail($id);

        $validated = $request->validate([
            'destination_id' => 'sometimes|exists:destinations,destination_id',
            'guide_profile_id' => 'sometimes|exists:guide_profiles,id',
            'title' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'duration_days' => 'sometimes|integer|min:1',
            'duration_nights' => 'nullable|integer|min:0',
            'price' => 'sometimes|numeric|min:0',
            'max_travelers' => 'nullable|integer|min:1',
            'status' => 'sometimes|string|in:draft,published,archived',
            'image_url' => 'nullable|string|max:500',
        ]);

        $package->update($validated);

        return response()->json($package->load(['destination', 'guideProfile.user']));
    }

    public function destroy($id)
    {
        Package::findOrFail($id)->delete();

        return response()->json(['message' => 'Package deleted successfully']);
    }

    // Assign/replace the categories linked to a package (admin use)
    public function syncCategories(Request $request, $id)
    {
        $package = Package::findOrFail($id);

        $validated = $request->validate([
            'category_ids' => 'required|array',
            'category_ids.*' => 'exists:categories,category_id',
        ]);

        $package->categories()->sync($validated['category_ids']);

        return response()->json($package->load('categories'));
    }

    // Assign/replace the hotels linked to a package (admin use)
    public function syncHotels(Request $request, $id)
    {
        $package = Package::findOrFail($id);

        $validated = $request->validate([
            'hotel_ids' => 'required|array',
            'hotel_ids.*' => 'exists:hotels,hotel_id',
        ]);

        $package->hotels()->sync($validated['hotel_ids']);

        return response()->json($package->load('hotels'));
    }

    // Replace a package's full day-by-day itinerary (admin use)
    public function syncItinerary(Request $request, $id)
    {
        $package = Package::findOrFail($id);

        $validated = $request->validate([
            'itinerary' => 'required|array',
            'itinerary.*.day_number' => 'required|integer|min:1',
            'itinerary.*.title' => 'required|string|max:150',
            'itinerary.*.activity_description' => 'nullable|string',
        ]);

        $package->itineraries()->delete();

        foreach ($validated['itinerary'] as $day) {
            $package->itineraries()->create($day);
        }

        return response()->json($package->load('itineraries'));
    }
}