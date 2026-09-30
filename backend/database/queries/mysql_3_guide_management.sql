/*
================================================================================
HIKKING PROJECT - ADVANCED DATABASE OPERATIONS
GUIDE MANAGEMENT
Target DBMS : MySQL 8.4
Member      : ______________________________
Tables      : users, guide_profiles, verification_documents, notifications, complaints
================================================================================
  Part           Object                                         Status
  1. View        vw_GuideVerificationSummary                    NEW
  2. Procedure   sp_VerifyGuide                                 NEW
  3. Trigger     trg_guide_verified_notify                      NEW
  4. Transaction sp_ResolveComplaint                            NEW
================================================================================
*/

USE `hikking`;


-- 1) VIEW: vw_GuideVerificationSummary  (Derived tables + Aggregation + CASE)


DROP VIEW IF EXISTS `vw_GuideVerificationSummary`;

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
        WHEN COALESCE(vd.total_docs, 0) = 0             THEN 'No Documents'
        WHEN COALESCE(vd.rejected_docs, 0) > 0          THEN 'Has Rejected Documents'
        WHEN vd.approved_docs = vd.total_docs           THEN 'Ready To Verify'
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
    -- complaint -> booking -> package -> guide
    SELECT p.guide_profile_id,
           COUNT(*) AS total_complaints,
           SUM(CASE WHEN c.status IN ('open', 'in_progress') THEN 1 ELSE 0 END) AS open_complaints
    FROM `complaints` AS c
    INNER JOIN `bookings` AS b ON b.booking_id = c.booking_id
    INNER JOIN `packages` AS p ON p.id = b.package_id
    GROUP BY p.guide_profile_id
) AS cm ON cm.guide_profile_id = gp.id;

-- Test View Query
SELECT * FROM `vw_GuideVerificationSummary`
ORDER BY GuideProfileID;


-- ================================================================================
-- 2) STORED PROCEDURE: sp_VerifyGuide  (IF / ELSEIF / ELSE + aggregate checks)

-- ================================================================================

DROP PROCEDURE IF EXISTS `sp_VerifyGuide`;

DELIMITER //

CREATE PROCEDURE `sp_VerifyGuide`(IN p_guide_profile_id BIGINT)
BEGIN
    DECLARE v_user_id  BIGINT DEFAULT NULL;
    DECLARE v_status   VARCHAR(20) DEFAULT NULL;
    DECLARE v_total    INT DEFAULT 0;
    DECLARE v_approved INT DEFAULT 0;

    -- Row na pele error na diye continue korbe
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
END //

DELIMITER ;

-- Test Cases (seed data onujayi: guide profile 1,2 = verified; 3 = pending, user_id 4)
CALL sp_VerifyGuide(999);  -- Not found
CALL sp_VerifyGuide(1);    -- Already verified
CALL sp_VerifyGuide(3);    -- Document nai / approved na -> REJECTED


-- ================================================================================
-- 3) TRIGGER: trg_guide_verified_notify  (AFTER UPDATE ON guide_profiles)

-- ================================================================================

DROP TRIGGER IF EXISTS `trg_guide_verified_notify`;

DELIMITER //

CREATE TRIGGER `trg_guide_verified_notify`
AFTER UPDATE ON `guide_profiles`
FOR EACH ROW
BEGIN
    -- Shudhu status 'verified'-e BODLALE fire korbe (null-safe <=>)
    IF NOT (OLD.verification_status <=> NEW.verification_status)
       AND NEW.verification_status = 'verified' THEN
        INSERT INTO `notifications`
            (user_id, type, message, is_read, created_at, updated_at)
        VALUES
            (NEW.user_id, 'guide_verified',
             'Congratulations! Your guide profile has been verified.',
             0, NOW(), NOW());
    END IF;
END //

DELIMITER ;

-- Test 1: Guide 3-er ekta approved document dao, tarpor verify koro (Trigger MUST fire)
INSERT INTO `verification_documents`
    (guide_profile_id, document_type, document_url, status, created_at, updated_at)
VALUES (3, 'NID', 'nid_guide3.jpg', 'approved', NOW(), NOW());

CALL sp_VerifyGuide(3);

SELECT * FROM `notifications` ORDER BY notification_id DESC LIMIT 3;

-- Test 2: Onno column bodlale trigger fire hobe na
UPDATE `guide_profiles` SET bio = CONCAT(COALESCE(bio, ''), ' ') WHERE id = 1;
SELECT * FROM `notifications` ORDER BY notification_id DESC LIMIT 3;


-- ================================================================================
-- 4) TRANSACTION: sp_ResolveComplaint  (START TRANSACTION + HANDLER + SIGNAL)

-- ================================================================================

DROP PROCEDURE IF EXISTS `sp_ResolveComplaint`;

DELIMITER //

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
END //

DELIMITER ;


CALL sp_ResolveComplaint(1, 'resolved');   
CALL sp_ResolveComplaint(1, 'resolved');   
CALL sp_ResolveComplaint(9999, 'resolved');
CALL sp_ResolveComplaint(1, 'bogus');      

SELECT * FROM `complaints` ORDER BY complaint_id;
SELECT * FROM `notifications` ORDER BY notification_id DESC LIMIT 3;