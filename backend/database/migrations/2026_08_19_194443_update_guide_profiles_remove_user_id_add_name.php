<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('guide_profiles', function (Blueprint $table) {

            // Remove the foreign key
            $table->dropForeign(['user_id']);

            // Remove the unique constraint
            $table->dropUnique(['user_id']);

            // Remove user_id
            $table->dropColumn('user_id');

            // Add name
            $table->string('name', 150)->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('guide_profiles', function (Blueprint $table) {

            // Remove name
            $table->dropColumn('name');

            // Restore user_id
            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();
        });
    }
};