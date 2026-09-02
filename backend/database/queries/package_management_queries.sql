/*
=========================================================
PACKAGE MANAGEMENT DATABASE OPERATIONS
=========================================================

Member's tables:

1. destinations
2. packages
3. package_itineraries
4. categories
5. package_categories

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

Combines:

destinations
    |
    | 1 : M
    v
packages
    |
    +---- package_itineraries
    |
    +---- package_categories
                |
                v
            categories
=========================================================
*/

SELECT
    p.id AS package_id,
    p.title AS package_title,
    p.description AS package_description,
    p.duration_days,
    p.duration_nights,
    p.price,
    p.max_travelers,
    p.status AS package_status,

    d.destination_id,
    d.name AS destination_name,
    d.description AS destination_description,
    d.location AS destination_location,

    c.category_id,
    c.category_name,

    pi.id AS itinerary_id,
    pi.day_number,
    pi.title AS itinerary_title,
    pi.description AS itinerary_description,
    pi.location AS itinerary_location,
    pi.start_time,
    pi.end_time

FROM packages AS p

INNER JOIN destinations AS d
    ON d.destination_id = p.destination_id

LEFT JOIN package_categories AS pc
    ON pc.package_id = p.id

LEFT JOIN categories AS c
    ON c.category_id = pc.category_id

LEFT JOIN package_itineraries AS pi
    ON pi.package_id = p.id

ORDER BY
    p.id,
    pi.day_number,
    c.category_name;


/*
=========================================================
2. AGGREGATE FUNCTIONS
=========================================================

Functions:

COUNT()
AVG()
MIN()
MAX()
SUM()

Statistics are grouped by destination.
=========================================================
*/

SELECT
    d.destination_id,
    d.name AS destination_name,

    COUNT(
        DISTINCT p.id
    )
        AS total_packages,

    ROUND(
        AVG(p.price),
        2
    )
        AS average_package_price,

    MIN(
        p.price
    )
        AS minimum_package_price,

    MAX(
        p.price
    )
        AS maximum_package_price,

    COALESCE(
        SUM(p.price),
        0
    )
        AS total_package_price,

    COALESCE(
        SUM(p.duration_days),
        0
    )
        AS total_duration_days,

    COALESCE(
        SUM(p.duration_nights),
        0
    )
        AS total_duration_nights,

    COUNT(
        DISTINCT pc.category_id
    )
        AS total_categories

FROM destinations AS d

LEFT JOIN packages AS p
    ON p.destination_id = d.destination_id

LEFT JOIN package_categories AS pc
    ON pc.package_id = p.id

GROUP BY
    d.destination_id,
    d.name

ORDER BY
    total_packages DESC;


/*
=========================================================
3. SUBQUERY
=========================================================

Purpose:

Find packages whose price is greater than
the average price of all packages.

Outer query:
    Individual packages.

Inner query:
    Average package price.
=========================================================
*/

SELECT
    p.id AS package_id,
    p.title AS package_title,
    p.price,
    p.duration_days,
    p.duration_nights,
    p.status AS package_status,

    d.name AS destination_name

FROM packages AS p

INNER JOIN destinations AS d
    ON d.destination_id = p.destination_id

WHERE p.price > (

    SELECT
        AVG(p2.price)

    FROM packages AS p2

)

ORDER BY
    p.price DESC;