<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Experience;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

/**
 * Traveler stories ("Share your experience"): photos plus a short write-up.
 *
 * - Anyone can read approved stories.
 * - A traveler with at least one completed trip can share a story.
 * - New stories are "pending" until an admin approves them.
 */
class ExperienceController extends Controller
{
    // Public route that also understands an optional token:
    //   ?mine=1  (traveler) their own stories, any status
    //   ?all=1   (admin)    every story, any status
    public function index(Request $request)
    {
        $user = $request->user('sanctum');

        $query = Experience::with(['user:id,name', 'photos'])->latest('id');

        if ($user && $request->boolean('mine')) {
            $query->where('user_id', $user->id);
        } elseif ($user && $user->role === 'admin' && $request->boolean('all')) {
            // admin sees everything
        } else {
            $query->where('status', 'approved');
        }

        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'traveler') {
            return response()->json(['message' => 'Only traveler accounts can share stories.'], 403);
        }

        $hasCompletedTrip = Booking::where('traveler_id', $user->id)
            ->where('booking_status', 'completed')
            ->exists();

        if (! $hasCompletedTrip) {
            return response()->json([
                'message' => 'You can share a story once one of your trips has been marked completed.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:80',
            'story' => 'nullable|string|max:1200',
            'place' => 'required|string|max:150',
            'photos' => 'nullable|array|max:6',
            'photos.*' => 'image|mimes:jpg,jpeg,png,webp|max:8192',
            'captions' => 'nullable|array',
            'captions.*' => 'nullable|string|max:40',
        ]);

        $files = $request->file('photos', []);

        if (empty($validated['story']) && count($files) === 0) {
            throw ValidationException::withMessages([
                'story' => ['Add a few words or at least one photo.'],
            ]);
        }

        $captions = $validated['captions'] ?? [];

        $experience = DB::transaction(function () use ($user, $validated, $files, $captions) {
            $experience = Experience::create([
                'user_id' => $user->id,
                'title' => $validated['title'],
                'story' => $validated['story'] ?? null,
                'place' => $validated['place'],
                'status' => 'pending',
            ]);

            foreach (array_values($files) as $i => $file) {
                $experience->photos()->create([
                    'path' => $file->store('experiences', 'public'),
                    'caption' => $captions[$i] ?? null,
                    'sort_order' => $i,
                ]);
            }

            return $experience;
        });

        Notification::toAdmins('story_submitted', "{$user->name} shared a story: \"{$experience->title}\". It is waiting for review.");

        return response()->json($experience->load(['user:id,name', 'photos']), 201);
    }

    // Admin: approve, hide or reset a story
    public function update(Request $request, $id)
    {
        $experience = Experience::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $changed = $experience->status !== $validated['status'];
        $experience->update($validated);

        if ($changed && $validated['status'] === 'approved') {
            Notification::create([
                'user_id' => $experience->user_id,
                'type' => 'story_approved',
                'message' => "Your story \"{$experience->title}\" is now on the stories wall.",
                'is_read' => false,
            ]);
        } elseif ($changed && $validated['status'] === 'rejected') {
            Notification::create([
                'user_id' => $experience->user_id,
                'type' => 'story_rejected',
                'message' => "Your story \"{$experience->title}\" was not published.",
                'is_read' => false,
            ]);
        }

        return response()->json($experience->load(['user:id,name', 'photos']));
    }

    // The author or an admin can delete a story (and its photo files)
    public function destroy(Request $request, $id)
    {
        $experience = Experience::with('photos')->findOrFail($id);

        if ($request->user()->role !== 'admin' && $experience->user_id !== $request->user()->id) {
            return response()->json(['message' => 'You can only delete your own stories.'], 403);
        }

        foreach ($experience->photos as $photo) {
            Storage::disk('public')->delete($photo->path);
        }

        $experience->delete();

        return response()->json(['message' => 'Story deleted successfully']);
    }
}
