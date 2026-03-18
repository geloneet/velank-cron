export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    const firebaseUrl = process.env.FIREBASE_APP_URL;

    if (!firebaseUrl) {
      return new Response('FIREBASE_APP_URL not set', { status: 500 });
    }

    const res = await fetch(`${firebaseUrl}/api/cron/abandoned-carts`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await res.text();

    return new Response(data, { status: res.status });
  } catch (error) {
    return new Response('Error en relay', { status: 500 });
  }
}
