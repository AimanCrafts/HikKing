<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();
            
            $table->foreignId('package_id')
                ->constrained('packages')
                ->cascadeOnDelete();
            
            $table->date('travel_date');
            $table->unsignedSmallInteger('total_travelers')->default(1);
            $table->decimal('total_price', 10, 2);
            $table->string('status', 20)->default('pending');
            $table->text('special_requests')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};