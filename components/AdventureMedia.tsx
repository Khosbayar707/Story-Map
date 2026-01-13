"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

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

/* ---------------- Cloudinary Upload Helper ---------------- */
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

/* ---------------- Upload Dialog ---------------- */
export function UploadPhotoDialog({
  adventureId,
  onUploaded,
}: {
  adventureId: string;
  onUploaded: (url: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) return;

    setLoading(true);

    const imageUrl = await uploadToCloudinary(file);

    const { error } = await supabase.from("adventure_photos").insert({
      adventure_id: adventureId,
      image_url: imageUrl,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Photo uploaded 📸");
    onUploaded(imageUrl);
    setFile(null);
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

/* ---------------- Gallery ---------------- */
export function AdventureGallery({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {photos.map((url) => (
        <div
          key={url}
          className="relative h-48 w-full overflow-hidden rounded-xl"
        >
          <Image
            src={url}
            alt="Adventure photo"
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
