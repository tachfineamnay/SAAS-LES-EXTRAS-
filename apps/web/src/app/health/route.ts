import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "lesextras-web",
    },
    { status: 200 },
  );
}
