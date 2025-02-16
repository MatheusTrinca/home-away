import { SubmitButton } from '@/components/form/Buttons';
import FormContainer from '@/components/form/FormContainer';
import FormInput from '@/components/form/FormInput';
import { fetchProfile, updateProfileAction } from '@/utils/actions';

async function ProfilePage() {
  const profile = await fetchProfile();

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">user profile</h1>
      <div className="border p-8 rounded-md">
        <FormContainer action={updateProfileAction}>
          <div className="grid md:grid-cols-2 gap-4 mt-4 ">
            <FormInput
              name="firstName"
              type="text"
              label="First Name"
              defaultValue={profile.firstName}
            />
            <FormInput
              name="lastName"
              type="text"
              label="Last Name"
              defaultValue={profile.lastName}
            />
            <FormInput
              name="username"
              type="text"
              label="Username"
              defaultValue={profile.username}
            />
          </div>
          <SubmitButton text="Update profile" className="mt-8" />
        </FormContainer>
      </div>
    </section>
  );
}
export default ProfilePage;
