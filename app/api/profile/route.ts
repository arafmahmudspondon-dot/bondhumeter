import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

/** PUT /api/profile — update the logged-in user's profile */
export async function PUT(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  try {
    const body = await req.json();
    const name = String(body?.name || "").trim().slice(0, 80);
    const phone = String(body?.phone || "").trim().slice(0, 24);
    const fbLink = String(body?.fbLink || "").trim().slice(0, 300);
    const instaLink = String(body?.instaLink || "").trim().slice(0, 300);
    const bio = String(body?.bio || "").trim().slice(0, 300);

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (phone && !/^[+]?[\d\s-]{6,24}$/.test(phone)) {
      return NextResponse.json({ error: "Phone number looks invalid" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        name,
        phone: phone || null,
        fbLink: fbLink || null,
        instaLink: instaLink || null,
        bio: bio || null,
      },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        image: updated.image,
        phone: updated.phone,
        fbLink: updated.fbLink,
        instaLink: updated.instaLink,
        bio: updated.bio,
        provider: updated.provider,
        role: updated.role,
      },
    });
  } catch (e) {
    console.error("profile update error", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
