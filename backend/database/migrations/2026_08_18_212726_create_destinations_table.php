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
        Schema::create('destinations', function (Blueprint $table) {
<<<<<<< HEAD
            $table->id('destination_id');
=======
            $table->id();
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad

            $table->string('name', 150);

            $table->text('description')->nullable();

            $table->string('location', 255)->nullable();

<<<<<<< HEAD
=======
            $table->decimal('latitude', 10, 7)->nullable();

            $table->decimal('longitude', 10, 7)->nullable();

            $table->string('image_url', 500)->nullable();

            $table->boolean('is_active')->default(true);

>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('destinations');
    }
<<<<<<< HEAD
};
=======
};
>>>>>>> 32ecafb4c407726f37ea64f1ebd1c43a725e26ad
