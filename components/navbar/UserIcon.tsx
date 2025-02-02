import { LuUser2 } from 'react-icons/lu';
import { fetchProfileImage } from '@/utils/actions';
import Image from 'next/image';

async function UserIcon() {
  const profileImage = await fetchProfileImage();

  if (profileImage) {
    return (
      <Image
        src={profileImage}
        width={24}
        height={24}
        className="rounded-full object-cover"
        alt="Profile"
      />
    );
  }

  return <LuUser2 className="h-6 w-6 bg-primary rounded-full text-white" />;
}

export default UserIcon;
