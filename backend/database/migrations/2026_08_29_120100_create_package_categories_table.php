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
        Schema::create('package_categories', function (Blueprint $table) {
            $table->foreignId('package_id')
                ->constrained('packages')
                ->cascadeOnDelete();

            $table->foreignId('category_id')
                ->constrained('categories', 'category_id')
                ->cascadeOnDelete();

            $table->primary(['package_id', 'category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('package_categories');
    }
};