<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Destination extends Model
{
    use HasFactory;

<<<<<<< HEAD
    protected $primaryKey = 'destination_id';

=======
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
    protected $fillable = [
        'name',
        'description',
        'location',
<<<<<<< HEAD
=======
        'latitude',
        'longitude',
        'image_url',
        'is_active',
    ];

    protected $casts = [
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'is_active' => 'boolean',
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
    ];

    public function packages()
    {
<<<<<<< HEAD
        return $this->hasMany(Package::class, 'destination_id', 'destination_id');
    }
}
=======
        return $this->hasMany(Package::class);
    }
}
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
