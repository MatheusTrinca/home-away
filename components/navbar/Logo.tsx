import Link from 'next/link';
import { LuTent } from 'react-icons/lu';
import { Button } from '../ui/button';

function Logo() {
  return (
    <Button asChild size="icon">
      <Link href="/">
        <LuTent className="h-6 w-6" />
      </Link>
    </Button>
  );
}

export default Logo;
