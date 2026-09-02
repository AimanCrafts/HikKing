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
        Schema::table('guide_profiles', function (Blueprint $table) {
            // ERD: "Has Profile" is a 1:1 relation between users and guide_profiles
            $table->foreignId('user_id')
                ->after('id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            // These two columns are not part of the ERD (guide's name/contact
            // info belongs to the users table, not guide_profiles)
            $table->dropColumn(['name', 'specialization']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('guide_profiles', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');

            $table->string('name', 150)->after('id');
            $table->string('specialization', 100)->nullable();
        });
    }
};