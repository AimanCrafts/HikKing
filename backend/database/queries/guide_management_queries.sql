/*
=========================================================
GUIDE MANAGEMENT DATABASE OPERATIONS
=========================================================

Member's tables:

1. users
2. guide_profiles
3. verification_documents
4. notifications
5. complaints

Operations:

1. JOIN
2. AGGREGATE FUNCTIONS
3. SUBQUERY
=========================================================
*/


/*
=========================================================
1. JOIN
=========================================================

Purpose:
Show guide information together with:

- guide profile
- verification documents
- notifications
- complaints

Relationships:

users
    |
    | 1 : 1
    v
guide_profiles
    |
    | 1 : M
    v
verification_documents

users
    |
    | 1 : M
    +---- notifications

users
    |
    | 1 : M
    +---- complaints
=========================================================
*/

SELECT
    u.id AS user_id,
    u.name AS guide_name,
    u.email,
    u.phone,
    u.role,

    gp.id AS guide_profile_id,
    gp.bio,
    gp.experience_years,
    gp.rating_avg,
    gp.verification_status,

    vd.id AS verification_document_id,
    vd.document_type,
    vd.document_url,
    vd.status AS document_status,

    n.notification_id,
    n.type AS notification_type,
    n.message AS notification_message,
    n.is_read AS notification_is_read,

    c.complaint_id,
    c.booking_id AS complaint_booking_id,
    c.subject AS complaint_subject,
    c.status AS complaint_status

FROM users AS u

INNER JOIN guide_profiles AS gp
    ON gp.user_id = u.id

LEFT JOIN verification_documents AS vd
    ON vd.guide_profile_id = gp.id

LEFT JOIN notifications AS n
    ON n.user_id = u.id

LEFT JOIN complaints AS c
    ON c.user_id = u.id

WHERE u.role = 'guide'

ORDER BY
    u.id,
    vd.id,
    n.notification_id,
    c.complaint_id;


/*
=========================================================
2. AGGREGATE FUNCTIONS
=========================================================

Functions used:

COUNT()
AVG()
MIN()
MAX()
SUM()

Purpose:
Calculate guide and verification statistics.
=========================================================
*/

SELECT

    COUNT(DISTINCT gp.id)
        AS total_guides,

    ROUND(
        AVG(gp.rating_avg),
        2
    )
        AS average_guide_rating,

    MIN(
        gp.experience_years
    )
        AS minimum_experience_years,

    MAX(
        gp.experience_years
    )
        AS maximum_experience_years,

    COUNT(DISTINCT vd.id)
        AS total_verification_documents,

    COUNT(
        DISTINCT CASE
            WHEN gp.verification_status = 'verified'
            THEN gp.id
        END
    )
        AS verified_guides,

    COUNT(
        DISTINCT CASE
            WHEN gp.verification_status = 'pending'
            THEN gp.id
        END
    )
        AS pending_guides,

    SUM(
        CASE
            WHEN vd.status = 'approved'
            THEN 1
            ELSE 0
        END
    )
        AS approved_documents,

    SUM(
        CASE
            WHEN vd.status = 'pending'
            THEN 1
            ELSE 0
        END
    )
        AS pending_documents

FROM guide_profiles AS gp

LEFT JOIN verification_documents AS vd
    ON vd.guide_profile_id = gp.id;


/*
=========================================================
3. SUBQUERY
=========================================================

Purpose:

Find guides whose rating is greater than
the average rating of all guides.

Outer query:
    Select individual guides.

Inner query:
    Calculate overall average guide rating.
=========================================================
*/

SELECT
    u.id AS user_id,
    u.name AS guide_name,
    u.email,
    u.phone,

    gp.id AS guide_profile_id,
    gp.experience_years,
    gp.rating_avg,
    gp.verification_status

FROM users AS u

INNER JOIN guide_profiles AS gp
    ON gp.user_id = u.id

WHERE gp.rating_avg > (

    SELECT
        AVG(gp2.rating_avg)

    FROM guide_profiles AS gp2

)

ORDER BY
    gp.rating_avg DESC,
    gp.experience_years DESC;