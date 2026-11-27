<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ExperiencePhoto extends Model
{
    protected $fillable = [
        'experience_id',
        'path',
        'caption',
        'sort_order',
    ];

    protected $hidden = ['path'];

    protected $appends = ['url'];

    // Public URL of the stored file (run `php artisan storage:link` once)
    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }

    public function experience()
    {
        return $this->belongsTo(Experience::class, 'experience_id');
    }
}
