<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * HikKing is now a single-operator travel agency with reservation requests:
 *   - no guides (no guide profiles, no verification documents)
 *   - no online payments
 *   - no hand-written SQL objects (views, procedures, triggers, audit tables)
 *
 * This migration removes all of that from an existing database. It is safe to
 * run on a fresh database too (everything is "if exists").
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // Anyone who signed up as a guide becomes a normal traveler account
        if (Schema::hasTable('users')) {
            DB::table('users')->where('role', 'guide')->update(['role' => 'traveler']);
        }

        // Triggers, procedures and views only exist on MySQL / MariaDB
        if (in_array(DB::getDriverName(), ['mysql', 'mariadb'], true)) {
            foreach (['trg_package_price_audit', 'trg_booking_notify_guide', 'trg_guide_verified_notify'] as $trigger) {
                DB::unprepared("DROP TRIGGER IF EXISTS `{$trigger}`");
            }

            foreach ([
                'sp_TravelerBookingStatus',
                'sp_ReviewPackages',
                'sp_CreateBookingWithPayment',
                'sp_CreatePackageWithItinerary',
                'sp_VerifyGuide',
                'sp_ResolveComplaint',
            ] as $procedure) {
                DB::unprepared("DROP PROCEDURE IF EXISTS `{$procedure}`");
            }

            foreach (['OutstandingBookings', 'vw_DestinationPackageSummary', 'vw_GuideVerificationSummary'] as $view) {
                DB::unprepared("DROP VIEW IF EXISTS `{$view}`");
            }
        }

        Schema::dropIfExists('Reservations');
        Schema::dropIfExists('package_audit');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('verification_documents');

        if (Schema::hasColumn('packages', 'guide_profile_id')) {
            Schema::table('packages', function ($table) {
                $table->dropConstrainedForeignId('guide_profile_id');
            });
        }

        Schema::dropIfExists('guide_profiles');

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        // Intentionally empty: guides, payments and the SQL objects were removed
        // on purpose and are not recreated by rolling back.
    }
};
