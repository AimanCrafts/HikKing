<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->foreignId('booking_id')->constrained('bookings', 'booking_id')->cascadeOnDelete();
            $table->string('transaction_id', 40)->unique();
            $table->decimal('amount', 10, 2);
            $table->string('payment_method', 24);
            $table->string('payer_account', 4)->nullable();
            $table->string('payment_status', 20)->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index(['booking_id', 'payment_status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
