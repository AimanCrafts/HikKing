<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PackageItinerary extends Model
{
    use HasFactory;

    protected $fillable = [
        'package_id',
        'day_number',
        'title',
        'description',
        'location',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'day_number' => 'integer',
        'start_time' => 'datetime:H:i',
        'end_time' => 'datetime:H:i',
    ];

    public function package()
    {
        return $this->belongsTo(Package::class);
    }
}