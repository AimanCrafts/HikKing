

USE `hikking`;






DROP VIEW IF EXISTS `OutstandingBookings`;

CREATE VIEW `OutstandingBookings` AS
SELECT
    b.booking_id AS BookingID,
    u.name AS TravelerName,
    u.email AS TravelerEmail,
    p.title AS PackageTitle,
    d.name AS DestinationName,
    b.travel_date AS TravelDate,
    b.total_travelers AS TotalTravelers,
    b.total_price AS TotalPrice,
    b.booking_status AS BookingStatus,
    COALESCE(SUM(CASE WHEN pay.payment_status = 'paid' THEN pay.amount ELSE 0 END), 0)
        AS PaidAmount,
    COALESCE(SUM(CASE WHEN pay.payment_status IN ('pending', 'failed') THEN pay.amount ELSE 0 END), 0)
        AS UnpaidAmount
FROM `bookings` AS b
INNER JOIN `users` AS u ON b.traveler_id = u.id
INNER JOIN `packages` AS p ON b.package_id = p.id
INNER JOIN `destinations` AS d ON p.destination_id = d.destination_id
LEFT JOIN `payments` AS pay ON b.booking_id = pay.booking_id
WHERE b.booking_status IN ('pending', 'confirmed')
GROUP BY
    b.booking_id,
    u.name,
    u.email,
    p.title,
    d.name,
    b.travel_date,
    b.total_travelers,
    b.total_price,
    b.booking_status;

-- Test View Query
SELECT * FROM `OutstandingBookings`
ORDER BY TravelDate;


DROP PROCEDURE IF EXISTS `sp_TravelerBookingStatus`;

DELIMITER //

CREATE PROCEDURE `sp_TravelerBookingStatus`(IN p_traveler_id INT)
BEGIN
    DECLARE v_name          VARCHAR(150) DEFAULT NULL;
    DECLARE v_booking_count INT DEFAULT 0;
    DECLARE v_total_spend   DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_unpaid        DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_status        VARCHAR(20) DEFAULT 'Clear';

    DECLARE CONTINUE HANDLER FOR NOT FOUND BEGIN END;


    SELECT name INTO v_name
    FROM `users`
    WHERE id = p_traveler_id;

    IF v_name IS NULL THEN
        SELECT 'Traveler not found' AS result,
               NULL AS Name,
               NULL AS BookingCount,
               NULL AS TotalSpend,
               NULL AS UnpaidAmount,
               NULL AS Status;
    ELSE
        -- 2. Count bookings
        SELECT COUNT(*) INTO v_booking_count
        FROM `bookings`
        WHERE traveler_id = p_traveler_id;

        -- Edge case: Traveler exists but has no bookings
        IF v_booking_count = 0 THEN
            SELECT CONCAT(v_name, ' has no booking record') AS result,
                   v_name  AS Name,
                   0       AS BookingCount,
                   0.00    AS TotalSpend,
                   0.00    AS UnpaidAmount,
                   'Clear' AS Status;
        ELSE
            -- 3. Calculate total spend
            SELECT COALESCE(SUM(total_price), 0) INTO v_total_spend
            FROM `bookings`
            WHERE traveler_id = p_traveler_id;

            -- 4. Calculate unpaid balance
            SELECT COALESCE(SUM(
                       CASE
                           WHEN pay.payment_status IN ('pending', 'failed')
                           THEN pay.amount
                           ELSE 0
                       END
                   ), 0)
            INTO v_unpaid
            FROM `bookings` AS b
            LEFT JOIN `payments` AS pay ON pay.booking_id = b.booking_id
            WHERE b.traveler_id = p_traveler_id;

            -- 5. Business logic categorization
            SET v_status =
                CASE
                    WHEN v_unpaid >= 10000 THEN 'Blocked'
                    WHEN v_unpaid >= 3000  THEN 'Warning'
                    ELSE 'Clear'
                END;

            -- Output record
            SELECT 'OK'            AS result,
                   v_name          AS Name,
                   v_booking_count AS BookingCount,
                   v_total_spend   AS TotalSpend,
                   v_unpaid        AS UnpaidAmount,
                   v_status        AS Status;
        END IF;
    END IF;
