<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuideProfile;
use Illuminate\Http\Request;

class GuideProfileController extends Controller
{
    
    public function index()
    {
        $guides = GuideProfile::with([
            'verificationDocuments',
            'packages'
        ])->get();

        return response()->json($guides);
    }

    
    public function show($id)
    {
        $guide = GuideProfile::with([
            'verificationDocuments',
            'packages'
        ])->findOrFail($id);

        return response()->json($guide);
    }

    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'bio' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0|max:100',
            'specialization' => 'nullable|string|max:100',
            'rating_avg' => 'sometimes|numeric|min:0|max:5',
            'verification_status' => 'sometimes|string|max:20',
        ]);

        $guide = GuideProfile::create($validated);

        return response()->json($guide, 201);
    }

    
    public function update(Request $request, $id)
    {
        $guide = GuideProfile::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'bio' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0|max:100',
            'specialization' => 'nullable|string|max:100',
            'rating_avg' => 'sometimes|numeric|min:0|max:5',
            'verification_status' => 'sometimes|string|max:20',
        ]);

        $guide->update($validated);

        return response()->json($guide);
    }

    
    public function destroy($id)
    {
        $guide = GuideProfile::findOrFail($id);

        $guide->delete();

        return response()->json([
            'message' => 'Guide deleted successfully'
        ]);
    }
}