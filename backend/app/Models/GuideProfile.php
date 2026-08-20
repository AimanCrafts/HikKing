<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuideProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'bio',
        'experience_years',
        'specialization',
        'rating_avg',
        'verification_status',
    ];

    protected $casts = [
        'experience_years' => 'integer',
        'rating_avg' => 'decimal:2',
    ];

    public function verificationDocuments()
    {
        return $this->hasMany(VerificationDocument::class);
    }

    public function packages()
    {
        return $this->hasMany(Package::class);
    }
}