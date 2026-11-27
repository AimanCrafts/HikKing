<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * =========================================================
     * HikKing Advanced Database Features
     * ---------------------------------------------------------
     * Views · Stored Procedures · Triggers · Transactions · Constraints
     *
     * Installs:
     *   1.  Reservations                  (TABLE with PK, FK, UNIQUE, CHECK constraints) [Q1]
     *   2.  OutstandingBookings           (VIEW with aggregation & CASE) [Q6]
     *   3.  sp_TravelerBookingStatus      (PROCEDURE with parameters, IF/ELSE & CASE) [Q7]
     *   4.  sp_ReviewPackages             (PROCEDURE with WHILE loop & conditional updates) [Q8]
     *   5.  package_audit                 (TABLE, audit log target) [Q9]
     *   6.  trg_package_price_audit       (AFTER UPDATE trigger logging changes) [Q9]
     *   7.  trg_booking_notify_guide      (AFTER INSERT trigger for notifications)
     *   8.  sp_CreateBookingWithPayment   (PROCEDURE with TRANSACTION + SAVEPOINT + HANDLERS) [Q10]
     *
     * Tested on MySQL 8.4 (Laragon). Safe to rollback.
     * =========================================================
     */

    private function supportsProcedures(): bool
    {
        return DB::connection()->getDriverName() === 'mysql';
    }

    public function up(): void
    {
        if (! $this->supportsProcedures()) {
            return;
        }

        // =========================================================
        // 1. TABLE — Reservations (Q1)
        // =========================================================
        // Demonstrates primary key, foreign keys, unique constraint,
        // and check constraints for tour reservations.
        // =========================================================

        DB::unprepared('DROP TABLE IF EXISTS `Reservations`');
        DB::unprepared(<<<'SQL'
            CREATE TABLE `Reservations` (
                `ResID` INT NOT NULL AUTO_INCREMENT,
                `TravelerID` BIGINT UNSIGNED NOT NULL,
                `PackageID` BIGINT UNSIGNED NOT NULL,
                `ResDate` DATE NOT NULL DEFAULT (CURRENT_DATE),
                `TotalTravelers` INT NOT NULL DEFAULT 1,
                `Status` VARCHAR(20) NOT NULL DEFAULT 'Pending',
                PRIMARY KEY (`ResID`),
                CONSTRAINT `FK_Reservations_Users`
                    FOREIGN KEY (`TravelerID`) REFERENCES `users`(`id`) ON DELETE CASCADE,
                CONSTRAINT `FK_Reservations_Packages`
                    FOREIGN KEY (`PackageID`) REFERENCES `packages`(`id`) ON DELETE CASCADE,
                CONSTRAINT `UQ_Reservations_TravelerPackageDate`
                    UNIQUE (`TravelerID`, `PackageID`, `ResDate`),
                CONSTRAINT `CK_Reservations_Travelers`
                    CHECK (`TotalTravelers` >= 1 AND `TotalTravelers` <= 20),
                CONSTRAINT `CK_Reservations_Status`
                    CHECK (`Status` IN ('Pending', 'Confirmed', 'Collected', 'Cancelled'))
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        SQL);

        // =========================================================
        // 2. VIEW — OutstandingBookings (Q6)
        // =========================================================
        // Bookings that are still awaiting payment, along with the
        // amount paid and amount still owed.
        // =========================================================

        DB::unprepared('DROP VIEW IF EXISTS `OutstandingBookings`');
        DB::unprepared(<<<'SQL'
            CREATE VIEW `OutstandingBookings` AS
            SELECT
                b.booking_id                                        AS booking_id,
                u.id                                                AS traveler_id,
                u.name                                              AS traveler_name,
                u.email                                             AS traveler_email,
                p.id                                                AS package_id,
                p.title                                             AS package_title,
                d.destination_id                                    AS destination_id,
                d.name                                              AS destination_name,
                b.travel_date                                       AS travel_date,
                b.total_travelers                                   AS total_travelers,
                b.total_price                                       AS total_price,
                b.booking_status                                    AS booking_status,
                COALESCE(SUM(
                    CASE
                        WHEN pay.payment_status = 'paid'
                        THEN pay.amount
                        ELSE 0
                    END
                ), 0)                                               AS paid_amount,
                COALESCE(SUM(
                    CASE
                        WHEN pay.payment_status IN ('pending', 'failed')
                        THEN pay.amount
                        ELSE 0
                    END
                ), 0)                                               AS unpaid_amount
            FROM bookings               AS b
            INNER JOIN users            AS u   ON u.id             = b.traveler_id
            INNER JOIN packages         AS p   ON p.id             = b.package_id
            INNER JOIN destinations     AS d   ON d.destination_id = p.destination_id
            LEFT  JOIN payments         AS pay ON pay.booking_id   = b.booking_id
            WHERE b.booking_status IN ('pending', 'confirmed')
            GROUP BY
                b.booking_id,
                u.id,
                u.name,
                u.email,
                p.id,
                p.title,
                d.destination_id,
                d.name,
                b.travel_date,
                b.total_travelers,
                b.total_price,
                b.booking_status
            ORDER BY b.booking_id DESC
        SQL);

        // =========================================================
        // 3. PROCEDURE — sp_TravelerBookingStatus (Q7)
        // =========================================================
        // Given a traveler's user_id, returns their booking count,
        // total spend, unpaid amount, and a business status label:
        //   Blocked  -> unpaid >= 10000
        //   Warning  -> unpaid >= 3000
        //   Clear    -> otherwise
        // =========================================================

        DB::unprepared('DROP PROCEDURE IF EXISTS `sp_TravelerBookingStatus`');
        DB::unprepared(<<<'SQL'
            CREATE PROCEDURE `sp_TravelerBookingStatus`(IN p_traveler_id INT)
            BEGIN
                DECLARE v_name          VARCHAR(150) DEFAULT NULL;
                DECLARE v_booking_count INT DEFAULT 0;
                DECLARE v_total_spend   DECIMAL(10,2) DEFAULT 0.00;
                DECLARE v_unpaid        DECIMAL(10,2) DEFAULT 0.00;
                DECLARE v_status        VARCHAR(20) DEFAULT 'Clear';

                -- Handler prevents 1329 error when SELECT INTO finds no rows
                DECLARE CONTINUE HANDLER FOR NOT FOUND BEGIN END;

                SELECT name INTO v_name
                FROM users
                WHERE id = p_traveler_id;

                IF v_name IS NULL THEN
                    SELECT 'Traveler not found' AS result,
                           NULL AS Name,
                           NULL AS BookingCount,
                           NULL AS TotalSpend,
                           NULL AS UnpaidAmount,
                           NULL AS Status;
                ELSE
                    SELECT COUNT(*) INTO v_booking_count
                    FROM bookings
                    WHERE traveler_id = p_traveler_id;

                    IF v_booking_count = 0 THEN
                        SELECT CONCAT(v_name, ' has no booking record') AS result,
                               v_name  AS Name,
                               0       AS BookingCount,
                               0.00    AS TotalSpend,
                               0.00    AS UnpaidAmount,
                               'Clear' AS Status;
                    ELSE
                        SELECT COALESCE(SUM(total_price), 0) INTO v_total_spend
                        FROM bookings
                        WHERE traveler_id = p_traveler_id;

                        SELECT COALESCE(SUM(
                                   CASE
                                       WHEN pay.payment_status IN ('pending', 'failed')
                                       THEN pay.amount
                                       ELSE 0
                                   END
                               ), 0)
                        INTO v_unpaid
                        FROM bookings AS b
                        LEFT JOIN payments AS pay ON pay.booking_id = b.booking_id
                        WHERE b.traveler_id = p_traveler_id;

                        SET v_status =
                            CASE
                                WHEN v_unpaid >= 10000 THEN 'Blocked'
                                WHEN v_unpaid >= 3000  THEN 'Warning'
                                ELSE 'Clear'
                            END;

                        SELECT 'OK'            AS result,
                               v_name          AS Name,
                               v_booking_count AS BookingCount,
                               v_total_spend   AS TotalSpend,
                               v_unpaid        AS UnpaidAmount,
                               v_status        AS Status;
                    END IF;
                END IF;
            END
        SQL);

        // =========================================================
        // 4. PROCEDURE — sp_ReviewPackages (Q8)
        // =========================================================
        // Loops through every package and:
        //   - promotes to 'published' if bookings >= 3
        //   - applies 10% discount      if bookings = 0
        //   - leaves untouched otherwise
        // =========================================================

        DB::unprepared('DROP PROCEDURE IF EXISTS `sp_ReviewPackages`');
        DB::unprepared(<<<'SQL'
            CREATE PROCEDURE `sp_ReviewPackages`()
            BEGIN
                DECLARE v_pkg_id      INT DEFAULT 1;
                DECLARE v_max_id      INT DEFAULT 0;
                DECLARE v_title       VARCHAR(200);
                DECLARE v_price       DECIMAL(10,2);
                DECLARE v_booking_cnt INT;
                DECLARE v_action      VARCHAR(50);

                -- Handler to safely bypass gaps in package primary keys
                DECLARE CONTINUE HANDLER FOR NOT FOUND BEGIN END;

                SELECT COALESCE(MAX(id), 0) INTO v_max_id FROM packages;

                WHILE v_pkg_id <= v_max_id DO
                    SET v_title = NULL;

                    SELECT title, price
                    INTO v_title, v_price
                    FROM packages
                    WHERE id = v_pkg_id;

                    IF v_title IS NOT NULL THEN
                        SELECT COUNT(*) INTO v_booking_cnt
                        FROM bookings
                        WHERE package_id = v_pkg_id;

                        IF v_booking_cnt >= 3 THEN
                            UPDATE packages
                            SET status = 'published'
                            WHERE id = v_pkg_id;

                            SET v_action = 'promoted';
                        ELSEIF v_booking_cnt = 0 THEN
                            UPDATE packages
                            SET price = ROUND(price * 0.90, 2)
                            WHERE id = v_pkg_id;

                            SET v_action = 'discounted';
                        ELSE
                            SET v_action = 'no action';
                        END IF;

                        SELECT CONCAT(
                                   v_title,
                                   ' | bookings=', v_booking_cnt,
                                   ' | ', v_action
                               ) AS log_line;
                    END IF;

                    SET v_pkg_id = v_pkg_id + 1;
                END WHILE;
            END
        SQL);

        // =========================================================
        // 5. TABLE — package_audit (Q9)
        // =========================================================
        // Append-only log used by trg_package_price_audit.
        // =========================================================

        if (! Schema::hasTable('package_audit')) {
            Schema::create('package_audit', function ($table) {
                $table->id();
                $table->unsignedBigInteger('package_id');
                $table->string('event', 50);
                $table->decimal('old_price', 10, 2)->nullable();
                $table->decimal('new_price', 10, 2)->nullable();
                $table->string('old_status', 20)->nullable();
                $table->string('new_status', 20)->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index('package_id');
                $table->index('created_at');
            });
        }

        // =========================================================
        // 6. TRIGGER — trg_package_price_audit (Q9)
        // =========================================================
        // Fires AFTER UPDATE on `packages`. Logs ONLY when price
        // OR status actually changes — no-op updates are ignored.
        // =========================================================

        DB::unprepared('DROP TRIGGER IF EXISTS `trg_package_price_audit`');
        DB::unprepared(<<<'SQL'
            CREATE TRIGGER `trg_package_price_audit`
            AFTER UPDATE ON `packages`
            FOR EACH ROW
            BEGIN
                IF NOT (OLD.price <=> NEW.price) OR NOT (OLD.status <=> NEW.status) THEN
                    INSERT INTO `package_audit`
                        (package_id, event,
                         old_price, new_price,
                         old_status, new_status,
                         created_at)
                    VALUES
                        (NEW.id, 'PACKAGE UPDATED',
                         OLD.price, NEW.price,
                         OLD.status, NEW.status,
                         NOW());
                END IF;
            END
        SQL);

        // =========================================================
        // 7. TRIGGER — trg_booking_notify_guide
        // =========================================================
        // Fires AFTER INSERT on `bookings`. Notifies the guide
        // who owns the package.
        // =========================================================

        DB::unprepared('DROP TRIGGER IF EXISTS `trg_booking_notify_guide`');
        DB::unprepared(<<<'SQL'
            CREATE TRIGGER `trg_booking_notify_guide`
            AFTER INSERT ON `bookings`
            FOR EACH ROW
            BEGIN
                DECLARE v_guide_user_id INT DEFAULT NULL;
                DECLARE v_pkg_title     VARCHAR(200);
                DECLARE v_traveler_name VARCHAR(150);

                SELECT gp.user_id, p.title
                INTO   v_guide_user_id, v_pkg_title
                FROM   packages      AS p
                LEFT JOIN guide_profiles AS gp ON gp.id = p.guide_profile_id
                WHERE  p.id = NEW.package_id;

                SELECT name INTO v_traveler_name
                FROM users
                WHERE id = NEW.traveler_id;

                IF v_guide_user_id IS NOT NULL THEN
                    INSERT INTO notifications
                        (user_id, type, message, is_read, created_at, updated_at)
                    VALUES (
                        v_guide_user_id,
                        'new_booking',
                        CONCAT(COALESCE(v_traveler_name, 'A traveler'),
                               ' booked "', COALESCE(v_pkg_title, 'Package'), '" on ', NEW.travel_date),
                        0,
                        NOW(), NOW()
                    );
                END IF;
            END
        SQL);

        // =========================================================
        // 8. PROCEDURE — sp_CreateBookingWithPayment (Q10)
        // =========================================================
        // Atomically:
        //   1. INSERT booking
        //   2. SAVEPOINT after_booking
        //   3. INSERT payment
        //   4. UPDATE booking -> 'confirmed'
        //   5. COMMIT
        // On payment failure: rolls back to savepoint and commits booking.
        // =========================================================

        DB::unprepared('DROP PROCEDURE IF EXISTS `sp_CreateBookingWithPayment`');
        DB::unprepared(<<<'SQL'
            CREATE PROCEDURE `sp_CreateBookingWithPayment`(
                IN p_traveler_id INT,
                IN p_package_id  INT,
                IN p_travel_date DATE,
                IN p_travelers   INT,
                IN p_amount      DECIMAL(10,2)
            )
            BEGIN
                DECLARE v_booking_id INT DEFAULT NULL;
                DECLARE v_error      INT DEFAULT 0;
                DECLARE v_msg        TEXT DEFAULT '';
                DECLARE v_step       VARCHAR(50) DEFAULT 'INITIAL';

                DECLARE EXIT HANDLER FOR SQLEXCEPTION
                BEGIN
                    GET DIAGNOSTICS CONDITION 1
                        v_error = MYSQL_ERRNO,
                        v_msg   = MESSAGE_TEXT;

                    IF v_step = 'PAYMENT_FAILED' THEN
                        ROLLBACK TO SAVEPOINT after_booking;
                        COMMIT;
                        SELECT 'PARTIAL_SUCCESS' AS result,
                               v_booking_id AS booking_id,
                               'Booking preserved as pending; payment failed.' AS message,
                               v_error AS error_code,
                               v_msg AS error_message;
                    ELSE
                        ROLLBACK;
                        SELECT 'FAILED' AS result,
                               NULL AS booking_id,
                               'Transaction completely aborted.' AS message,
                               v_error AS error_code,
                               v_msg AS error_message;
                    END IF;
                END;

                START TRANSACTION;

                    SET v_step = 'BOOKING';
                    INSERT INTO bookings
                        (traveler_id, package_id, travel_date, total_travelers,
                         total_price, booking_status, created_at, updated_at)
                    VALUES
                        (p_traveler_id, p_package_id, p_travel_date, p_travelers,
                         p_amount, 'pending', NOW(), NOW());

                    SET v_booking_id = LAST_INSERT_ID();

                    SAVEPOINT after_booking;

                    SET v_step = 'PAYMENT_FAILED';

                    INSERT INTO payments
                        (booking_id, transaction_id, amount, payment_status,
                         created_at, updated_at)
                    VALUES
                        (v_booking_id, CONCAT('TXN-', UUID()), p_amount, 'paid',
                         NOW(), NOW());

                    UPDATE bookings
                    SET booking_status = 'confirmed', updated_at = NOW()
                    WHERE booking_id = v_booking_id;

                    SET v_step = 'COMPLETED';

                COMMIT;

                SELECT 'OK' AS result,
                       v_booking_id AS booking_id,
                       CONCAT('Booking #', v_booking_id, ' created and confirmed successfully.') AS message,
                       0 AS error_code,
                       '' AS error_message;
            END
        SQL);
    }

    // =========================================================
    // ROLLBACK — drops everything in reverse order
    // =========================================================

    public function down(): void
    {
        if (! $this->supportsProcedures()) {
            return;
        }

        DB::unprepared('DROP PROCEDURE IF EXISTS `sp_CreateBookingWithPayment`');
        DB::unprepared('DROP TRIGGER IF EXISTS `trg_booking_notify_guide`');
        DB::unprepared('DROP TRIGGER IF EXISTS `trg_package_price_audit`');
        Schema::dropIfExists('package_audit');
        DB::unprepared('DROP PROCEDURE IF EXISTS `sp_ReviewPackages`');
        DB::unprepared('DROP PROCEDURE IF EXISTS `sp_TravelerBookingStatus`');
        DB::unprepared('DROP VIEW IF EXISTS `OutstandingBookings`');
        DB::unprepared('DROP TABLE IF EXISTS `Reservations`');
    }
};