import { next } from '@vercel/functions';

// Nur den Angebotsassistenten schuetzen – die Auswahlseite (jetzt auch
// unter "/") und der Waermepumpen-Rechner unter "/rechner" bleiben oeffentlich.
export const config = {
  matcher: ['/angebotsassistent.html'],
};

export default function middleware(request) {
  const user = process.env.BASIC_AUTH_USER;
  const pass = process.env.BASIC_AUTH_PASS;

  if (!user || !pass) {
    return new Response('Zugriff nicht konfiguriert.', { status: 500 });
  }

  const auth = request.headers.get('authorization');
  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic' && encoded) {
      const [reqUser, reqPass] = atob(encoded).split(':');
      if (reqUser === user && reqPass === pass) {
        return next();
      }
    }
  }

  return new Response('Authentifizierung erforderlich.', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Geschuetzter Bereich"' },
  });
}
