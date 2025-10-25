export async function POST(req){
  const { code } = await req.json();
  if (!code) return new Response('missing', { status: 400 });
  const ok = process.env.INVITE_MASTER_CODE && code.trim() === process.env.INVITE_MASTER_CODE.trim();
  return new Response(null, { status: ok ? 200 : 401 });
}
