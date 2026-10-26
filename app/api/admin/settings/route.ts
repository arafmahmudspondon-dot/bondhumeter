import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/auth";
import { getSettings, saveSettings, validateSettings } from "@/lib/settings";

/** PUT /api/admin/settings — owner-only site settings editor. */
export async function PUT(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Admin only" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const v = validateSettings(body);
  if (!v.ok || !v.values) {
    return NextResponse.json({ error: v.errors[0] || "Invalid settings", errors: v.errors }, { status: 400 });
  }

  try {
    await saveSettings(v.values);
    const s = await getSettings();
    return NextResponse.json({ ok: true, settings: s });
  } catch (e) {
    console.error("settings save failed", e);
    return NextResponse.json({ error: "Could not save settings" }, { status: 500 });
  }
}
