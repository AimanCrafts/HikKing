<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guide_profiles', function (Blueprint $table) {
            $table->id();

            $table->string('name', 150);

            $table->text('bio')->nullable();

            $table->unsignedSmallInteger('experience_years')->nullable();

            $table->string('specialization', 100)->nullable();

            $table->decimal('rating_avg', 3, 2)->default(0.00);

            $table->string('verification_status', 20)
                ->default('pending');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guide_profiles');
    }
};