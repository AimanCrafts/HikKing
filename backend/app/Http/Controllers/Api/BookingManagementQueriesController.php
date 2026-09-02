<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class BookingManagementQueriesController extends Controller
{
    /**
     * =========================================================
     * JOIN QUERY
     * =========================================================
     *
     * Tables:
     *
     * hotels
     * package_hotels
     * bookings
     * payments
     * reviews
     *
     * Additional tables used for meaningful information:
     *
     * users
     * packages
     *
     * Main relationships:
     *
     * packages
     *      |
     *      | M : M
     *      v
     * package_hotels
     *      |
     *      v
     * hotels
     *
     * users
     *      |
     *      | 1 : M
     *      v
     * bookings
     *      |
     *      | 1 : M
     *      v
     * payments
     *
     * bookings
     *      |
     *      v
     * reviews
     */
    public function join(): JsonResponse
    {
        $results = DB::select("
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
                pay.payment_id ASC,
                r.review_id ASC,
                h.hotel_id ASC
        ");

        return response()->json([
            'success' => true,
            'operation' => 'JOIN',
            'title' => 'Booking Management - Joined Information',
            'data' => $results
        ]);
    }


    /**
     * =========================================================
     * AGGREGATE FUNCTION QUERY
     * =========================================================
     *
     * Functions used:
     *
     * COUNT()
     * SUM()
     * AVG()
     * MIN()
     * MAX()
     *
     * Statistics are calculated for each package.
     *
     * Derived tables are used so that multiple payments/reviews
     * do not incorrectly multiply each other's values.
     */
    public function aggregate(): JsonResponse
    {
        $results = DB::select("
            SELECT
                p.id AS package_id,
                p.title AS package_title,

                COUNT(DISTINCT b.booking_id)
                    AS total_bookings,

                COALESCE(
                    SUM(b.total_travelers),
                    0
                )
                    AS total_travelers,

                COALESCE(
                    SUM(b.total_price),
                    0
                )
                    AS total_booking_revenue,

                COALESCE(
                    AVG(b.total_price),
                    0
                )
                    AS average_booking_price,

                COALESCE(
                    MIN(b.total_price),
                    0
                )
                    AS minimum_booking_price,

                COALESCE(
                    MAX(b.total_price),
                    0
                )
                    AS maximum_booking_price,

                COUNT(DISTINCT r.review_id)
                    AS total_reviews,

                COALESCE(
                    AVG(r.rating),
                    0
                )
                    AS average_review_rating,

                COUNT(DISTINCT pay.payment_id)
                    AS total_payments,

                COALESCE(
                    SUM(pay.amount),
                    0
                )
                    AS total_payment_amount

            FROM packages AS p

            LEFT JOIN bookings AS b
                ON b.package_id = p.id

            LEFT JOIN payments AS pay
                ON pay.booking_id = b.booking_id

            LEFT JOIN reviews AS r
                ON r.package_id = p.id

            GROUP BY
                p.id,
                p.title

            ORDER BY
                total_bookings DESC
        ");

        return response()->json([
            'success' => true,
            'operation' => 'AGGREGATE',
            'title' => 'Booking Management - Package Statistics',
            'data' => $results
        ]);
    }


    /**
     * =========================================================
     * SUBQUERY
     * =========================================================
     *
     * Finds packages having a number of bookings greater
     * than the average number of bookings per package.
     *
     * The inner subquery calculates booking count for every
     * package.
     *
     * The outer subquery calculates the average of those counts.
     */
    public function subquery(): JsonResponse
    {
        $results = DB::select("
            SELECT
                p.id AS package_id,
                p.title AS package_title,
                p.price,

                (
                    SELECT COUNT(*)

                    FROM bookings AS b

                    WHERE b.package_id = p.id

                ) AS total_bookings

            FROM packages AS p

            WHERE (

                SELECT COUNT(*)

                FROM bookings AS b1

                WHERE b1.package_id = p.id

            ) > (

                SELECT AVG(package_booking_count)

                FROM (

                    SELECT
                        p2.id,

                        COUNT(b2.booking_id)
                            AS package_booking_count

                    FROM packages AS p2

                    LEFT JOIN bookings AS b2
                        ON b2.package_id = p2.id

                    GROUP BY
                        p2.id

                ) AS booking_statistics

            )

            ORDER BY
                total_bookings DESC
        ");

        return response()->json([
            'success' => true,
            'operation' => 'SUBQUERY',
            'title' => 'Booking Management - Above Average Booked Packages',
            'data' => $results
        ]);
    }
}