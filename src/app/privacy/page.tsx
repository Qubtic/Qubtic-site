import PrivacyPolicyPage, { metadata as privacyMetadata } from '@/app/privacy-policy/page';

export const metadata = {
  ...privacyMetadata,
  alternates: {
    canonical: 'https://qubtic.tech/privacy',
  },
};

export default function PrivacyPage() {
  return <PrivacyPolicyPage />;
}
