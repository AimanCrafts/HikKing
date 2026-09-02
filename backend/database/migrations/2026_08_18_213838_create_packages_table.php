<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('destination_id')
                ->constrained('destinations', 'destination_id')
                ->cascadeOnDelete();

            $table->foreignId('guide_profile_id')
                ->nullable()
                ->constrained('guide_profiles')
                ->nullOnDelete();

            $table->string('title', 200);

            $table->text('description')->nullable();

            $table->unsignedSmallInteger('duration_days');

            $table->unsignedSmallInteger('duration_nights')->default(0);

            $table->decimal('price', 10, 2);

            $table->unsignedSmallInteger('max_travelers')->nullable();

            $table->string('status', 20)
                ->default('draft');

            $table->string('image_url', 500)->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};