END //

DELIMITER ;


CALL sp_TravelerBookingStatus(5); -- Aiman Ahmed (Clear, 3 bookings)
CALL sp_TravelerBookingStatus(7); -- Nusrat Jahan (Blocked: unpaid >= 10000)
CALL sp_TravelerBookingStatus(6); -- Tanvir Rahman (Clear)
CALL sp_TravelerBookingStatus(1); -- Admin/No bookings
CALL sp_TravelerBookingStatus(999); -- Non-existent user




DROP TRIGGER IF EXISTS `trg_booking_notify_guide`;

DELIMITER //

CREATE TRIGGER `trg_booking_notify_guide`
AFTER INSERT ON `bookings`
FOR EACH ROW
BEGIN
    DECLARE v_guide_user_id BIGINT DEFAULT NULL;
    DECLARE v_pkg_title     VARCHAR(200) DEFAULT NULL;
    DECLARE v_traveler_name VARCHAR(150) DEFAULT NULL;

    SELECT gp.user_id, p.title
    INTO   v_guide_user_id, v_pkg_title
    FROM   `packages` AS p
    LEFT JOIN `guide_profiles` AS gp ON gp.id = p.guide_profile_id
    WHERE  p.id = NEW.package_id;

    SELECT name INTO v_traveler_name
    FROM `users`
    WHERE id = NEW.traveler_id;

    IF v_guide_user_id IS NOT NULL THEN
        INSERT INTO `notifications`
            (user_id, type, message, is_read, created_at, updated_at)
        VALUES (
            v_guide_user_id,
            'new_booking',
            CONCAT(COALESCE(v_traveler_name, 'A traveler'),
                   ' booked "', COALESCE(v_pkg_title, 'Package'),
                   '" on ', NEW.travel_date),
            0, NOW(), NOW()
        );
    END IF;
END //

DELIMITER ;


INSERT INTO `bookings`
    (traveler_id, package_id, travel_date, total_travelers, total_price, booking_status, created_at, updated_at)
VALUES (5, 1, '2026-12-30', 1, 5000.00, 'pending', NOW(), NOW());

SELECT * FROM `notifications` ORDER BY notification_id DESC LIMIT 3;





DROP PROCEDURE IF EXISTS `sp_CreateBookingWithPayment`;

DELIMITER //

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
        INSERT INTO `bookings`
            (traveler_id, package_id, travel_date, total_travelers,
             total_price, booking_status, created_at, updated_at)
        VALUES
            (p_traveler_id, p_package_id, p_travel_date, p_travelers,
             p_amount, 'pending', NOW(), NOW());

        SET v_booking_id = LAST_INSERT_ID();

        
        SAVEPOINT after_booking;

        
        SET v_step = 'PAYMENT_FAILED';
        INSERT INTO `payments`
            (booking_id, transaction_id, amount, payment_status, created_at, updated_at)
        VALUES
            (v_booking_id, CONCAT('TXN-', UUID()), p_amount, 'paid', NOW(), NOW());

        -- Step 3: Update booking status to confirmed
        UPDATE `bookings`
        SET booking_status = 'confirmed', updated_at = NOW()
        WHERE booking_id = v_booking_id;

        SET v_step = 'COMPLETED';

    COMMIT;

    SELECT 'OK' AS result,
           v_booking_id AS booking_id,
           CONCAT('Booking #', v_booking_id, ' created and confirmed successfully.') AS message,
           0 AS error_code,
           '' AS error_message;
END //

DELIMITER ;


CALL sp_CreateBookingWithPayment(5, 2, '2026-12-25', 2, 29000.00);

-- Verify Resulting Booking and Payment
SELECT * FROM `bookings` ORDER BY booking_id DESC LIMIT 1;
SELECT * FROM `payments` ORDER BY payment_id DESC LIMIT 1;