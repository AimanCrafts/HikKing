<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('title', 80);

            $table->text('story')->nullable();

            $table->string('place', 150);

            // pending (waiting for review), approved (public), rejected (hidden)
            $table->string('status', 20)->default('pending');

            $table->timestamps();

            $table->index(['status', 'created_at']);
        });

        Schema::create('experience_photos', function (Blueprint $table) {
            $table->id();

            $table->foreignId('experience_id')
                ->constrained('experiences')
                ->cascadeOnDelete();

            $table->string('path', 255);

            $table->string('caption', 60)->nullable();

            $table->unsignedSmallInteger('sort_order')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experience_photos');
        Schema::dropIfExists('experiences');
    }
};
