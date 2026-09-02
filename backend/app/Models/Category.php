<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $primaryKey = 'category_id';

    protected $fillable = [
        'category_name',
    ];

    public function packages()
    {
        return $this->belongsToMany(Package::class, 'package_categories', 'category_id', 'package_id');
    }
}