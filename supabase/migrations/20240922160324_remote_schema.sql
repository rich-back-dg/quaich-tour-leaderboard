CREATE TRIGGER user_profile_signup_trigger AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION new_user_profile();


set check_function_bodies = off;

CREATE OR REPLACE FUNCTION storage.extension(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
_filename text;
BEGIN
    select string_to_array(name, '/') into _parts;
    select _parts[array_length(_parts,1)] into _filename;
    -- @todo return the last part instead of 2
    return split_part(_filename, '.', 2);
END
$function$
;

CREATE OR REPLACE FUNCTION storage.filename(name text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
    select string_to_array(name, '/') into _parts;
    return _parts[array_length(_parts,1)];
END
$function$
;

CREATE OR REPLACE FUNCTION storage.foldername(name text)
 RETURNS text[]
 LANGUAGE plpgsql
AS $function$
DECLARE
_parts text[];
BEGIN
    select string_to_array(name, '/') into _parts;
    return _parts[1:array_length(_parts,1)-1];
END
$function$
;

create policy "Give users authenticated access to folder 1ige2ga_0"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = 'private'::text) AND (auth.role() = 'authenticated'::text)));


create policy "users can access own files 1ige2ga_0"
on "storage"."objects"
as permissive
for select
to authenticated
using (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


create policy "users can manage profile image 1ige2ga_0"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


create policy "users can manage profile image 1ige2ga_1"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


create policy "users can manage profile image 1ige2ga_2"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



