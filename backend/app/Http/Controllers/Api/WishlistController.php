<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

/**
 * Saved trips for the signed-in user.
 */
class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $items = Wishlist::with(['package.destination'])
            ->where('user_id', $request->user()->id)
            ->latest('id')
            ->get();

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'package_id' => 'required|exists:packages,id',
        ]);

        $item = Wishlist::firstOrCreate([
            'user_id' => $request->user()->id,
            'package_id' => $validated['package_id'],
        ]);

        return response()->json($item->load('package.destination'), 201);
    }

    public function destroy(Request $request, $packageId)
    {
        Wishlist::where('user_id', $request->user()->id)
            ->where('package_id', $packageId)
            ->delete();

        return response()->json(['message' => 'Removed from saved trips']);
    }
}
