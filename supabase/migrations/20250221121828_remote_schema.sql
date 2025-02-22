

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "tablefunc" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."calculate_tour_points_total"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
    events_played_count integer;
begin
    -- Calculate the yearly points and count of tournaments played for each player_id
    insert into public.tour_leaderboard(player_id, total_tour_points, events_played)
    select 
        NEW.player_id,
        sum(case when rank <= 5 then event_points else 0 end) as total_tour_points,
        count(distinct tournament_id) as events_played_count
    from (
        select 
            player_id,
            event_points,
            tournament_id,
            row_number() over (partition by player_id order by event_points desc) as rank
        from 
            results
        where 
            player_id = NEW.player_id
    ) as ranked_results
    where 
        rank <= 5 or events_played_count <= 5
    group by 
        player_id
    on conflict (player_id) do update
    set 
        total_tour_points = EXCLUDED.total_tour_points,
        events_played = (
            select count(distinct tournament_id) 
            from results 
            where player_id = NEW.player_id
        );

    return new;
end;$$;


ALTER FUNCTION "public"."calculate_tour_points_total"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_player_event_points_view"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
    tournament_names text;
    dynamic_sql text;
begin
    -- Get distinct tournament names as comma-separated string
    select string_agg(quote_ident(lower(replace(tournament_name, ' ', '_'))) || '_points int', ', ')
    into tournament_names
    from (select distinct tournament_name from tournaments) as t;

    -- Generate dynamic SQL query for creating the view
    dynamic_sql := '
    create or replace view player_event_points as
    select *
    from crosstab(
        ''select player_id, tournament_name, event_points
         from results
         join tournaments on results.tournament_id = tournaments.id
         order by player_id, tournament_name'',
        ''select distinct tournament_name from tournaments order by tournament_name''
    ) as ct(player_id text, ' || tournament_names || ');
    ';

    -- Execute the dynamic SQL query
    EXECUTE dynamic_sql;
end;$$;


ALTER FUNCTION "public"."generate_player_event_points_view"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_first_place_players"("tournament_id_to_search" "uuid") RETURNS TABLE("first_name" "text", "last_name" "text", "division" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.first_name, 
        p.last_name,
        r.division
    FROM 
        results r 
    JOIN 
        players p ON r.player_id = p.id 
    WHERE 
        r.tournament_id = tournament_id_to_search 
        AND r.division_placing = '1';
END; 
$$;


ALTER FUNCTION "public"."get_first_place_players"("tournament_id_to_search" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_player_results_report"() RETURNS TABLE("player_name" "text", "division_assigned" "text", "divisions_entered" "text"[], "results" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        CONCAT(p.first_name, ' ', p.last_name) AS player_name,
        p.division AS division_assigned,
        ARRAY_AGG(DISTINCT r.division) AS divisions_entered,
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'division', r.division,
                'tournament_name', t.tournament_name,
                'division_placing', r.division_placing,
                'overall_placing', r.overall_placing,
                'points', r.event_points,
                'isResultCounted', r.is_counted
            )
        )::jsonb AS results
    FROM
        players p
        JOIN results r ON p.id = r.player_id
        LEFT JOIN tournaments t ON r.tournament_id = t.id
    GROUP BY
        p.id
    HAVING
        COUNT(DISTINCT r.division) > 1
    ORDER BY
        player_name;
END;
$$;


ALTER FUNCTION "public"."get_player_results_report"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_top_players_by_division"("p_division" "text") RETURNS TABLE("player_id" "uuid", "events_played" bigint, "total_tour_points" bigint, "rank" bigint, "division_placing" bigint, "name" "text", "division" "text", "points_average" numeric)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    WITH RankedPlayers AS (
        SELECT
            tl.player_id,
            tl.events_played,
            tl.total_tour_points,
            RANK() OVER (
                ORDER BY
                    tl.total_tour_points DESC
            ) AS rank,
            RANK() OVER (
                PARTITION BY
                    players.division
                ORDER BY
                    tl.total_tour_points DESC
            ) AS division_placing,
            CONCAT(players.first_name, ' ', players.last_name) AS name,
            players.division,
            ROW_NUMBER() OVER (
                PARTITION BY
                    players.division
                ORDER BY
                    tl.total_tour_points DESC
            ) AS row_num,
            CASE 
                WHEN tl.events_played > 5 THEN ROUND(tl.total_tour_points::numeric / 5, 1)
                ELSE ROUND(tl.total_tour_points::numeric / tl.events_played, 1)
            END AS points_average
        FROM
            tour_leaderboard tl
            JOIN players ON tl.player_id = players.id
        WHERE
            players.division = p_division
    )
    SELECT
        RankedPlayers.player_id,
        RankedPlayers.events_played,
        RankedPlayers.total_tour_points,
        RankedPlayers.rank,
        RankedPlayers.division_placing,
        RankedPlayers.name,
        RankedPlayers.division,
        RankedPlayers.points_average
    FROM
        RankedPlayers
    WHERE
        row_num <= 3
    ORDER BY
        division,
        total_tour_points DESC;
