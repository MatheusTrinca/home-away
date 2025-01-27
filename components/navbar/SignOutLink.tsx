'use client';

import { useToast } from '../ui/use-toast';
import { SignOutButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

function SignOutLink() {
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = () => {
    toast({
      description: 'You have been signed out.',
    });

    router.push('/');
  };

  return (
    <SignOutButton redirectUrl="/">
      <button onClick={handleLogout} className="w-full text-left">
        Logout
      </button>
    </SignOutButton>
  );
}

export default SignOutLink;
