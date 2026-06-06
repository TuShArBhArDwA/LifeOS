import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Settings · LifeOS',
  description: 'Manage integrations, notifications, and preferences for your AI-powered student OS.',
};

export default function SettingsPage() {
  return <SettingsClient />;
}
