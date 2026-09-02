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
<<<<<<< HEAD

    public function hotels()
    {
        return $this->belongsToMany(Hotel::class, 'package_hotels', 'package_id', 'hotel_id');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'package_categories', 'package_id', 'category_id');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'package_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'package_id');
    }
=======
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
}