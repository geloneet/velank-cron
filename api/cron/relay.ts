export default async function handler(req: any, res: any) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send('Unauthorized');
    }

    const firebaseUrl = process.env.FIREBASE_APP_URL;

    if (!firebaseUrl) {
      return res.status(500).send('FIREBASE_APP_URL not set');
    }

    const response = await fetch(`${firebaseUrl}/api/cron/abandoned-carts`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.text();

    return res.status(response.status).send(data);
  } catch (error) {
    return res.status(500).send('Error en relay');
  }
}
