<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    use HasFactory;

    protected $primaryKey = 'hotel_id';

    protected $fillable = [
        'hotel_name',
        'address',
        'star_rating',
    ];

    protected $casts = [
        'star_rating' => 'integer',
    ];

    public function packages()
    {
        return $this->belongsToMany(Package::class, 'package_hotels', 'hotel_id', 'package_id');
    }
}