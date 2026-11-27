<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    private const RELATIONS_LIST = ['destination', 'itineraries', 'categories'];
    private const RELATIONS_ONE = ['destination', 'itineraries', 'categories', 'hotels'];

    // Public route, but an admin token also sees drafts and archived tours
    private function isAdmin(Request $request): bool
    {
        return $request->user('sanctum')?->role === 'admin';
    }

    public function index(Request $request)
    {
        $query = Package::with(self::RELATIONS_LIST);

        if (! $this->isAdmin($request)) {
            $query->where('status', 'published');
        }

        return response()->json($query->latest('id')->get());
    }

    public function show(Request $request, $id)
    {
        $query = Package::with(self::RELATIONS_ONE);

        if (! $this->isAdmin($request)) {
            $query->where('status', 'published');
        }

        return response()->json($query->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'destination_id' => 'required|exists:destinations,destination_id',
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

        return response()->json($package->load(['destination']), 201);
    }

    public function update(Request $request, $id)
    {
        $package = Package::findOrFail($id);

        $validated = $request->validate([
            'destination_id' => 'sometimes|exists:destinations,destination_id',
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

        return response()->json($package->load(['destination']));
    }

    public function destroy($id)
    {
        Package::findOrFail($id)->delete();

        return response()->json(['message' => 'Package deleted successfully']);
    }

    // Replace the categories linked to a package
    public function syncCategories(Request $request, $id)
    {
        $package = Package::findOrFail($id);

        $validated = $request->validate([
            'category_ids' => 'present|array',
            'category_ids.*' => 'exists:categories,category_id',
        ]);

        $package->categories()->sync($validated['category_ids']);

        return response()->json($package->load('categories'));
    }

    // Replace the stays linked to a package
    public function syncHotels(Request $request, $id)
    {
        $package = Package::findOrFail($id);

        $validated = $request->validate([
            'hotel_ids' => 'present|array',
            'hotel_ids.*' => 'exists:hotels,hotel_id',
        ]);

        $package->hotels()->sync($validated['hotel_ids']);

        return response()->json($package->load('hotels'));
    }

    // Replace the day-by-day itinerary. The text may be sent as `description`
    // (what the frontend uses) or the older `activity_description`.
    public function syncItinerary(Request $request, $id)
    {
        $package = Package::findOrFail($id);

        $validated = $request->validate([
            'itinerary' => 'present|array',
            'itinerary.*.day_number' => 'required|integer|min:1',
            'itinerary.*.title' => 'required|string|max:150',
            'itinerary.*.description' => 'nullable|string',
            'itinerary.*.activity_description' => 'nullable|string',
        ]);

        $package->itineraries()->delete();

        foreach ($validated['itinerary'] as $day) {
            $package->itineraries()->create([
                'day_number' => $day['day_number'],
                'title' => $day['title'],
                'description' => $day['description'] ?? $day['activity_description'] ?? null,
            ]);
        }

        return response()->json($package->load('itineraries'));
    }
}
