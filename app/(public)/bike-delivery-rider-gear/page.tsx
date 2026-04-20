import { permanentRedirect } from 'next/navigation';

export default function LegacySafetyGearPage() {
  permanentRedirect('/safety-gear');
}
