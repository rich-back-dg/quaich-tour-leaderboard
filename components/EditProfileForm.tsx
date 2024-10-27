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

    if (!formdata) {
      // Handle the case where no file is selected
      alert("Please select a file before uploading.");
      return;
    }

    const fileToUpload = formdata;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.id) {
      // Handle the case where user ID is not available
      console.error("User not authenticated");
      return;
    }

    const { data, error } = await supabase.storage
      .from("profiles")
      .upload(`${user.id}/avatar`, fileToUpload, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading file:", error.message);
    } else {
      console.log("File uploaded successfully:", data);
    }
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
