import { Suspense } from 'react';
import VerifyEmailPage from './VerifyEmailPage';

// This is the Server Component for the /verify-email route.
// It is responsible for rendering the initial page content.
// By wrapping the client component in Suspense, we ensure that
// client-side hooks like useSearchParams() are only executed
// on the client, preventing a server-side rendering error.

export default function Page() {
  return (
    <Suspense fallback={<div>Loading verification page...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}