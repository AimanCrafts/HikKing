<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $primaryKey = 'review_id';

    protected $fillable = [
        'booking_id',
        'traveler_id',
        'package_id',
        'rating',
        'comment',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }

    public function traveler()
    {
        return $this->belongsTo(User::class, 'traveler_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }
}
