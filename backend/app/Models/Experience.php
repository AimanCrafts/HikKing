<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A traveler's shared story: a few photos and a write-up about a trip.
 * It stays "pending" until an admin approves it.
 */
class Experience extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'story',
        'place',
        'status',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function photos()
    {
        return $this->hasMany(ExperiencePhoto::class, 'experience_id')->orderBy('sort_order');
    }
}
