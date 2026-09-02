<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class GuideManagementQueriesController extends Controller
{
    /**
     * =========================================================
     * JOIN QUERY
     * =========================================================
     *
     * Tables:
     * users
     * guide_profiles
     * verification_documents
     * notifications
     * complaints
     *
     * Relationship:
     *
     * users
     *   |
     *   | 1 : 1
     *   v
     * guide_profiles
     *   |
     *   | 1 : M
     *   v
     * verification_documents
     *
     * users
     *   |
     *   | 1 : M
     *   v
     * notifications
     *
     * users
     *   |
     *   | 1 : M
     *   v
     * complaints
     */
    public function join(): JsonResponse
    {
        $results = DB::select("
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
                u.id ASC,
                vd.id ASC,
                n.notification_id ASC,
                c.complaint_id ASC
        ");

        return response()->json([
            'success' => true,
            'operation' => 'JOIN',
            'title' => 'Guide Management - Joined Information',
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
     * This query produces statistics about:
     *
     * - total guides
     * - average rating
     * - minimum experience
     * - maximum experience
     * - verification documents
     * - verified guides
     * - pending guides
     * - approved documents
     */
    public function aggregate(): JsonResponse
    {
        $results = DB::select("
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
                ON vd.guide_profile_id = gp.id
        ");

        return response()->json([
            'success' => true,
            'operation' => 'AGGREGATE',
            'title' => 'Guide Management - Aggregate Statistics',
            'data' => $results
        ]);
    }


    /**
     * =========================================================
     * SUBQUERY
     * =========================================================
     *
     * Finds guides whose rating is higher than
     * the average rating of all guides.
     */
    public function subquery(): JsonResponse
    {
        $results = DB::select("
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

                SELECT AVG(gp2.rating_avg)

                FROM guide_profiles AS gp2

            )

            ORDER BY
                gp.rating_avg DESC,
                gp.experience_years DESC
        ");

        return response()->json([
            'success' => true,
            'operation' => 'SUBQUERY',
            'title' => 'Guide Management - Above Average Rated Guides',
            'data' => $results
        ]);
    }
}