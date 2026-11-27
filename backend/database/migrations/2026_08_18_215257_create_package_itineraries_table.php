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
        Schema::create('package_itineraries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('package_id')
                ->constrained('packages')
                ->cascadeOnDelete();

            $table->unsignedSmallInteger('day_number');

            $table->string('title', 200);

            $table->text('description')->nullable();

            $table->string('location', 255)->nullable();

            $table->time('start_time')->nullable();

            $table->time('end_time')->nullable();

            $table->timestamps();

            $table->index(['package_id', 'day_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('package_itineraries');
    }
};