<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuideProfile;
use Illuminate\Http\Request;

class GuideProfileController extends Controller
{
    // Get all guide profiles (with linked user, documents, packages)
    public function index()
    {
        $guides = GuideProfile::with([
            'user',
            'verificationDocuments',
            'packages'
        ])->get();

        return response()->json($guides);
    }

    // Get a single guide profile
    public function show($id)
    {
        $guide = GuideProfile::with([
            'user',
            'verificationDocuments',
            'packages'
        ])->findOrFail($id);

        return response()->json($guide);
    }

    // Create a guide profile for an existing user (admin links a user -> guide profile)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id|unique:guide_profiles,user_id',
            'bio' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0|max:100',
            'rating_avg' => 'sometimes|numeric|min:0|max:5',
            'verification_status' => 'sometimes|string|max:20',
        ]);

        $guide = GuideProfile::create($validated);

        return response()->json($guide->load('user'), 201);
    }

    // Update a guide profile (e.g. bio, experience, verification_status)
    public function update(Request $request, $id)
    {
        $guide = GuideProfile::findOrFail($id);

        $validated = $request->validate([
            'bio' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0|max:100',
            'rating_avg' => 'sometimes|numeric|min:0|max:5',
            'verification_status' => 'sometimes|string|max:20',
        ]);

        $guide->update($validated);

        return response()->json($guide->load('user'));
    }

    // Delete a guide profile
    public function destroy($id)
    {
        $guide = GuideProfile::findOrFail($id);

        $guide->delete();

        return response()->json([
            'message' => 'Guide profile deleted successfully'
        ]);
    }

    // Get the logged-in guide's own profile (for the guide dashboard)
    public function me(Request $request)
    {
        $guide = GuideProfile::with(['verificationDocuments', 'packages'])
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        return response()->json($guide);
    }
}