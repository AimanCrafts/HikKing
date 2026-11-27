<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // The logged-in user's own notifications, newest first
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest('notification_id')
            ->limit(100)
            ->get();

        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        return response()->json([
            'count' => Notification::where('user_id', $request->user()->id)
                ->where('is_read', false)
                ->count(),
        ]);
    }

    public function markRead(Request $request, $id)
    {
        $notification = Notification::where('user_id', $request->user()->id)->findOrFail($id);

        $notification->update(['is_read' => true]);

        return response()->json($notification);
    }

    public function readAll(Request $request)
    {
        $updated = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['updated' => $updated]);
    }

    public function destroy(Request $request, $id)
    {
        Notification::where('user_id', $request->user()->id)->findOrFail($id)->delete();

        return response()->json(['message' => 'Notification deleted successfully']);
    }
}
