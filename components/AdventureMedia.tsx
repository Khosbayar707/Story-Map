"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";

// ---------- Cloudinary Upload Helper ----------
async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
  );

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  return data.secure_url as string;
}

// ---------- Upload Dialog ----------
export function UploadPhotoDialog({ adventureId }: { adventureId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) return;
    setLoading(true);

    const imageUrl = await uploadToCloudinary(file);

    await supabase.from("adventure_photos").insert({
      adventure_id: adventureId,
      image_url: imageUrl,
    });

    setLoading(false);
    setFile(null);
    window.location.reload();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Upload Photo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a photo</DialogTitle>
        </DialogHeader>
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <Button onClick={upload} disabled={loading || !file}>
          {loading ? "Uploading…" : "Upload"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function AdventureGallery({ adventureId }: { adventureId: string }) {
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("adventure_photos")
      .select("image_url")
      .eq("adventure_id", adventureId)
      .then(({ data }) => {
        setPhotos(data?.map((p) => p.image_url) ?? []);
      });
  }, [adventureId]);

  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {photos.map((url) => (
        <Image
          key={url}
          src={url}
          alt="Adventure photo"
          className="h-48 w-full rounded-xl object-cover"
        />
      ))}
    </div>
  );
}
