import { Suspense } from 'react';
import ResetPasswordForm from './ResetPasswordForm';

export const dynamic = 'force-dynamic'; // Optional but helpful for this case

export default function Page() {
  return (
      <Suspense fallback={<div className="text-center mt-10">Loading reset form...</div>}>
        <ResetPasswordForm />
      </Suspense>
  );
}
