import React from 'react';
import NewsletterWidget from './NewsletterWidget';
import LatestGuidesWidget from './LatestGuidesWidget';

export default function Sidebar() {
  return (
    <aside className="flex flex-col gap-12">
      <NewsletterWidget />
      <LatestGuidesWidget />
    </aside>
  );
}
