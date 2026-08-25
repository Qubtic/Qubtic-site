import TermsOfServicePage, { metadata as termsMetadata } from '@/app/terms-of-service/page';

export const metadata = {
  ...termsMetadata,
  alternates: {
    canonical: 'https://qubtic.tech/terms',
  },
};

export default function TermsPage() {
  return <TermsOfServicePage />;
}
