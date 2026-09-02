<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuideProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
<<<<<<< HEAD
    // Signup — creates a user, hashes password, returns token
=======
    
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => 'required|string|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|string|in:traveler,guide',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'role' => $validated['role'] ?? 'traveler',
            'password' => Hash::make($validated['password']),
        ]);

<<<<<<< HEAD
        // ERD: "Has Profile" is a 1:1 relation between users and
        // guide_profiles — every guide user gets one automatically,
        // starting as "pending" until an admin verifies them.
=======
       
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
        if ($user->role === 'guide') {
            GuideProfile::create([
                'user_id' => $user->id,
                'verification_status' => 'pending',
            ]);
        }

        $token = $user->createToken('hikking-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

<<<<<<< HEAD
    // Login — verifies credentials, returns a fresh token
=======
    
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('hikking-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

<<<<<<< HEAD
    // Logout — revokes only the token used for this request
=======
    
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

<<<<<<< HEAD
    // Returns the currently authenticated user (used to restore session on page load)
=======
    
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}