import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect users from the root to the login page
  redirect('/auth/login');
  // Keep the return statement for type consistency, though it won't be reached
  return <></>;
}
