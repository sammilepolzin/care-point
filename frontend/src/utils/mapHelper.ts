/**
 * Smart Google Map URL Converter
 * Converts raw iframes, place share links, or text addresses into safe iframe embed URLs
 */
export const cleanGoogleMapUrl = (inputUrl?: string, fallbackAddress?: string): string => {
  if (!inputUrl || !inputUrl.trim()) {
    const addressQuery = fallbackAddress ? encodeURIComponent(fallbackAddress) : 'Dhanmondi%2C%20Dhaka%2C%20Bangladesh';
    return `https://maps.google.com/maps?q=${addressQuery}&output=embed`;
  }

  const trimmed = inputUrl.trim();

  // 1. If user pasted full <iframe src="..."> code:
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    return iframeMatch[1];
  }

  // 2. If it is already an official Google Embed URL:
  if (trimmed.includes('google.com/maps/embed') || trimmed.includes('output=embed')) {
    return trimmed;
  }

  // 3. If user pasted a Google Maps place link (e.g. google.com/maps/place/Name):
  const placeMatch = trimmed.match(/maps\/place\/([^/@?]+)/i);
  if (placeMatch && placeMatch[1]) {
    const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`;
  }

  // 4. If user pasted a search link with ?q= parameter:
  const queryMatch = trimmed.match(/[?&]q=([^&]+)/i);
  if (queryMatch && queryMatch[1]) {
    return `https://maps.google.com/maps?q=${queryMatch[1]}&output=embed`;
  }

  // 5. Fallback for any plain address string:
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
};