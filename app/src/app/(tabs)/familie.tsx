import { useAuth } from '@/features/auth/AuthProvider';
import { DemoFamily } from '@/features/family/DemoFamily';
import { FamilyView } from '@/features/family/FamilyView';

export default function FamilyScreen() {
  const { guard, account } = useAuth();
  const careCase = account?.cases[0];
  if (guard.status === 'demo' || !careCase) return <DemoFamily />;
  return <FamilyView careCase={careCase} />;
}
