import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect users from the root '/' path to the login page.
  // The login page is located at src/app/(auth)/login/page.tsx,
  // but accessed via the '/login' URL because (auth) is a route group.
  redirect('/login');

  // This part is technically unreachable due to the redirect,
  // but kept for function signature consistency if needed later.
  return null;
}
