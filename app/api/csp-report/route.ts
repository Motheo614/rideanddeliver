import { NextRequest, NextResponse } from 'next/server';

interface CspReportBody {
  'csp-report'?: {
    'blocked-uri'?: string;
    disposition?: string;
    'document-uri'?: string;
    'effective-directive'?: string;
    'original-policy'?: string;
    'violated-directive'?: string;
  };
  body?: {
    blockedURL?: string;
    documentURL?: string;
    effectiveDirective?: string;
  };
}

function trimValue(value: string | undefined, max = 300) {
  if (!value) return undefined;
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CspReportBody;

    // Support both legacy csp-report and Reporting API body formats.
    const blocked = trimValue(payload?.['csp-report']?.['blocked-uri'] || payload?.body?.blockedURL);
    const documentUrl = trimValue(payload?.['csp-report']?.['document-uri'] || payload?.body?.documentURL);
    const directive = trimValue(
      payload?.['csp-report']?.['effective-directive'] ||
      payload?.['csp-report']?.['violated-directive'] ||
      payload?.body?.effectiveDirective
    );

    console.warn('[CSP report]', {
      blocked,
      documentUrl,
      directive,
      userAgent: trimValue(request.headers.get('user-agent') || undefined, 160),
    });
  } catch (error) {
    console.error('Failed to parse CSP report:', error);
  }

  return new NextResponse(null, { status: 204 });
}
