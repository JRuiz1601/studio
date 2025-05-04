import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect users from the root to the login page
  // The (auth) folder is a route group, so it doesn't affect the URL path.
  redirect('/login');

  // Keep the return statement for type consistency, though it won't be reached
  return null;
}
