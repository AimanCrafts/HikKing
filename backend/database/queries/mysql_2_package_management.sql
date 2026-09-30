/*
================================================================================
HIKKING PROJECT - ADVANCED DATABASE OPERATIONS
PACKAGE MANAGEMENT
Target DBMS : MySQL 8.4
Member      : ______________________________
Tables      : destinations, packages, package_itineraries, categories, package_categories
================================================================================
  Part           Object                                         Status
  1. View        vw_DestinationPackageSummary                   NEW
  2. Procedure   sp_ReviewPackages                              existing (Q8)
  3. Trigger     trg_package_price_audit                        existing (Q9)
  4. Transaction sp_CreatePackageWithItinerary                  NEW
================================================================================
*/

USE `hikking`;


-- ================================================================================
-- PART 1: VIEW
-- ================================================================================


-- ================================================================================
-- VIEW: vw_DestinationPackageSummary  (Aggregation + CASE + LEFT JOIN)
-- Prottek destination-er package sonkha, gor dam, published sonkha, price tier
-- ================================================================================

DROP VIEW IF EXISTS `vw_DestinationPackageSummary`;

CREATE VIEW `vw_DestinationPackageSummary` AS
SELECT
    d.destination_id AS DestinationID,
    d.name           AS DestinationName,
    COUNT(p.id)      AS TotalPackages,
    COALESCE(SUM(CASE WHEN p.status = 'published' THEN 1 ELSE 0 END), 0) AS PublishedPackages,
    COALESCE(ROUND(AVG(p.price), 2), 0) AS AveragePrice,
    COALESCE(MIN(p.price), 0)           AS MinimumPrice,
    COALESCE(MAX(p.price), 0)           AS MaximumPrice,
    -- Correlated subquery: package_categories join korle AVG duplicate hoto, tai alada
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
GROUP BY d.destination_id, d.name;

-- Test View Query
SELECT * FROM `vw_DestinationPackageSummary`
ORDER BY AveragePrice DESC;


-- ================================================================================
-- PART 2: STORED PROCEDURE
-- ================================================================================

-- ================================================================================
-- --Q8: STORED PROCEDURE (sp_ReviewPackages) with WHILE Loop & Conditional Updates
-- ================================================================================

DROP PROCEDURE IF EXISTS `sp_ReviewPackages`;

DELIMITER //

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

    SELECT COALESCE(MAX(id), 0) INTO v_max_id FROM `packages`;

    WHILE v_pkg_id <= v_max_id DO
        SET v_title = NULL;

        SELECT title, price
        INTO v_title, v_price
        FROM `packages`
        WHERE id = v_pkg_id;

        IF v_title IS NOT NULL THEN
            SELECT COUNT(*) INTO v_booking_cnt
            FROM `bookings`
            WHERE package_id = v_pkg_id;

            -- High demand: promote to published
            IF v_booking_cnt >= 3 THEN
                UPDATE `packages`
                SET status = 'published'
                WHERE id = v_pkg_id;

                SET v_action = 'promoted';
            -- Zero demand: apply 10% discount
            ELSEIF v_booking_cnt = 0 THEN
                UPDATE `packages`
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
END //

DELIMITER ;

-- Execute Review Packages Procedure
CALL sp_ReviewPackages();

-- Verify Updated Packages
SELECT id, title, price, status
FROM `packages`
ORDER BY id;


-- ================================================================================
-- PART 3: TRIGGER
-- ================================================================================

-- ================================================================================
-- --Q9: AFTER UPDATE TRIGGER (trg_PackagePriceAudit) with Audit Table & Test Cases
-- ================================================================================

