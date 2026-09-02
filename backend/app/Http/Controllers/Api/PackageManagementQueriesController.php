<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PackageManagementQueriesController extends Controller
{
    /**
     * =========================================================
     * JOIN QUERY
     * =========================================================
     *
     * Tables:
     *
     * destinations
     * packages
     * package_itineraries
     * categories
     * package_categories
     *
     * Relationships:
     *
     * destinations
     *      |
     *      | 1 : M
     *      v
     * packages
     *
     * packages
     *      |
     *      | 1 : M
     *      v
     * package_itineraries
     *
     * packages
     *      |
     *      | M : M
     *      v
     * package_categories
     *      |
     *      v
     * categories
     */
    public function join(): JsonResponse
    {
        $results = DB::select("
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
                p.id ASC,
                pi.day_number ASC,
                c.category_name ASC
        ");

        return response()->json([
            'success' => true,
            'operation' => 'JOIN',
            'title' => 'Package Management - Joined Information',
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
     * AVG()
     * MIN()
     * MAX()
     * SUM()
     *
     * Statistics are grouped by destination.
     */
    public function aggregate(): JsonResponse
    {
        $results = DB::select("
            SELECT
                d.destination_id,
                d.name AS destination_name,

                COUNT(DISTINCT p.id)
                    AS total_packages,

                ROUND(
                    AVG(p.price),
                    2
                )
                    AS average_package_price,

                MIN(p.price)
                    AS minimum_package_price,

                MAX(p.price)
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

                COUNT(DISTINCT pc.category_id)
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
                total_packages DESC
        ");

        return response()->json([
            'success' => true,
            'operation' => 'AGGREGATE',
            'title' => 'Package Management - Destination Statistics',
            'data' => $results
        ]);
    }


    /**
     * =========================================================
     * SUBQUERY
     * =========================================================
     *
     * Finds packages whose price is greater than
     * the average price of all packages.
     */
    public function subquery(): JsonResponse
    {
        $results = DB::select("
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

                SELECT AVG(p2.price)

                FROM packages AS p2

            )

            ORDER BY
                p.price DESC
        ");

        return response()->json([
            'success' => true,
            'operation' => 'SUBQUERY',
            'title' => 'Package Management - Above Average Price Packages',
            'data' => $results
        ]);
    }
}