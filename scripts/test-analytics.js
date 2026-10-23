const { google } = require('googleapis');

let authClient;

function getAuthClient() {
  if (authClient) return authClient;

  const requiredVariables = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REFRESH_TOKEN',
  ];
  const missingVariables = requiredVariables.filter(
    (name) => !process.env[name]?.trim(),
  );

  if (missingVariables.length > 0) {
    throw new Error(`Missing environment variables: ${missingVariables.join(', ')}`);
  }

  authClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID.trim(),
    process.env.GOOGLE_CLIENT_SECRET.trim(),
  );
  authClient.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN.trim(),
  });

  return authClient;
}

function getDateRange() {
  const endDate = new Date();
  endDate.setUTCDate(endDate.getUTCDate() - 1);

  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 6);

  const formatDate = (date) => date.toISOString().slice(0, 10);
  return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
}

function errorDetails(error) {
  if (!(error instanceof Error)) return { error };

  return {
    name: error.name,
    message: error.message,
    code: error.code,
    status: error.response?.status,
    statusText: error.response?.statusText,
    apiError: error.response?.data,
    errors: error.errors,
    stack: error.stack,
  };
}

async function runGA4Check() {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID?.trim();
    if (!propertyId) throw new Error('Missing environment variable: GA4_PROPERTY_ID');

    const betaDataClient = google.analyticsdata({
      version: 'v1beta',
      auth: getAuthClient(),
    }).properties;
    const { data } = await betaDataClient.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate: '7daysAgo', endDate: 'yesterday' }],
        metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
      },
    });

    const metrics = data.rows?.[0]?.metricValues || [];
    console.log(
      `✅ GA4 check succeeded for properties/${propertyId} (last 7 complete days):`,
    );
    console.log(
      JSON.stringify(
        {
          activeUsers: metrics[0]?.value || '0',
          pageviews: metrics[1]?.value || '0',
        },
        null,
        2,
      ),
    );
    return true;
  } catch (error) {
    console.error('❌ GA4 check failed:');
    console.error(JSON.stringify(errorDetails(error), null, 2));
    return false;
  }
}

async function runGSCCheck() {
  try {
    const siteUrl = process.env.GSC_SITE_URL?.trim();
    if (!siteUrl) throw new Error('Missing environment variable: GSC_SITE_URL');

    const { startDate, endDate } = getDateRange();
    const searchConsole = google.searchconsole({
      version: 'v1',
      auth: getAuthClient(),
    });
    const { data } = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: { startDate, endDate },
    });

    const totals = (data.rows || []).reduce(
      (result, row) => ({
        clicks: result.clicks + (row.clicks || 0),
        impressions: result.impressions + (row.impressions || 0),
      }),
      { clicks: 0, impressions: 0 },
    );
    console.log(`✅ GSC check succeeded for ${siteUrl} (${startDate} to ${endDate}):`);
    console.log(JSON.stringify(totals, null, 2));
    return true;
  } catch (error) {
    console.error('❌ GSC check failed:');
    console.error(JSON.stringify(errorDetails(error), null, 2));
    return false;
  }
}

async function main() {
  const results = await Promise.all([runGA4Check(), runGSCCheck()]);
  if (results.some((succeeded) => !succeeded)) process.exitCode = 1;
}

main().catch((error) => {
  console.error('❌ Analytics verification failed unexpectedly:');
  console.error(JSON.stringify(errorDetails(error), null, 2));
  process.exitCode = 1;
});
