<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Demo data for HikKing: one admin, four travelers, tours across Bangladesh,
 * reservations in every status, reviews, support requests and stories.
 *
 * Every account uses the password: password123
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {

        // Prevent duplicate demo data on an existing database
        if (DB::table('users')->exists()) {
            $this->command?->warn('Demo seeding skipped: users already exist.');
            return;
        }
        
        $password = Hash::make('password123');
        $now = now();
        $day = fn (int $n) => $now->copy()->addDays($n)->toDateString();

        /* ------------------------------------------------------------ Users */
        $user = fn ($id, $name, $email, $phone, $role) => [
            'id' => $id, 'name' => $name, 'email' => $email, 'phone' => $phone, 'role' => $role,
            'password' => $password, 'created_at' => $now, 'updated_at' => $now,
        ];

        DB::table('users')->insert([
            $user(1, 'System Admin', 'admin@hikking.com', '01700000001', 'admin'),
            $user(2, 'Aiman Ahmed', 'traveler@test.com', '01744000005', 'traveler'),
            $user(3, 'Tanvir Rahman', 'tanvir@test.com', '01755000006', 'traveler'),
            $user(4, 'Nusrat Jahan', 'nusrat@test.com', '01766000007', 'traveler'),
            $user(5, 'Farhan Kabir', 'farhan@test.com', '01777000008', 'traveler'),
        ]);

        /* ----------------------------------------------------- Destinations */
        $dest = fn ($id, $name, $desc, $loc) => [
            'destination_id' => $id, 'name' => $name, 'description' => $desc, 'location' => $loc,
            'created_at' => $now, 'updated_at' => $now,
        ];

        DB::table('destinations')->insert([
            $dest(1, "Cox's Bazar", "One of the world's longest unbroken sea beaches, with Marine Drive and sunset walks.", 'Chattogram'),
            $dest(2, 'Bandarban', 'The tallest hills in the country, with viewpoints like Nilgiri, waterfalls and mountain trails.', 'Chattogram Hill Tracts'),
            $dest(3, 'Sajek Valley', 'A ridge-top valley where the clouds sit below your feet at sunrise.', 'Rangamati'),
            $dest(4, 'Sreemangal', 'The tea capital, with rolling estates, forest trails and Lawachara National Park.', 'Moulvibazar'),
            $dest(5, 'Sylhet & Ratargul', 'Emerald tea gardens, river bends and the Ratargul freshwater swamp forest.', 'Sylhet'),
            $dest(6, 'Sundarbans', 'The largest mangrove forest on Earth, explored by boat through tidal channels.', 'Khulna'),
            $dest(7, 'Kaptai Lake, Rangamati', 'A reservoir lake dotted with green islands, hanging bridges and hill markets.', 'Rangamati'),
            $dest(8, "Saint Martin's Island", 'A small coral island with clear water and unhurried days.', 'Bay of Bengal'),
        ]);

        /* ------------------------------------------------------- Categories */
        // These names match the filters on the website (Hills, Beach, Nature, Adventure, Lake)
        DB::table('categories')->insert([
            ['category_id' => 1, 'category_name' => 'Hills', 'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 2, 'category_name' => 'Beach', 'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 3, 'category_name' => 'Nature', 'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 4, 'category_name' => 'Adventure', 'created_at' => $now, 'updated_at' => $now],
            ['category_id' => 5, 'category_name' => 'Lake', 'created_at' => $now, 'updated_at' => $now],
        ]);

        /* ------------------------------------------------------------ Hotels */
        $hotel = fn ($id, $name, $addr, $stars) => [
            'hotel_id' => $id, 'hotel_name' => $name, 'address' => $addr, 'star_rating' => $stars,
            'created_at' => $now, 'updated_at' => $now,
        ];

        DB::table('hotels')->insert([
            $hotel(1, 'Sayeman Beach Resort', "Marine Drive, Kolatoli, Cox's Bazar", 5),
            $hotel(2, 'Boga Lake Eco Cottage', 'Boga Lake Trailhead, Ruma, Bandarban', 3),
            $hotel(3, 'Sajek Resort & Cottage', 'Ruilui Para, Sajek Valley', 4),
            $hotel(4, 'Grand Sultan Tea Resort', 'Radhanagar, Sreemangal', 5),
            $hotel(5, 'Lakeview Cottage', 'Reserve Bazar, Rangamati', 4),
        ]);

        /* ---------------------------------------------------------- Packages */
        // image_url paths point at images shipped with the frontend (public/images, public/hero)
        $pkg = fn ($id, $dest, $title, $desc, $days, $nights, $price, $max, $status, $img) => [
            'id' => $id, 'destination_id' => $dest, 'title' => $title, 'description' => $desc,
            'duration_days' => $days, 'duration_nights' => $nights, 'price' => $price,
            'max_travelers' => $max, 'status' => $status, 'image_url' => $img,
            'created_at' => $now, 'updated_at' => $now,
        ];

        DB::table('packages')->insert([
            $pkg(1, 1, "Cox's Bazar Beach & Marine Drive Tour", 'A three-day coastal trip covering Inani beach, Himchari and a drive along Marine Drive.', 3, 2, 8500, 12, 'published', '/images/packages/marine-drive.jpg'),
            $pkg(2, 2, 'Keokradong Summit Trek & Boga Lake Camp', 'A high-adventure mountain trail up Keokradong with lakeside camping.', 4, 3, 14500, 10, 'published', '/images/packages/nilgiri.jpg'),
            $pkg(3, 3, 'Sajek Valley Cloud Peak Trek', 'Sunrise above the clouds, a Konglak peak hike and village visits.', 3, 2, 9500, 15, 'published', '/images/packages/sajek.jpg'),
            $pkg(4, 4, 'Lawachara Rainforest Nature Walk', 'A quiet canopy trail walk, tea garden cycling and birdwatching.', 2, 1, 6000, 8, 'draft', '/hero/sylhet.jpg'),
            $pkg(5, 2, 'Amiakhum Waterfall Expedition', 'A demanding jungle expedition through Nafakhum and Remakri trails.', 5, 4, 18000, 6, 'draft', '/images/packages/nilgiri.jpg'),
            $pkg(6, 8, 'Saint Martin Coral Island Escape', 'A seasonal ferry trip to the coral island with beach walks and sunsets.', 3, 2, 11000, 15, 'published', '/images/packages/saintmartin.jpg'),
            $pkg(7, 5, 'Sylhet Tea Trails & Ratargul Swamp Forest', 'Tea gardens, river scenery and a boat ride through the swamp forest.', 2, 1, 4250, 14, 'published', '/images/packages/ratargul.jpg'),
            $pkg(8, 6, 'Sundarbans River & Mangrove Cruise', 'Cruise the mangrove channels with planned stops and wildlife watching.', 3, 2, 6400, 14, 'published', '/images/packages/sundarbans.jpg'),
            $pkg(9, 7, 'Kaptai Lake Slow Living', 'Lake views, boat rides and an easygoing stay among green hills.', 3, 2, 5600, 12, 'published', '/images/packages/kaptai.jpg'),
            $pkg(10, 1, 'Blue Coast Camping Escape', 'A beachside camp, a bonfire evening and salty morning air.', 2, 1, 3800, 20, 'published', '/images/packages/coxsbazar-camping.jpg'),
        ]);

        DB::table('package_categories')->insert([
            ['package_id' => 1, 'category_id' => 2],
            ['package_id' => 2, 'category_id' => 4],
            ['package_id' => 2, 'category_id' => 1],
            ['package_id' => 3, 'category_id' => 1],
            ['package_id' => 4, 'category_id' => 3],
            ['package_id' => 5, 'category_id' => 4],
            ['package_id' => 6, 'category_id' => 2],
            ['package_id' => 7, 'category_id' => 3],
            ['package_id' => 8, 'category_id' => 3],
            ['package_id' => 9, 'category_id' => 5],
            ['package_id' => 10, 'category_id' => 2],
            ['package_id' => 10, 'category_id' => 4],
        ]);

        DB::table('package_hotels')->insert([
            ['package_id' => 1, 'hotel_id' => 1],
            ['package_id' => 2, 'hotel_id' => 2],
            ['package_id' => 3, 'hotel_id' => 3],
            ['package_id' => 4, 'hotel_id' => 4],
            ['package_id' => 7, 'hotel_id' => 4],
            ['package_id' => 9, 'hotel_id' => 5],
        ]);

        $it = fn ($pkg, $n, $title, $desc, $loc) => [
            'package_id' => $pkg, 'day_number' => $n, 'title' => $title, 'description' => $desc,
            'location' => $loc, 'created_at' => $now, 'updated_at' => $now,
        ];

        DB::table('package_itineraries')->insert([
            $it(1, 1, 'Arrival and sunset on the beach', 'Check in to the hotel and walk to Laboni Point for the sunset.', 'Laboni Beach'),
            $it(1, 2, 'Marine Drive and Inani', 'A drive along Marine Drive to Inani, with stops at the rocks and Himchari.', 'Inani Beach'),
            $it(1, 3, 'Slow morning and return', 'Breakfast by the sea, free time, then the journey home.', "Cox's Bazar"),
            $it(2, 1, 'Bandarban to Ruma and Boga Lake', 'Drive into the hills and trek up to the lake campsite.', 'Ruma Bazar'),
            $it(2, 2, 'Summit day', 'An early start for the Keokradong summit, back to camp by afternoon.', 'Keokradong'),
            $it(2, 3, 'Valley walk', 'A gentler day walking through villages and viewpoints.', 'Boga Lake'),
            $it(2, 4, 'Descent and return', 'Walk down, lunch in Bandarban and travel back.', 'Bandarban'),
            $it(3, 1, 'Journey to the hills', 'Travel overnight and settle into the cottage.', 'Sajek Valley'),
            $it(3, 2, 'Ridge walks and village visits', 'Walk the ridge, visit a para village and watch sunset from the viewpoint.', 'Konglak'),
            $it(3, 3, 'Sunrise and return', 'Sunrise above the clouds, breakfast, then the way home.', 'Sajek Valley'),
            $it(7, 1, 'Tea country', 'Walk through a tea estate and enjoy the evening at your stay.', 'Sreemangal'),
            $it(7, 2, 'Ratargul and back', 'Boat through the swamp forest when water levels allow, then return.', 'Ratargul'),
            $it(9, 1, 'Lakeside arrival', 'Travel to Rangamati and settle in with a view of the water.', 'Rangamati'),
            $it(9, 2, 'On the lake', 'A boat outing across the lake at your own pace.', 'Kaptai Lake'),
            $it(9, 3, 'Return', 'Breakfast, free time and the journey home.', 'Rangamati'),
        ]);

        /* --------------------------------------------------------- Bookings */
        // Reservation requests in every status. Dates are relative to the day you seed.
        $booking = fn ($id, $traveler, $pkg, $date, $pax, $price, $status) => [
            'booking_id' => $id, 'traveler_id' => $traveler, 'package_id' => $pkg, 'travel_date' => $date,
            'total_travelers' => $pax, 'total_price' => $price * $pax, 'booking_status' => $status,
            'created_at' => $now, 'updated_at' => $now,
        ];

        DB::table('bookings')->insert([
            $booking(1001, 2, 1, $day(-40), 2, 8500, 'completed'),
            $booking(1002, 3, 1, $day(-25), 1, 8500, 'completed'),
            $booking(1003, 4, 1, $day(20), 3, 8500, 'pending'),
            $booking(1004, 2, 2, $day(-10), 2, 14500, 'completed'),
            $booking(1005, 5, 2, $day(30), 1, 14500, 'confirmed'),
            $booking(1006, 4, 3, $day(12), 2, 9500, 'pending'),
            $booking(1007, 2, 6, $day(45), 2, 11000, 'confirmed'),
            $booking(1008, 3, 7, $day(8), 2, 4250, 'confirmed'),
            $booking(1009, 5, 9, $day(-5), 2, 5600, 'cancelled'),
        ]);

        /* ---------------------------------------------------------- Reviews */
        // Only completed trips can be reviewed
        DB::table('reviews')->insert([
            ['booking_id' => 1001, 'traveler_id' => 2, 'package_id' => 1, 'rating' => 5, 'comment' => 'Spectacular views and a well organised trip from start to finish.', 'created_at' => $now, 'updated_at' => $now],
            ['booking_id' => 1002, 'traveler_id' => 3, 'package_id' => 1, 'rating' => 4, 'comment' => 'Great experience. The hotel breakfast could be better.', 'created_at' => $now, 'updated_at' => $now],
            ['booking_id' => 1004, 'traveler_id' => 2, 'package_id' => 2, 'rating' => 5, 'comment' => 'A tough climb, and the summit view was worth every step.', 'created_at' => $now, 'updated_at' => $now],
        ]);

        /* -------------------------------------------------------- Complaints */
        DB::table('complaints')->insert([
            ['booking_id' => 1003, 'user_id' => 4, 'subject' => 'Can we move our travel date to the following weekend?', 'status' => 'open', 'created_at' => $now, 'updated_at' => $now],
            ['booking_id' => 1001, 'user_id' => 2, 'subject' => 'The pick-up point changed without a notice.', 'status' => 'resolved', 'created_at' => $now->copy()->subDays(30), 'updated_at' => $now->copy()->subDays(28)],
        ]);

        /* ----------------------------------------------------- Notifications */
        $note = fn ($user, $type, $msg, $read, $ago) => [
            'user_id' => $user, 'type' => $type, 'message' => $msg, 'is_read' => $read,
            'created_at' => $now->copy()->subHours($ago), 'updated_at' => $now->copy()->subHours($ago),
        ];

        DB::table('notifications')->insert([
            // Admin
            $note(1, 'new_booking', 'Nusrat Jahan requested "Cox\'s Bazar Beach & Marine Drive Tour" for 3 traveler(s).', false, 2),
            $note(1, 'new_booking', 'Nusrat Jahan requested "Sajek Valley Cloud Peak Trek" for 2 traveler(s).', false, 5),
            $note(1, 'complaint_new', 'Nusrat Jahan opened a support request about "Cox\'s Bazar Beach & Marine Drive Tour".', false, 3),
            $note(1, 'story_submitted', 'Tanvir Rahman shared a story: "Four seconds of silence". It is waiting for review.', false, 20),
            // Travelers
            $note(2, 'booking_status_updated', 'Your reservation for "Saint Martin Coral Island Escape" was confirmed.', false, 4),
            $note(2, 'story_approved', 'Your story "Sunrise over the Bay" is now on the stories wall.', true, 72),
            $note(3, 'booking_status_updated', 'Your reservation for "Sylhet Tea Trails & Ratargul Swamp Forest" was confirmed.', true, 30),
        ]);

        /* ----------------------------------------------------- Stories */
        // Photos are uploaded by travelers, so seeded stories have text only
       // DB::table('experiences')->insert([
            //[
              //  'user_id' => 2, 'title' => 'Sunrise over the Bay', 'place' => "Cox's Bazar", 'status' => 'approved',
                //'story' => 'We reached the beach before the sun and had the whole shoreline to ourselves. Cold tea, wet feet and the best morning of the trip.',
                //'created_at' => $now->copy()->subDays(20), 'updated_at' => $now->copy()->subDays(19),
            //],
            //[
              //  'user_id' => 3, 'title' => 'Four seconds of silence', 'place' => "Cox's Bazar", 'status' => 'pending',
                //'story' => 'The driver switched off the engine on Marine Drive and for a moment there was only the sea. I will remember that longer than any photo.',
                //'created_at' => $now->copy()->subHours(20), 'updated_at' => $now->copy()->subHours(20),
            //],
        //]);
    }
}
