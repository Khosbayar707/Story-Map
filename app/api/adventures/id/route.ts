import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const { title, description, latitude, longitude, image_url } = body;

  const { data, error } = await supabase
    .from("adventures")
    .update({
      title,
      description,
      latitude,
      longitude,
      image_url,
    })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabase
    .from("adventures")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
