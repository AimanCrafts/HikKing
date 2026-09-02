<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VerificationDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'guide_profile_id',
        'document_type',
        'document_url',
        'status',
    ];

    public function guideProfile()
    {
        return $this->belongsTo(GuideProfile::class);
    }
}