export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      service: "web",
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
}
