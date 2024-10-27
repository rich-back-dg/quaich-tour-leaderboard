import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/utils/supabase/server";

export default async function UserAvatar() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user?.id)
    .single();

  const { data: avatar, error } = await supabase.storage
    .from("profiles")
    .createSignedUrl(`${user?.id}/avatar`, 3600)

  function createAvatarFallback() {
    const fnameInitial = profile?.first_name.at(0);
    const lnameInitial = profile?.last_name.at(0);
    return fnameInitial + lnameInitial;
  }

  return (
      <Avatar>
        <AvatarImage src={avatar?.signedUrl} alt="User Avatar Image" className="object-cover"/>
        <AvatarFallback>{createAvatarFallback()}</AvatarFallback>
      </Avatar>
  );
}
