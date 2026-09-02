<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;

    protected $primaryKey = 'booking_id';

    protected $fillable = [
        'traveler_id',
        'package_id',
        'travel_date',
        'total_travelers',
        'total_price',
        'booking_status',
    ];

    protected $casts = [
        'travel_date' => 'date',
        'total_travelers' => 'integer',
        'total_price' => 'decimal:2',
    ];

    public function traveler()
    {
        return $this->belongsTo(User::class, 'traveler_id');
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'package_id');
    }

    public function payment()
    {
        return $this->hasOne(Payment::class, 'booking_id');
    }

    public function review()
    {
        return $this->hasOne(Review::class, 'booking_id');
    }

    public function complaints()
    {
        return $this->hasMany(Complaint::class, 'booking_id');
    }
}
