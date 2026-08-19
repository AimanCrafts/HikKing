<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\PackageItinerary;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    /**
     * List published packages (public)
     */
    public function index()
    {
        $packages = Package::with([
            'destination',
            'guideProfile.user',
            'itineraries'
        ])
        ->where('status', 'published')
        ->get();

        return response()->json($packages);
    }

    /**
     * Get a single package (public)
     */
    public function show($id)
    {
        $package = Package::with([
            'destination',
            'guideProfile.user',
            'itineraries'
        ])->findOrFail($id);

        return response()->json($package);
    }

    /**
     * Get guide's own packages (authenticated guide)
     */
    public function myPackages(Request $request)
    {
        $user = $request->user();
        $guide = $user->guideProfile;

        if (!$guide) {
            return response()->json(['message' => 'Guide profile not found'], 404);
        }

        $packages = Package::where('guide_profile_id', $guide->id)
            ->with(['destination', 'itineraries'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($packages);
    }

    /**
     * Create a new package (authenticated guide)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $guide = $user->guideProfile;

        if (!$guide) {
            return response()->json(['message' => 'Guide profile not found'], 403);
        }

        if ($guide->verification_status !== 'verified') {
            return response()->json(['message' => 'Guide must be verified to create packages'], 403);
        }

        $validated = $request->validate([
            'destination_id' => 'required|exists:destinations,id',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'duration_days' => 'required|integer|min:1',
            'duration_nights' => 'required|integer|min:0',
            'price' => 'required|numeric|min:0',
            'max_travelers' => 'nullable|integer|min:1',
            'status' => 'sometimes|in:draft,published',
            'image_url' => 'nullable|string|max:500',
        ]);

        $package = Package::create(array_merge(
            $validated,
            ['guide_profile_id' => $guide->id]
        ));

        return response()->json([
            'message' => 'Package created successfully',
            'package' => $package->load(['destination', 'guideProfile.user', 'itineraries']),
        ], 201);
    }

    /**
     * Update a package (authenticated guide)
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $guide = $user->guideProfile;

        $package = Package::findOrFail($id);

        if ($package->guide_profile_id !== $guide->id) {
            return response()->json(['message' => 'You are not authorized to update this package'], 403);
        }

        $validated = $request->validate([
            'destination_id' => 'sometimes|exists:destinations,id',
            'title' => 'sometimes|string|max:200',
            'description' => 'nullable|string',
            'duration_days' => 'sometimes|integer|min:1',
            'duration_nights' => 'sometimes|integer|min:0',
            'price' => 'sometimes|numeric|min:0',
            'max_travelers' => 'nullable|integer|min:1',
            'status' => 'sometimes|in:draft,published',
            'image_url' => 'nullable|string|max:500',
        ]);

        $package->update($validated);

        return response()->json([
            'message' => 'Package updated successfully',
            'package' => $package->load(['destination', 'guideProfile.user', 'itineraries']),
        ]);
    }

    /**
     * Delete a package (authenticated guide)
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $guide = $user->guideProfile;

        $package = Package::findOrFail($id);

        if ($package->guide_profile_id !== $guide->id) {
            return response()->json(['message' => 'You are not authorized to delete this package'], 403);
        }

        $package->delete();

        return response()->json([
            'message' => 'Package deleted successfully',
        ]);
    }

    /**
     * Add itinerary day to a package (authenticated guide)
     */
    public function addItinerary(Request $request, $packageId)
    {
        $user = $request->user();
        $guide = $user->guideProfile;

        $package = Package::findOrFail($packageId);

        if ($package->guide_profile_id !== $guide->id) {
            return response()->json(['message' => 'You are not authorized to modify this package'], 403);
        }

        $validated = $request->validate([
            'day_number' => 'required|integer|min:1',
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'location' => 'nullable|string|max:255',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
        ]);

        $itinerary = PackageItinerary::create(array_merge(
            $validated,
            ['package_id' => $packageId]
        ));

        return response()->json([
            'message' => 'Itinerary day added successfully',
            'itinerary' => $itinerary,
        ], 201);
    }

    /**
     * Remove an itinerary day
     */
    public function removeItinerary(Request $request, $packageId, $itineraryId)
    {
        $user = $request->user();
        $guide = $user->guideProfile;

        $package = Package::findOrFail($packageId);

        if ($package->guide_profile_id !== $guide->id) {
            return response()->json(['message' => 'You are not authorized to modify this package'], 403);
        }

        $itinerary = PackageItinerary::where('package_id', $packageId)
            ->where('id', $itineraryId)
            ->firstOrFail();

        $itinerary->delete();

        return response()->json([
            'message' => 'Itinerary day removed successfully',
        ]);
    }
}