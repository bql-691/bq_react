import '@/features/security/security';
import { useTranslation } from 'react-i18next';

export default function ProfilePage() {
  const { t } = useTranslation();
  return (
    <main className="profile-page">
      <h1>{t('security.profile')}</h1>
    </main>
  );
}
