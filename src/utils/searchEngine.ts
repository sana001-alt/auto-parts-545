import { Listing } from '../types';
import { INDIA_VEHICLE_DATABASE, VehicleDatabaseEntry } from '../data/indiaAutoDatabase';

/**
 * Calculates Levenshtein edit distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  const lenA = a.length;
  const lenB = b.length;

  if (lenA === 0) return lenB;
  if (lenB === 0) return lenA;

  for (let i = 0; i <= lenB; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= lenA; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= lenB; i++) {
    for (let j = 1; j <= lenA; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          )
        );
      }
    }
  }

  return matrix[lenB][lenA];
}

/**
 * Performs fuzzy token match comparison
 */
export function fuzzyMatchWord(word: string, targetToken: string): boolean {
  if (!word || !targetToken) return false;
  const w = word.toLowerCase();
  const t = targetToken.toLowerCase();

  // Exact substring match
  if (t.includes(w) || w.includes(t)) return true;

  // Small words (<= 3 chars) need exact prefix/match
  if (w.length <= 3) return t.startsWith(w);

  // Levenshtein distance check for typos
  const dist = levenshteinDistance(w, t);
  const maxAllowedDist = w.length > 7 ? 2 : 1;

  return dist <= maxAllowedDist;
}

export interface SearchSuggestion {
  id: string;
  type: 'vehicle' | 'oem' | 'brand' | 'part' | 'category';
  title: string;
  subtitle: string;
  badge?: string;
  brand?: string;
  model?: string;
  oemPartNumber?: string;
  category?: string;
}

/**
 * Generates instant auto-complete suggestions based on query
 */
export function getInstantSearchSuggestions(query: string): SearchSuggestion[] {
  if (!query || query.trim().length === 0) return [];

  const normalizedQuery = query.trim().toLowerCase();
  const tokens = normalizedQuery.split(/\s+/);
  const suggestions: SearchSuggestion[] = [];

  // 1. Check Vehicle Database Matches (Brands, Models, Engine Codes)
  INDIA_VEHICLE_DATABASE.forEach((vehicle) => {
    const brandMatch = tokens.some(t => fuzzyMatchWord(t, vehicle.brand));
    const modelMatch = tokens.some(t => fuzzyMatchWord(t, vehicle.model));
    const engineMatch = tokens.some(t => fuzzyMatchWord(t, vehicle.engineCode));

    if (brandMatch || modelMatch || engineMatch) {
      suggestions.push({
        id: vehicle.id,
        type: 'vehicle',
        title: `${vehicle.brand} ${vehicle.model}`,
        subtitle: `${vehicle.category} • Engine: ${vehicle.engineCode} (${vehicle.fuel})`,
        badge: vehicle.category,
        brand: vehicle.brand,
        model: vehicle.model
      });
    }

    // Check OEM Parts in Vehicle Database
    vehicle.popularOemParts.forEach((oem) => {
      const oemCodeMatch = tokens.some(t => fuzzyMatchWord(t, oem.oemPartNumber));
      const partNameMatch = tokens.some(t => fuzzyMatchWord(t, oem.partName));

      if (oemCodeMatch || partNameMatch) {
        suggestions.push({
          id: `${vehicle.id}-${oem.oemPartNumber}`,
          type: 'oem',
          title: oem.partName,
          subtitle: `OEM Part #: ${oem.oemPartNumber} • Fits ${vehicle.brand} ${vehicle.model}`,
          badge: 'OEM PART',
          oemPartNumber: oem.oemPartNumber,
          category: oem.category
        });
      }
    });
  });

  // Limit unique suggestions
  const uniqueMap = new Map<string, SearchSuggestion>();
  suggestions.forEach(s => {
    if (!uniqueMap.has(s.title.toLowerCase())) {
      uniqueMap.set(s.title.toLowerCase(), s);
    }
  });

  return Array.from(uniqueMap.values()).slice(0, 8);
}

export interface FilterOptions {
  searchQuery?: string;
  searchType?: 'all' | 'part' | 'oem' | 'brand' | 'model' | 'engine';
  vehicleType?: string;
  category?: string;
  condition?: string;
  state?: string;
  district?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
}

/**
 * Main function to filter and search listings with fuzzy matching
 */
export function filterListings(listings: Listing[], options: FilterOptions): Listing[] {
  let results = [...listings];

  // 1. Search Query Filter with Fuzzy & OEM matching
  if (options.searchQuery && options.searchQuery.trim().length > 0) {
    const rawQuery = options.searchQuery.trim().toLowerCase();
    const tokens = rawQuery.split(/\s+/).filter(Boolean);

    results = results.filter((listing) => {
      const title = (listing.title || '').toLowerCase();
      const desc = (listing.description || '').toLowerCase();
      const make = (listing.make || '').toLowerCase();
      const model = (listing.model || '').toLowerCase();
      const partNumber = (listing.partNumber || '').toLowerCase();
      const category = (listing.category || '').toLowerCase();
      const vehicleType = (listing.vehicleType || '').toLowerCase();

      // Specific search modes
      if (options.searchType === 'oem') {
        return partNumber.includes(rawQuery) || tokens.some(t => fuzzyMatchWord(t, partNumber));
      }
      if (options.searchType === 'brand') {
        return make.includes(rawQuery) || tokens.some(t => fuzzyMatchWord(t, make));
      }
      if (options.searchType === 'model') {
        return model.includes(rawQuery) || tokens.some(t => fuzzyMatchWord(t, model));
      }

      // Default 'all' or 'part': Multi-field token match
      const searchableText = `${title} ${desc} ${make} ${model} ${partNumber} ${category} ${vehicleType}`;

      return tokens.every((token) => {
        if (searchableText.includes(token)) return true;
        // Fuzzy word level match against keywords
        const keywords = searchableText.split(/[\s,/\-()]+/);
        return keywords.some(k => fuzzyMatchWord(token, k));
      });
    });
  }

  // 2. Vehicle Type Filter
  if (options.vehicleType && options.vehicleType.trim().length > 0) {
    const targetVt = options.vehicleType.toLowerCase();
    results = results.filter(item => (item.vehicleType || '').toLowerCase().includes(targetVt) || targetVt.includes((item.vehicleType || '').toLowerCase()));
  }

  // 3. Category Filter
  if (options.category && options.category.trim().length > 0) {
    results = results.filter(item => item.category === options.category);
  }

  // 4. Condition Filter
  if (options.condition && options.condition.trim().length > 0) {
    results = results.filter(item => item.condition === options.condition);
  }

  // 5. Location Filter (State & District)
  if (options.state && options.state.trim().length > 0) {
    results = results.filter(item => item.location?.state?.toLowerCase() === options.state?.toLowerCase());
  }
  if (options.district && options.district.trim().length > 0) {
    results = results.filter(item => item.location?.district?.toLowerCase() === options.district?.toLowerCase());
  }

  // 6. Price Range Filter
  if (options.minPrice !== undefined && !isNaN(options.minPrice)) {
    results = results.filter(item => item.price >= options.minPrice!);
  }
  if (options.maxPrice !== undefined && !isNaN(options.maxPrice)) {
    results = results.filter(item => item.price <= options.maxPrice!);
  }

  // 7. Verified Seller Filter
  if (options.verifiedOnly) {
    results = results.filter(item => item.sellerVerified === true);
  }

  return results;
}
