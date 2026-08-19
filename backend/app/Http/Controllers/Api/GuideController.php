<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuideProfile;
use App\Models\VerificationDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GuideController extends Controller
{
    /**
     * List all verified guides
     */
    public function index()
    {
        $guides = GuideProfile::with('user')
            ->where('verification_status', 'verified')
            ->get();

        return response()->json($guides);
    }

    /**
     * Get a specific guide
     */
    public function show($id)
    {
        $guide = GuideProfile::with(['user', 'packages'])
            ->findOrFail($id);

        return response()->json($guide);
    }

    /**
     * Update guide profile (authenticated guide only)
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $guide = $user->guideProfile;

        if (!$guide) {
            return response()->json(['message' => 'Guide profile not found'], 404);
        }

        $validated = $request->validate([
            'bio' => 'nullable|string',
            'experience_years' => 'nullable|integer|min:0',
            'specialization' => 'nullable|string|max:100',
        ]);

        $guide->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'guide' => $guide->fresh('user'),
        ]);
    }

    /**
     * Upload verification document (authenticated guide only)
     */
    public function uploadDocument(Request $request)
    {
        $user = $request->user();
        $guide = $user->guideProfile;

        if (!$guide) {
            return response()->json(['message' => 'Guide profile not found'], 404);
        }

        $validated = $request->validate([
            'document_type' => 'required|string|in:national_id,passport,driver_license,professional_certificate',
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $path = $request->file('document')->store("verification_documents/{$guide->id}", 'public');

        $document = VerificationDocument::create([
            'guide_profile_id' => $guide->id,
            'document_type' => $validated['document_type'],
            'document_url' => Storage::url($path),
            'status' => 'pending',
        ]);

        if ($guide->verification_status === 'verified') {
            $guide->update(['verification_status' => 'pending']);
        }

        return response()->json([
            'message' => 'Document uploaded successfully',
            'document' => $document,
        ], 201);
    }

    /**
     * Get guide verification status (authenticated guide only)
     */
    public function verificationStatus(Request $request)
    {
        $user = $request->user();
        $guide = $user->guideProfile;

        if (!$guide) {
            return response()->json(['message' => 'Guide profile not found'], 404);
        }

        $documents = $guide->verificationDocuments;

        return response()->json([
            'verification_status' => $guide->verification_status,
            'documents' => $documents,
        ]);
    }

    /**
     * Admin: Verify a guide
     */
    public function verifyGuide(Request $request, $id)
    {
        $guide = GuideProfile::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:verified,rejected,pending',
        ]);
        
        $guide->update(['verification_status' => $validated['status']]);
        
        return response()->json([
            'message' => "Guide verification status updated to {$validated['status']}",
            'guide' => $guide->load('user'),
        ]);
    }
}