CREATE TABLE IF NOT EXISTS `package_audit` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `package_id` BIGINT UNSIGNED NOT NULL,
    `event` VARCHAR(50) NOT NULL,
    `old_price` DECIMAL(10,2) NULL,
    `new_price` DECIMAL(10,2) NULL,
    `old_status` VARCHAR(20) NULL,
    `new_status` VARCHAR(20) NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_package_id` (`package_id`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TRIGGER IF EXISTS `trg_package_price_audit`;

DELIMITER //

CREATE TRIGGER `trg_package_price_audit`
AFTER UPDATE ON `packages`
FOR EACH ROW
BEGIN
    -- Uses null-safe comparison <=> to catch changes accurately
    IF NOT (OLD.price <=> NEW.price) OR NOT (OLD.status <=> NEW.status) THEN
        INSERT INTO `package_audit`
            (package_id, event, old_price, new_price, old_status, new_status, created_at)
        VALUES
            (NEW.id, 'PACKAGE UPDATED', OLD.price, NEW.price, OLD.status, NEW.status, NOW());
    END IF;
END //

DELIMITER ;

-- Test 1: Update price on Package 1 (Trigger MUST fire)
UPDATE `packages`
SET price = price + 500
WHERE id = 1;

SELECT * FROM `package_audit` ORDER BY id DESC LIMIT 5;

-- Test 2: Update description only (Trigger MUST NOT fire)
UPDATE `packages`
SET description = CONCAT(description, ' Updated details.')
WHERE id = 1;

SELECT * FROM `package_audit` ORDER BY id DESC LIMIT 5;

-- Test 3: Update price with identical value (Trigger MUST NOT fire)
UPDATE `packages`
SET price = price
WHERE id = 1;

SELECT * FROM `package_audit` ORDER BY id DESC LIMIT 5;


-- ================================================================================
-- PART 4: TRANSACTION
-- ================================================================================


-- ================================================================================
-- TRANSACTION: sp_CreatePackageWithItinerary  (SAVEPOINT + HANDLER + WHILE loop)
-- Ekshathe: (1) package toiri, (2) prottek diner itinerary, (3) category link.
--   * Price/validation/package/itinerary-te error  -> FULL ROLLBACK (kichui save hobe na)
--   * Shudhu category link fail korle              -> itinerary porjonto save thake
--                                                     (ROLLBACK TO SAVEPOINT after_itinerary)
-- ================================================================================

DROP PROCEDURE IF EXISTS `sp_CreatePackageWithItinerary`;

DELIMITER //

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
            -- Package + itinerary rakha hobe, shudhu category link bad
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

        -- Validation (SIGNAL diye custom error -> handler dhorbe)
        SET v_step = 'VALIDATE';
        IF p_price <= 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Price must be greater than zero.';
        END IF;
        IF p_duration_days < 1 OR p_duration_days > 30 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Duration must be between 1 and 30 days.';
        END IF;

        -- Step 1: Package toiri (draft hisebe)
        SET v_step = 'PACKAGE';
        INSERT INTO `packages`
            (destination_id, guide_profile_id, title, duration_days, duration_nights,
             price, status, created_at, updated_at)
        VALUES
            (p_destination_id, p_guide_profile_id, p_title, p_duration_days,
             GREATEST(p_duration_days - 1, 0), p_price, 'draft', NOW(), NOW());

        SET v_pkg_id = LAST_INSERT_ID();

        -- Step 2: Prottek diner jonno itinerary row
        SET v_step = 'ITINERARY';
        WHILE v_day <= p_duration_days DO
            INSERT INTO `package_itineraries`
                (package_id, day_number, title, created_at, updated_at)
            VALUES
                (v_pkg_id, v_day, CONCAT('Day ', v_day), NOW(), NOW());
            SET v_day = v_day + 1;
        END WHILE;

        SAVEPOINT after_itinerary;

        -- Step 3: Category link (invalid category_id hole FK error)
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
END //

DELIMITER ;

-- Test 1: Shob thik (destination 1, guide profile 1, category 1 ache dhore neya hoyeche)
CALL sp_CreatePackageWithItinerary(1, 1, 'Test Sajek Weekend Trek', 9500.00, 3, 1);

-- Test 2: Category id 9999 nai -> PARTIAL_SUCCESS (package + itinerary thake)
CALL sp_CreatePackageWithItinerary(1, 1, 'Test Package No Category', 8000.00, 2, 9999);

-- Test 3: Price negative -> FAILED (kichui save hoy na)
CALL sp_CreatePackageWithItinerary(1, 1, 'Test Bad Price', -500.00, 2, 1);

-- Verify
SELECT id, title, price, status, duration_days FROM `packages` ORDER BY id DESC LIMIT 3;
SELECT package_id, day_number, title FROM `package_itineraries` ORDER BY id DESC LIMIT 5;