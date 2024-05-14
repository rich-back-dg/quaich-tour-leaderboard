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

  const { data: avatar } = supabase.storage
    .from("profiles")
    .getPublicUrl(`${user?.id}/avatar`);

  function createAvatarFallback() {
    const fnameInitial = profile?.first_name.at(0);
    const lnameInitial = profile?.last_name.at(0);
    return fnameInitial + lnameInitial;
  }

  return (
      <Avatar>
        <AvatarImage src={avatar.publicUrl} alt="User Avatar Image" />
        <AvatarFallback>{createAvatarFallback()}</AvatarFallback>
      </Avatar>
  );
}
