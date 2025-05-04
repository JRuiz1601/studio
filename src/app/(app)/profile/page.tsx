import { redirect } from 'next/navigation';

export default function ProfilePage() {
  // Redirect users from the base profile page to the edit profile page
  redirect('/profile/edit');

  // Keep the return statement for type consistency, though it won't be reached
  return null;
}
