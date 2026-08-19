<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'destination_id',
        'guide_profile_id',
        'title',
        'description',
        'duration_days',
        'duration_nights',
        'price',
        'max_travelers',
        'status',
        'image_url',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'duration_days' => 'integer',
        'duration_nights' => 'integer',
        'max_travelers' => 'integer',
    ];

    public function destination()
    {
        return $this->belongsTo(Destination::class);
    }

    public function guideProfile()
    {
        return $this->belongsTo(GuideProfile::class);
    }

    public function itineraries()
    {
        return $this->hasMany(PackageItinerary::class)
	    ->orderBy('day_number');
    }
}