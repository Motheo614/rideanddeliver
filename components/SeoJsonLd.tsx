import React from 'react';

type JsonLd = Record<string, unknown>;

interface SeoJsonLdProps {
  data: JsonLd | JsonLd[];
}

function safeJsonLdStringify(data: JsonLd | JsonLd[]) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export default function SeoJsonLd({ data }: SeoJsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(data) }}
    />
  );
}