END;
$$;


ALTER FUNCTION "public"."get_top_players_by_division"("p_division" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."new_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$declare
    signup_code text;
    fname text;
    lname text;
begin
    signup_code := NEW.raw_user_meta_data->>'signup_code';
    fname := NEW.raw_user_meta_data->>'first_name';
    lname := NEW.raw_user_meta_data->>'last_name';

    IF signup_code = '37653' THEN
    INSERT INTO public.profiles (id, role, first_name, last_name)
    VALUES (
      NEW.id,
      'td',
      fname,
      lname
      );
    ELSE
    INSERT INTO public.profiles (id, role, first_name, last_name)
    VALUES (
      NEW.id,
      'player',
      fname,
      lname
      );
    END IF;
    
    RETURN NEW;
end;$$;


ALTER FUNCTION "public"."new_user_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_is_counted"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
    update results as r
    set is_counted = false
    where r.player_id = NEW.player_id
    and r.tournament_id not in (
        select tournament_id
        from (
            select tournament_id
            from results
            where player_id = NEW.player_id
            order by event_points desc
            limit 5
        ) as top_5_tournaments
    )
    and (
        select count(distinct tournament_id)
        from results
        where player_id = NEW.player_id
    ) >= 6;

    return new;
end;$$;


ALTER FUNCTION "public"."update_is_counted"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_tour_leaderboard_after_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Calculate the yearly points and count of tournaments played for each player_id
    INSERT INTO public.tour_leaderboard (player_id, total_tour_points, events_played)
    SELECT 
        player_id,
        SUM(
            CASE 
                WHEN rank <= 5 THEN event_points 
                ELSE 0 
            END) AS total_tour_points,
        COUNT(DISTINCT tournament_id) AS events_played
    FROM (
        SELECT 
            player_id,
            event_points,
            tournament_id,
            ROW_NUMBER() OVER (
                PARTITION BY player_id 
                ORDER BY event_points DESC
            ) AS rank
        FROM 
            public.results
    ) AS ranked_results
    WHERE 
        rank <= 5
    GROUP BY 
        player_id
    ON CONFLICT (player_id) DO UPDATE 
    SET 
        total_tour_points = EXCLUDED.total_tour_points,
        events_played = (
            SELECT 
                COUNT(DISTINCT tournament_id) 
            FROM 
                public.results 
            WHERE 
                player_id = EXCLUDED.player_id
        );

    RETURN NULL; -- Triggers that do not modify the row can return NULL
END;
$$;


ALTER FUNCTION "public"."update_tour_leaderboard_after_delete"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."courses" (
    "course_name" "text",
    "course_id" bigint NOT NULL,
    "td_id" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


ALTER TABLE "public"."courses" ALTER COLUMN "course_id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."courses_course_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."players" (
    "first_name" "text",
    "last_name" "text" NOT NULL,
    "pdga_num" "text" DEFAULT ''::"text" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "division" "text",
    "has_no_pdga_num" boolean
);


ALTER TABLE "public"."players" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."divisions_list" WITH ("security_invoker"='on') AS
 SELECT "players"."division",
    "count"(*) AS "player_count"
   FROM "public"."players"
  GROUP BY "players"."division";


ALTER TABLE "public"."divisions_list" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."layouts" (
    "id" bigint NOT NULL,
    "layout_name" "text" NOT NULL,
    "hole_pars" "jsonb",
    "total_par" bigint,
    "td_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "course_id" bigint NOT NULL
);


ALTER TABLE "public"."layouts" OWNER TO "postgres";


ALTER TABLE "public"."layouts" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."layouts_layout_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "role" "text" DEFAULT 'player'::"text",
    "first_name" "text" DEFAULT ''::"text",
    "last_name" "text" DEFAULT ''::"text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tournament_id" "uuid",
    "player_id" "uuid" NOT NULL,
    "division" "text",
    "total" "text",
    "prize" "text",
    "division_placing" "text",
    "overall_placing" bigint,
    "event_points" bigint,
    "is_counted" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tour_leaderboard" (
    "player_id" "uuid" NOT NULL,
    "events_played" bigint DEFAULT '0'::bigint,
    "total_tour_points" bigint
);


ALTER TABLE "public"."tour_leaderboard" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."tour_leaderboard_view" AS
SELECT
    NULL::"uuid" AS "player_id",
    NULL::bigint AS "events_played",
    NULL::bigint AS "total_tour_points",
    NULL::bigint AS "rank",
    NULL::bigint AS "division_placing",
    NULL::"text" AS "name",
    NULL::"json" AS "player_results",
    NULL::"text" AS "first_name",
    NULL::"text" AS "last_name",
    NULL::"text" AS "pdga_num",
    NULL::"uuid" AS "id",
    NULL::"text" AS "division",
    NULL::boolean AS "has_no_pdga_num",
    NULL::bigint AS "lowest_counting_score";


ALTER TABLE "public"."tour_leaderboard_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tournaments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tournament_name" "text",
    "course_id" bigint NOT NULL,
    "isMajor" boolean DEFAULT false NOT NULL,
    "date" "jsonb",
    "updated_at" timestamp with time zone,
    "updated_by" "uuid" DEFAULT "auth"."uid"(),
    "created_by" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."tournaments" OWNER TO "postgres";


ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_course_id_key" UNIQUE ("course_id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id");



ALTER TABLE ONLY "public"."layouts"
    ADD CONSTRAINT "layouts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_PDGANum_key" UNIQUE ("pdga_num");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."players"
    ADD CONSTRAINT "players_player_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."results"
    ADD CONSTRAINT "results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tour_leaderboard"
    ADD CONSTRAINT "tour_leaderboard_pkey" PRIMARY KEY ("player_id");



ALTER TABLE ONLY "public"."tournaments"
    ADD CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE VIEW "public"."tour_leaderboard_view" WITH ("security_invoker"='on') AS
 SELECT "tl"."player_id",
    "tl"."events_played",
    "tl"."total_tour_points",
    "rank"() OVER (ORDER BY "tl"."total_tour_points" DESC) AS "rank",
    "rank"() OVER (PARTITION BY "players"."division" ORDER BY "tl"."total_tour_points" DESC) AS "division_placing",
    "concat"("players"."first_name", ' ', "players"."last_name") AS "name",
    "json_agg"((("to_jsonb"("r".*) - 'player_id'::"text") || "jsonb_build_object"('tournament_name', "t"."tournament_name"))) AS "player_results",
    "players"."first_name",
    "players"."last_name",
    "players"."pdga_num",
    "players"."id",
    "players"."division",
    "players"."has_no_pdga_num",
    "min"("r"."event_points") FILTER (WHERE (("r"."is_counted" = true) AND ("tl"."events_played" >= 5))) AS "lowest_counting_score"
   FROM ((("public"."tour_leaderboard" "tl"
     JOIN "public"."players" ON (("tl"."player_id" = "players"."id")))
     LEFT JOIN "public"."results" "r" ON (("tl"."player_id" = "r"."player_id")))
     LEFT JOIN "public"."tournaments" "t" ON (("r"."tournament_id" = "t"."id")))
  GROUP BY "tl"."player_id", "players"."id", "players"."first_name", "players"."last_name", "players"."pdga_num"
  ORDER BY "tl"."total_tour_points" DESC;



CREATE OR REPLACE TRIGGER "after_results_delete" AFTER DELETE ON "public"."results" FOR EACH ROW EXECUTE FUNCTION "public"."update_tour_leaderboard_after_delete"();



CREATE OR REPLACE TRIGGER "calculate_tour_points_total_trigger" AFTER INSERT OR UPDATE ON "public"."results" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_tour_points_total"();



CREATE OR REPLACE TRIGGER "update_is_counted_trigger" AFTER INSERT ON "public"."results" FOR EACH ROW EXECUTE FUNCTION "public"."update_is_counted"();



ALTER TABLE ONLY "public"."layouts"
    ADD CONSTRAINT "public_layouts_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."results"
    ADD CONSTRAINT "public_results_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tournaments"
    ADD CONSTRAINT "public_tournaments_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("course_id") ON UPDATE CASCADE;



ALTER TABLE ONLY "public"."results"
    ADD CONSTRAINT "results_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."tour_leaderboard"
    ADD CONSTRAINT "tour_leaderboard_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Enable all for authenticated users only" ON "public"."courses" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."layouts" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."players" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."results" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."tour_leaderboard" TO "authenticated" USING (true);



CREATE POLICY "Enable all for authenticated users only" ON "public"."tournaments" TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."courses" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."layouts" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."players" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."results" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."tour_leaderboard" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."tournaments" FOR SELECT USING (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."layouts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."players" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tour_leaderboard" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tournaments" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


























































































































































































GRANT ALL ON FUNCTION "public"."calculate_tour_points_total"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_tour_points_total"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_tour_points_total"() TO "service_role";



GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", "text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", "text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", "text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", "text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", "text", integer, "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", "text", integer, "text") TO "anon";
GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", "text", integer, "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."connectby"("text", "text", "text", "text", "text", integer, "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."crosstab"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."crosstab"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."crosstab"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."crosstab"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."crosstab"("text", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."crosstab"("text", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."crosstab"("text", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."crosstab"("text", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."crosstab"("text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."crosstab"("text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."crosstab"("text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."crosstab"("text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."crosstab2"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."crosstab2"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."crosstab2"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."crosstab2"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."crosstab3"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."crosstab3"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."crosstab3"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."crosstab3"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."crosstab4"("text") TO "postgres";
GRANT ALL ON FUNCTION "public"."crosstab4"("text") TO "anon";
GRANT ALL ON FUNCTION "public"."crosstab4"("text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."crosstab4"("text") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_player_event_points_view"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_player_event_points_view"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_player_event_points_view"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_first_place_players"("tournament_id_to_search" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_first_place_players"("tournament_id_to_search" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_first_place_players"("tournament_id_to_search" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_player_results_report"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_player_results_report"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_player_results_report"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_top_players_by_division"("p_division" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_top_players_by_division"("p_division" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_top_players_by_division"("p_division" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."new_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."new_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."new_user_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."normal_rand"(integer, double precision, double precision) TO "postgres";
GRANT ALL ON FUNCTION "public"."normal_rand"(integer, double precision, double precision) TO "anon";
GRANT ALL ON FUNCTION "public"."normal_rand"(integer, double precision, double precision) TO "authenticated";
GRANT ALL ON FUNCTION "public"."normal_rand"(integer, double precision, double precision) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_is_counted"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_is_counted"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_is_counted"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_tour_leaderboard_after_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_tour_leaderboard_after_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_tour_leaderboard_after_delete"() TO "service_role";


















GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON SEQUENCE "public"."courses_course_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."courses_course_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."courses_course_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."players" TO "anon";
GRANT ALL ON TABLE "public"."players" TO "authenticated";
GRANT ALL ON TABLE "public"."players" TO "service_role";



GRANT ALL ON TABLE "public"."divisions_list" TO "anon";
GRANT ALL ON TABLE "public"."divisions_list" TO "authenticated";
GRANT ALL ON TABLE "public"."divisions_list" TO "service_role";



GRANT ALL ON TABLE "public"."layouts" TO "anon";
GRANT ALL ON TABLE "public"."layouts" TO "authenticated";
GRANT ALL ON TABLE "public"."layouts" TO "service_role";



GRANT ALL ON SEQUENCE "public"."layouts_layout_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."layouts_layout_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."layouts_layout_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."results" TO "anon";
GRANT ALL ON TABLE "public"."results" TO "authenticated";
GRANT ALL ON TABLE "public"."results" TO "service_role";



GRANT ALL ON TABLE "public"."tour_leaderboard" TO "anon";
GRANT ALL ON TABLE "public"."tour_leaderboard" TO "authenticated";
GRANT ALL ON TABLE "public"."tour_leaderboard" TO "service_role";



GRANT ALL ON TABLE "public"."tour_leaderboard_view" TO "anon";
GRANT ALL ON TABLE "public"."tour_leaderboard_view" TO "authenticated";
GRANT ALL ON TABLE "public"."tour_leaderboard_view" TO "service_role";



GRANT ALL ON TABLE "public"."tournaments" TO "anon";
GRANT ALL ON TABLE "public"."tournaments" TO "authenticated";
GRANT ALL ON TABLE "public"."tournaments" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
