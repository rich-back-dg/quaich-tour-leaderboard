"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";


export default function EditProfileForm() {
  const [formdata, setFormdata] = useState<File | null>(null);
  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormdata(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fileToUpload = formdata;

    // const {
    //   data: { user },
    // } = await supabase.auth.getUser();

    // const { data, error } = await supabase.storage
    //   .from("profiles")
    //   .upload(`${user?.id}/avatar`, fileToUpload, {
    //     cacheControl: "3600",
    //     upsert: true,
    //   });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-3">
          <Label htmlFor="imageFile">Profile Picture</Label>
          <Input
            type="file"
            name="imageFile"
            id="imageFile"
            onChange={handleFileChange}
          />
          <Button type="submit">Upload</Button>
        </div>
      </form>
    </>
  );
}
