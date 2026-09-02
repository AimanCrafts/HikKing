<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuideProfile;
use App\Models\VerificationDocument;
use Illuminate\Http\Request;

class VerificationDocumentController extends Controller
{
    // List documents (admin: all, or filter by ?guide_profile_id=)
    public function index(Request $request)
    {
        $query = VerificationDocument::with('guideProfile.user');

        if ($request->filled('guide_profile_id')) {
            $query->where('guide_profile_id', $request->query('guide_profile_id'));
        }

        return response()->json($query->latest('id')->get());
    }

    public function show($id)
    {
        $document = VerificationDocument::with('guideProfile.user')->findOrFail($id);

        return response()->json($document);
    }

    // The logged-in guide uploads a verification document for their own profile
    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_type' => 'required|string|max:50',
            'document_url' => 'required|string|max:500',
        ]);

        $guideProfile = GuideProfile::where('user_id', $request->user()->id)->firstOrFail();

        $document = VerificationDocument::create([
            'guide_profile_id' => $guideProfile->id,
            'document_type' => $validated['document_type'],
            'document_url' => $validated['document_url'],
            'status' => 'pending',
        ]);

        return response()->json($document, 201);
    }

    // Admin approves/rejects a document
    public function update(Request $request, $id)
    {
        $document = VerificationDocument::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $document->update($validated);

        return response()->json($document);
    }

    public function destroy($id)
    {
        VerificationDocument::findOrFail($id)->delete();

        return response()->json(['message' => 'Document deleted successfully']);
    }
}
