<?php
// database/migrations/2026_10_03_000000_add_sql_file_objects.php
// mysql_2 ও mysql_3 ফাইলের যে object গুলো আগের migration-এ নেই, সেগুলো এখানে install হবে।
// (mysql_1 এর object গুলো আগেই আছে, তাই সেগুলো বদলানো হয়নি)

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        // ---------- mysql_2: vw_DestinationPackageSummary ----------
        DB::unprepared('DROP VIEW IF EXISTS `vw_DestinationPackageSummary`');
        DB::unprepared(<<<'SQL'
            CREATE VIEW `vw_DestinationPackageSummary` AS
            SELECT
                d.destination_id AS DestinationID,
                d.name           AS DestinationName,
                COUNT(p.id)      AS TotalPackages,
                COALESCE(SUM(CASE WHEN p.status = 'published' THEN 1 ELSE 0 END), 0) AS PublishedPackages,
                COALESCE(ROUND(AVG(p.price), 2), 0) AS AveragePrice,
                COALESCE(MIN(p.price), 0)           AS MinimumPrice,
                COALESCE(MAX(p.price), 0)           AS MaximumPrice,
                (SELECT COUNT(DISTINCT pc.category_id)
                   FROM `packages` AS p2
                   INNER JOIN `package_categories` AS pc ON pc.package_id = p2.id
                  WHERE p2.destination_id = d.destination_id) AS CategoriesUsed,
                CASE
                    WHEN COUNT(p.id) = 0        THEN 'No Packages'
                    WHEN AVG(p.price) >= 15000  THEN 'Premium'
                    WHEN AVG(p.price) >= 8000   THEN 'Standard'
                    ELSE 'Budget'
                END AS PriceTier
            FROM `destinations` AS d
            LEFT JOIN `packages` AS p ON p.destination_id = d.destination_id
            GROUP BY d.destination_id, d.name
        SQL);

        // ---------- mysql_2: sp_CreatePackageWithItinerary ----------
        DB::unprepared('DROP PROCEDURE IF EXISTS `sp_CreatePackageWithItinerary`');
        DB::unprepared(<<<'SQL'
            CREATE PROCEDURE `sp_CreatePackageWithItinerary`(
                IN p_destination_id   BIGINT,
                IN p_guide_profile_id BIGINT,
                IN p_title            VARCHAR(200),
                IN p_price            DECIMAL(10,2),
                IN p_duration_days    INT,
                IN p_category_id      BIGINT
            )
            BEGIN
                DECLARE v_pkg_id  BIGINT DEFAULT NULL;
                DECLARE v_day     INT DEFAULT 1;
                DECLARE v_error   INT DEFAULT 0;
                DECLARE v_msg     TEXT DEFAULT '';
                DECLARE v_step    VARCHAR(30) DEFAULT 'INITIAL';

                DECLARE EXIT HANDLER FOR SQLEXCEPTION
                BEGIN
                    GET DIAGNOSTICS CONDITION 1
                        v_error = MYSQL_ERRNO,
                        v_msg   = MESSAGE_TEXT;

                    IF v_step = 'CATEGORY' THEN
                        ROLLBACK TO SAVEPOINT after_itinerary;
                        COMMIT;
                        SELECT 'PARTIAL_SUCCESS' AS result,
                               v_pkg_id AS package_id,
                               'Package and itinerary saved; category link failed.' AS message,
                               v_error AS error_code,
                               v_msg AS error_message;
                    ELSE
                        ROLLBACK;
                        SELECT 'FAILED' AS result,
                               NULL AS package_id,
                               'Transaction completely aborted.' AS message,
                               v_error AS error_code,
                               v_msg AS error_message;
                    END IF;
                END;

                START TRANSACTION;

                    SET v_step = 'VALIDATE';
                    IF p_price <= 0 THEN
                        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Price must be greater than zero.';
                    END IF;
                    IF p_duration_days < 1 OR p_duration_days > 30 THEN
                        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duration must be between 1 and 30 days.';
                    END IF;

                    SET v_step = 'PACKAGE';
                    INSERT INTO `packages`
                        (destination_id, guide_profile_id, title, duration_days, duration_nights,
                         price, status, created_at, updated_at)
                    VALUES
                        (p_destination_id, p_guide_profile_id, p_title, p_duration_days,
                         GREATEST(p_duration_days - 1, 0), p_price, 'draft', NOW(), NOW());

                    SET v_pkg_id = LAST_INSERT_ID();

                    SET v_step = 'ITINERARY';
                    WHILE v_day <= p_duration_days DO
                        INSERT INTO `package_itineraries`
                            (package_id, day_number, title, created_at, updated_at)
                        VALUES
                            (v_pkg_id, v_day, CONCAT('Day ', v_day), NOW(), NOW());
                        SET v_day = v_day + 1;
                    END WHILE;

                    SAVEPOINT after_itinerary;

                    SET v_step = 'CATEGORY';
                    INSERT INTO `package_categories` (package_id, category_id)
                    VALUES (v_pkg_id, p_category_id);

                    SET v_step = 'COMPLETED';

                COMMIT;

                SELECT 'OK' AS result,
                       v_pkg_id AS package_id,
                       CONCAT('Package #', v_pkg_id, ' created with ', p_duration_days, ' itinerary day(s).') AS message,
                       0 AS error_code,
                       '' AS error_message;
            END
        SQL);

        // ---------- mysql_3: vw_GuideVerificationSummary ----------
        DB::unprepared('DROP VIEW IF EXISTS `vw_GuideVerificationSummary`');
        DB::unprepared(<<<'SQL'
            CREATE VIEW `vw_GuideVerificationSummary` AS
            SELECT
                gp.id                         AS GuideProfileID,
                u.name                        AS GuideName,
                u.email                       AS GuideEmail,
                gp.experience_years           AS ExperienceYears,
                gp.verification_status        AS ProfileStatus,
                COALESCE(vd.total_docs, 0)    AS TotalDocuments,
                COALESCE(vd.approved_docs, 0) AS ApprovedDocuments,
                COALESCE(vd.rejected_docs, 0) AS RejectedDocuments,
                COALESCE(cm.total_complaints, 0) AS TotalComplaints,
                COALESCE(cm.open_complaints, 0)  AS OpenComplaints,
                CASE
                    WHEN COALESCE(vd.total_docs, 0) = 0    THEN 'No Documents'
                    WHEN COALESCE(vd.rejected_docs, 0) > 0 THEN 'Has Rejected Documents'
                    WHEN vd.approved_docs = vd.total_docs  THEN 'Ready To Verify'
                    ELSE 'Documents Pending'
                END AS VerificationReadiness
            FROM `guide_profiles` AS gp
            INNER JOIN `users` AS u ON u.id = gp.user_id
            LEFT JOIN (
                SELECT guide_profile_id,
                       COUNT(*) AS total_docs,
                       SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved_docs,
                       SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected_docs
                FROM `verification_documents`
                GROUP BY guide_profile_id
            ) AS vd ON vd.guide_profile_id = gp.id
            LEFT JOIN (
                SELECT p.guide_profile_id,
                       COUNT(*) AS total_complaints,
                       SUM(CASE WHEN c.status IN ('open', 'in_progress') THEN 1 ELSE 0 END) AS open_complaints
                FROM `complaints` AS c
                INNER JOIN `bookings` AS b ON b.booking_id = c.booking_id
                INNER JOIN `packages` AS p ON p.id = b.package_id
                GROUP BY p.guide_profile_id
            ) AS cm ON cm.guide_profile_id = gp.id
        SQL);

        // ---------- mysql_3: sp_VerifyGuide ----------
        DB::unprepared('DROP PROCEDURE IF EXISTS `sp_VerifyGuide`');
        DB::unprepared(<<<'SQL'
            CREATE PROCEDURE `sp_VerifyGuide`(IN p_guide_profile_id BIGINT)
            BEGIN
                DECLARE v_user_id  BIGINT DEFAULT NULL;
                DECLARE v_status   VARCHAR(20) DEFAULT NULL;
                DECLARE v_total    INT DEFAULT 0;
                DECLARE v_approved INT DEFAULT 0;

                DECLARE CONTINUE HANDLER FOR NOT FOUND BEGIN END;

                SELECT user_id, verification_status
                INTO   v_user_id, v_status
                FROM   `guide_profiles`
                WHERE  id = p_guide_profile_id;

                IF v_user_id IS NULL THEN
                    SELECT 'NOT_FOUND' AS result, 'Guide profile not found.' AS message;

                ELSEIF v_status = 'verified' THEN
                    SELECT 'NO_CHANGE' AS result, 'Guide is already verified.' AS message;

                ELSE
                    SELECT COUNT(*),
                           COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0)
                    INTO   v_total, v_approved
                    FROM   `verification_documents`
                    WHERE  guide_profile_id = p_guide_profile_id;

                    IF v_total = 0 THEN
                        SELECT 'REJECTED' AS result, 'No verification documents submitted.' AS message;
                    ELSEIF v_approved < v_total THEN
                        SELECT 'REJECTED' AS result,
                               CONCAT('Only ', v_approved, ' of ', v_total, ' documents approved.') AS message;
                    ELSE
                        UPDATE `guide_profiles`
                        SET verification_status = 'verified', updated_at = NOW()
                        WHERE id = p_guide_profile_id;

                        SELECT 'VERIFIED' AS result,
                               CONCAT('Guide profile #', p_guide_profile_id, ' verified successfully.') AS message;
                    END IF;
                END IF;
            END
        SQL);

        // ---------- mysql_3: trg_guide_verified_notify ----------
        DB::unprepared('DROP TRIGGER IF EXISTS `trg_guide_verified_notify`');
        DB::unprepared(<<<'SQL'
            CREATE TRIGGER `trg_guide_verified_notify`
            AFTER UPDATE ON `guide_profiles`
            FOR EACH ROW
            BEGIN
                IF NOT (OLD.verification_status <=> NEW.verification_status)
                   AND NEW.verification_status = 'verified' THEN
                    INSERT INTO `notifications`
                        (user_id, type, message, is_read, created_at, updated_at)
                    VALUES
                        (NEW.user_id, 'guide_verified',
                         'Congratulations! Your guide profile has been verified.',
                         0, NOW(), NOW());
                END IF;
            END
        SQL);

        // ---------- mysql_3: sp_ResolveComplaint ----------
        DB::unprepared('DROP PROCEDURE IF EXISTS `sp_ResolveComplaint`');
        DB::unprepared(<<<'SQL'
            CREATE PROCEDURE `sp_ResolveComplaint`(
                IN p_complaint_id BIGINT,
                IN p_new_status   VARCHAR(20)
            )
            BEGIN
                DECLARE v_user_id BIGINT DEFAULT NULL;
                DECLARE v_current VARCHAR(20) DEFAULT NULL;
                DECLARE v_error   INT DEFAULT 0;
                DECLARE v_msg     TEXT DEFAULT '';

                DECLARE CONTINUE HANDLER FOR NOT FOUND BEGIN END;

                DECLARE EXIT HANDLER FOR SQLEXCEPTION
                BEGIN
                    GET DIAGNOSTICS CONDITION 1
                        v_error = MYSQL_ERRNO,
                        v_msg   = MESSAGE_TEXT;
                    ROLLBACK;
                    SELECT 'FAILED' AS result,
                           v_error  AS error_code,
                           v_msg    AS error_message;
                END;

                START TRANSACTION;

                    IF p_new_status NOT IN ('in_progress', 'resolved', 'rejected') THEN
                        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid status. Use in_progress, resolved or rejected.';
                    END IF;

                    SELECT user_id, status
                    INTO   v_user_id, v_current
                    FROM   `complaints`
                    WHERE  complaint_id = p_complaint_id
                    FOR UPDATE;

                    IF v_user_id IS NULL THEN
                        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Complaint not found.';
                    END IF;

                    IF v_current IN ('resolved', 'rejected') THEN
                        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Complaint is already closed.';
                    END IF;

                    UPDATE `complaints`
                    SET status = p_new_status, updated_at = NOW()
                    WHERE complaint_id = p_complaint_id;

                    INSERT INTO `notifications`
                        (user_id, type, message, is_read, created_at, updated_at)
                    VALUES
                        (v_user_id, 'complaint_update',
                         CONCAT('Your complaint #', p_complaint_id, ' is now ', p_new_status, '.'),
                         0, NOW(), NOW());

                COMMIT;

                SELECT 'OK' AS result,
                       CONCAT('Complaint #', p_complaint_id, ' updated to ', p_new_status, '.') AS message;
            END
        SQL);
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }
        DB::unprepared('DROP VIEW IF EXISTS `vw_DestinationPackageSummary`');
        DB::unprepared('DROP VIEW IF EXISTS `vw_GuideVerificationSummary`');
        DB::unprepared('DROP PROCEDURE IF EXISTS `sp_CreatePackageWithItinerary`');
        DB::unprepared('DROP PROCEDURE IF EXISTS `sp_VerifyGuide`');
        DB::unprepared('DROP PROCEDURE IF EXISTS `sp_ResolveComplaint`');
        DB::unprepared('DROP TRIGGER IF EXISTS `trg_guide_verified_notify`');
    }
};