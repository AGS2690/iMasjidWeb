import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLocale } from '../../hooks/useLocale';
import { PageHeader } from '../../components/common/PageHeader';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLocale();

  return (
    <div>
      <PageHeader
        title={`${t('Dashboard.welcomeBack', 'Welcome back,')} ${user?.firstName || user?.userName || 'System'}!`}
        subtitle={t(
          'Dashboard.welcomeSubtitle',
          'Here is an overview of your application security and identity management portal.'
        )}
      />
    </div>
  );
};
