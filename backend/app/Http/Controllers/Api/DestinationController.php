<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Destination;

class DestinationController extends Controller
{
    public function index()
    {
        $destinations = Destination::with('packages')
            ->where('is_active', true)
            ->get();

        return response()->json($destinations);
    }

    public function show($id)
    {
        $destination = Destination::with([
            'packages.itineraries',
            'packages.guideProfile.user'
        ])->findOrFail($id);

        return response()->json($destination);
    }
}