<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destination extends Model
{
    use HasFactory;

    protected $primaryKey = 'destination_id';

    protected $fillable = [
        'name',
        'description',
        'location',
    ];

    public function packages()
    {
        return $this->hasMany(Package::class, 'destination_id', 'destination_id');
    }
}
