/*
=========================================================
BOOKING MANAGEMENT DATABASE OPERATIONS
=========================================================

Member's tables:

1. hotels
2. package_hotels
3. bookings
4. payments
5. reviews

Related tables required for the relationships:

- users
- packages

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

Relationships:

packages
    |
    | M : M
    v
package_hotels
    |
    v
hotels


users
    |
    | 1 : M
    v
bookings
    |
    +---- payments
    |
    +---- reviews


The query connects all relevant information.
=========================================================
*/

SELECT
    b.booking_id,
    b.travel_date,
    b.total_travelers,
    b.total_price,
    b.booking_status,

    u.id AS traveler_id,
    u.name AS traveler_name,
    u.email AS traveler_email,
    u.phone AS traveler_phone,

    p.id AS package_id,
    p.title AS package_title,
    p.price AS package_price,

    pay.payment_id,
    pay.transaction_id,
    pay.amount AS payment_amount,
    pay.payment_status,

    r.review_id,
    r.rating AS review_rating,
    r.comment AS review_comment,

    h.hotel_id,
    h.hotel_name,
    h.address AS hotel_address,
    h.star_rating

FROM bookings AS b

INNER JOIN users AS u
    ON u.id = b.traveler_id

INNER JOIN packages AS p
    ON p.id = b.package_id

LEFT JOIN payments AS pay
    ON pay.booking_id = b.booking_id

LEFT JOIN reviews AS r
    ON r.booking_id = b.booking_id

LEFT JOIN package_hotels AS ph
    ON ph.package_id = p.id

LEFT JOIN hotels AS h
    ON h.hotel_id = ph.hotel_id

ORDER BY
    b.booking_id DESC,
    pay.payment_id,
    r.review_id,
    h.hotel_id;


/*
=========================================================
2. AGGREGATE FUNCTIONS
=========================================================

Functions:

COUNT()
SUM()
AVG()
MIN()
MAX()

Statistics are grouped by package.

Important:
DISTINCT is used for IDs to avoid counting the same
booking/payment/review multiple times when a package
has multiple hotels.
=========================================================
*/

SELECT
    p.id AS package_id,
    p.title AS package_title,

    COUNT(
        DISTINCT b.booking_id
    )
        AS total_bookings,

    COALESCE(
        SUM(
            DISTINCT b.total_travelers
        ),
        0
    )
        AS total_travelers,

    COALESCE(
        SUM(
            DISTINCT b.total_price
        ),
        0
    )
        AS total_booking_value,

    COALESCE(
        AVG(
            b.total_price
        ),
        0
    )
        AS average_booking_price,

    COALESCE(
        MIN(
            b.total_price
        ),
        0
    )
        AS minimum_booking_price,

    COALESCE(
        MAX(
            b.total_price
        ),
        0
    )
        AS maximum_booking_price,

    COUNT(
        DISTINCT pay.payment_id
    )
        AS total_payments,

    COALESCE(
        SUM(
            pay.amount
        ),
        0
    )
        AS total_payment_amount,

    COUNT(
        DISTINCT r.review_id
    )
        AS total_reviews,

    COALESCE(
        AVG(
            r.rating
        ),
        0
    )
        AS average_review_rating,

    COUNT(
        DISTINCT ph.hotel_id
    )
        AS total_hotels

FROM packages AS p

LEFT JOIN bookings AS b
    ON b.package_id = p.id

LEFT JOIN payments AS pay
    ON pay.booking_id = b.booking_id

LEFT JOIN reviews AS r
    ON r.package_id = p.id

LEFT JOIN package_hotels AS ph
    ON ph.package_id = p.id

GROUP BY
    p.id,
    p.title

ORDER BY
    total_bookings DESC;


/*
=========================================================
3. SUBQUERY
=========================================================

Purpose:

Find packages that have more bookings than the
average booking count per package.

There are TWO levels of subquery:

1. Count bookings for the current package.

2. Calculate the average booking count of all packages.

This makes the subquery operation more substantial
for the database assignment.
=========================================================
*/

SELECT
    p.id AS package_id,
    p.title AS package_title,
    p.price,

    (
        SELECT
            COUNT(*)

        FROM bookings AS b

        WHERE b.package_id = p.id

    ) AS total_bookings

FROM packages AS p

WHERE (

    SELECT
        COUNT(*)

    FROM bookings AS b1

    WHERE b1.package_id = p.id

) > (

    SELECT
        AVG(package_booking_count)

    FROM (

        SELECT
            p2.id,

            COUNT(
                b2.booking_id
            ) AS package_booking_count

        FROM packages AS p2

        LEFT JOIN bookings AS b2
            ON b2.package_id = p2.id

        GROUP BY
            p2.id

    ) AS booking_statistics

)

ORDER BY
    total_bookings DESC;