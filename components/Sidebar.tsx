import React from 'react';
import NewsletterWidget from './NewsletterWidget';
import LatestGuidesWidget from './LatestGuidesWidget';

export default function Sidebar() {
  return (
    <aside aria-label="Sidebar" className="flex flex-col gap-6 lg:sticky lg:top-24">
      <NewsletterWidget />
      <LatestGuidesWidget />
    </aside>
  );
}
