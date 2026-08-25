import { redirect } from 'next/navigation';

/**
 * Dashboard ka koi alag overview screen nahi hai — kaam leads par shuru hota
 * hai. `/` ko zinda rakhte hain taaki purane links aur bookmarks na tootein.
 */
export default function HomePage() {
  redirect('/leads');
}
