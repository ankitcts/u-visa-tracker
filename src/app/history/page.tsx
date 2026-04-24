import { redirect } from 'next/navigation';

// History content is now the landing page at "/". This route redirects any
// stale bookmarks back to the home page.
export default function HistoryRedirect() {
  redirect('/');
}
