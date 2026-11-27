<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $primaryKey = 'notification_id';

    protected $fillable = [
        'user_id',
        'type',
        'message',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** Sends the same notification to every admin account. */
    public static function toAdmins(string $type, string $message): void
    {
        $now = now();

        $rows = User::where('role', 'admin')->pluck('id')->map(fn ($adminId) => [
            'user_id' => $adminId,
            'type' => $type,
            'message' => $message,
            'is_read' => false,
            'created_at' => $now,
            'updated_at' => $now,
        ])->all();

        if ($rows) {
            static::insert($rows);
        }
    }
}
