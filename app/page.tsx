
import { redirect } from 'next/navigation';

export default function Home() {
  // Community edition redirects directly to login
  redirect('/login');
}
