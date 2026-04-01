import React from 'react';
import LatestGuidesWidget from './LatestGuidesWidget';

export default function Sidebar() {
  return (
    <aside className="flex flex-col gap-12">
      <LatestGuidesWidget />
    </aside>
  );
}
