import {
  ApiClient,
  DefaultApi,
  GetItemsRequestContent,
  SearchItemsRequestContent,
} from '../vendor/creatorsapi-nodejs-sdk/dist/index';

if (typeof window !== 'undefined') {
  throw new Error(
    'lib/amazonApi.ts must only be imported from server-side code (API routes, route handlers, or server components) — it holds Amazon Creators API credentials.'
  );
}

const DEFAULT_ITEM_RESOURCES = [
  'images.primary.medium',
  'itemInfo.title',
  'itemInfo.features',
  'offersV2.listings.price',
  'offersV2.listings.availability',
  'offersV2.listings.condition',
  'offersV2.listings.merchantInfo',
];

const DEFAULT_SEARCH_RESOURCES = [
  'images.primary.medium',
  'itemInfo.title',
  'offersV2.listings.availability',
  'offersV2.listings.condition',
  'offersV2.listings.dealDetails',
  'offersV2.listings.isBuyBoxWinner',
  'offersV2.listings.loyaltyPoints',
  'offersV2.listings.merchantInfo',
  'offersV2.listings.price',
  'offersV2.listings.type',
];

let cachedApi: InstanceType<typeof DefaultApi> | null = null;

function getApi(): InstanceType<typeof DefaultApi> {
  if (cachedApi) return cachedApi;

  const credentialId = process.env.AMAZON_CREATOR_CREDENTIAL_ID;
  const credentialSecret = process.env.AMAZON_CREATOR_CREDENTIAL_SECRET;
  const version = process.env.AMAZON_CREATOR_API_VERSION;

  if (!credentialId || !credentialSecret || !version) {
    throw new Error(
      'Missing Amazon Creators API credentials. Set AMAZON_CREATOR_CREDENTIAL_ID, AMAZON_CREATOR_CREDENTIAL_SECRET, and AMAZON_CREATOR_API_VERSION in .env.local.'
    );
  }

  const apiClient = new ApiClient();
  apiClient.credentialId = credentialId;
  apiClient.credentialSecret = credentialSecret;
  apiClient.version = version;

  cachedApi = new DefaultApi(apiClient);
  return cachedApi;
}

function getMarketplace(): string {
  return process.env.AMAZON_CREATOR_MARKETPLACE || 'www.amazon.com';
}

function getPartnerTag(): string {
  const partnerTag = process.env.AMAZON_CREATOR_PARTNER_TAG;
  if (!partnerTag) {
    throw new Error('Missing AMAZON_CREATOR_PARTNER_TAG in .env.local.');
  }
  return partnerTag;
}

/**
 * Fetches item details (price, availability, images, etc.) for a list of ASINs.
 * Wraps the SDK's GetItems operation. Server-side only.
 */
export async function getItems(asins: string[], resources: string[] = DEFAULT_ITEM_RESOURCES) {
  if (!asins || asins.length === 0) {
    throw new Error('getItems requires at least one ASIN.');
  }

  const api = getApi();

  const request = new GetItemsRequestContent();
  request.partnerTag = getPartnerTag();
  request.itemIds = asins;
  request.resources = resources;

  return api.getItems(getMarketplace(), request);
}

/**
 * Searches Amazon for products matching the given keywords.
 * Wraps the SDK's SearchItems operation. Server-side only.
 */
export async function searchItems(
  keywords: string,
  options: { searchIndex?: string; itemCount?: number; resources?: string[] } = {}
) {
  if (!keywords || !keywords.trim()) {
    throw new Error('searchItems requires non-empty keywords.');
  }

  const api = getApi();

  const request = new SearchItemsRequestContent();
  request.partnerTag = getPartnerTag();
  request.keywords = keywords;
  request.searchIndex = options.searchIndex ?? 'All';
  request.itemCount = options.itemCount ?? 10;
  request.resources = options.resources ?? DEFAULT_SEARCH_RESOURCES;

  return api.searchItems(getMarketplace(), { searchItemsRequestContent: request });
}
