import { worldchain } from './chains';
import { LIFE_ABI } from './life-abi';
import { ECONOMYV2_ABI } from './economyv2-abi';
import { WLD_ABI } from './wld-abi';
import { PROPERTY_ABI } from './property-abi';
import { rpcManager } from '../utils/rpcManager';

import { PRODUCTION_CONTRACTS } from './production-contracts';

// Contract addresses - Production ready on Worldchain
export const CONTRACT_ADDRESSES = {
  // Use production addresses with environment variable fallback
  get LIFE_TOKEN() { 
    return (process.env.NEXT_PUBLIC_LIFE_TOKEN_ADDRESS as `0x${string}`) || PRODUCTION_CONTRACTS.LIFE_TOKEN;
  },
  get PROPERTY() { 
    return (process.env.NEXT_PUBLIC_PROPERTY_CONTRACT_ADDRESS as `0x${string}`) || PRODUCTION_CONTRACTS.PROPERTY;
  },
  get LIMITED_EDITION() { 
    return (process.env.NEXT_PUBLIC_LIMITED_EDITION_ADDRESS as `0x${string}`) || PRODUCTION_CONTRACTS.LIMITED_EDITION;
  },
  get PLAYER_REGISTRY() { 
    return (process.env.NEXT_PUBLIC_PLAYER_REGISTRY_ADDRESS as `0x${string}`) || PRODUCTION_CONTRACTS.PLAYER_REGISTRY;
  },
  get ECONOMY() { 
    return (process.env.NEXT_PUBLIC_ECONOMY_CONTRACT_ADDRESS as `0x${string}`) || PRODUCTION_CONTRACTS.ECONOMY;
  },
  get WORLD_ID_ADDRESS_BOOK() { 
    return (process.env.NEXT_PUBLIC_WORLD_ID_ROUTER_ADDRESS as `0x${string}`) || PRODUCTION_CONTRACTS.WORLD_ID_ROUTER;
  },
  get WORLD_ID_ROUTER() { 
    return (process.env.NEXT_PUBLIC_WORLD_ID_ROUTER_ADDRESS as `0x${string}`) || PRODUCTION_CONTRACTS.WORLD_ID_ROUTER;
  },
  get WLD() { 
    return (process.env.NEXT_PUBLIC_WLD_CONTRACT_ADDRESS as `0x${string}`) || PRODUCTION_CONTRACTS.WLD_TOKEN;
  },
};

// Using rpcManager for all contract interactions

// Property types and their base configurations
export const PROPERTY_TYPES = {
  // Original properties
  Apartment: { basePrice: 100, basePoints: 10, icon: '🏠' },
  House: { basePrice: 250, basePoints: 25, icon: '🏡' },
  Villa: { basePrice: 500, basePoints: 50, icon: '🏘️' },
  Mansion: { basePrice: 1000, basePoints: 100, icon: '🏰' },
  Skyscraper: { basePrice: 2000, basePoints: 200, icon: '🏢' },
  
  // Cyberpunk properties - aligned with Economy contract pricing
  neural_pod: { basePrice: 500, basePoints: 15, baseYield: 75, icon: 'neural_pod', name: 'Neural Pod', description: 'Neural Interface Pod - Basic cybernetic housing' },
  data_fortress: { basePrice: 750, basePoints: 35, baseYield: 150, icon: 'data_fortress', name: 'Data Fortress', description: 'Data Fortress - Secure digital stronghold' },
  cyber_tower: { basePrice: 1000, basePoints: 75, baseYield: 250, icon: 'cyber_tower', name: 'Cyber Tower', description: 'Cyber Tower - High-tech residential complex' },
  neon_palace: { basePrice: 2000, basePoints: 150, baseYield: 600, icon: 'neon_palace', name: 'Neon Palace', description: 'Neon Palace - Luxurious cyberpunk mansion' },
  quantum_spire: { basePrice: 5000, basePoints: 300, baseYield: 2000, icon: 'quantum_spire', name: 'Quantum Spire', description: 'Quantum Spire - Ultimate cybernetic skyscraper' },
};

// Cyberpunk property types for easy access
export const CYBERPUNK_PROPERTIES = {
  neural_pod: PROPERTY_TYPES.neural_pod,
  data_fortress: PROPERTY_TYPES.data_fortress,
  cyber_tower: PROPERTY_TYPES.cyber_tower,
  neon_palace: PROPERTY_TYPES.neon_palace,
  quantum_spire: PROPERTY_TYPES.quantum_spire,
};

// Limited edition rarity types
export const RARITY_TYPES = {
  Common: { price: 500, points: 50, color: 'bg-gray-500', icon: '⚪' },
  Rare: { price: 1000, points: 150, color: 'bg-blue-500', icon: '🔵' },
  Epic: { price: 2500, points: 400, color: 'bg-purple-500', icon: '🟣' },
  Legendary: { price: 5000, points: 1000, color: 'bg-yellow-500', icon: '🟡' },
  Mythic: { price: 10000, points: 2500, color: 'bg-red-500', icon: '🔴' },
};

// LIFE Token Contract Functions
class LifeTokenContract {
  static async getBalance(userAddress: `0x${string}`): Promise<bigint> {
    try {
      console.log('[LIFE Balance] Fetching balance for address:', userAddress);
      console.log('[LIFE Balance] Contract address:', CONTRACT_ADDRESSES.LIFE_TOKEN);
      console.log('[LIFE Balance] RPC URL:', process.env.NEXT_PUBLIC_RPC_URL);
      
      const balance = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.LIFE_TOKEN,
        abi: LIFE_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      }) as bigint;
      
      console.log('[LIFE Balance] Successfully fetched balance:', balance.toString());
      return balance;
    } catch (error) {
      console.error('[LIFE Balance] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        cause: error instanceof Error ? error.cause : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        userAddress,
        contractAddress: CONTRACT_ADDRESSES.LIFE_TOKEN,
        rpcUrl: process.env.NEXT_PUBLIC_RPC_URL
      });
      return BigInt(0);
    }
  }

  static async getLastClaimTime(userAddress: `0x${string}`): Promise<bigint> {
    try {
      const lastClaimTime = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.LIFE_TOKEN,
        abi: LIFE_ABI,
        functionName: 'getLastClaimTime',
        args: [userAddress],
      }) as bigint;
      return lastClaimTime;
    } catch (error) {
      console.error('Error fetching last claim time:', error);
      return BigInt(0);
    }
  }

  static async getTimeUntilNextClaim(userAddress: `0x${string}`): Promise<bigint> {
    try {
      const timeUntilNext = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.LIFE_TOKEN,
        abi: LIFE_ABI,
        functionName: 'timeUntilNextClaim',
        args: [userAddress],
      }) as bigint;
      return timeUntilNext;
    } catch (error) {
      console.error('Error fetching time until next claim:', error);
      return BigInt(0);
    }
  }

  static async getTotalSupply(): Promise<bigint> {
    try {
      const totalSupply = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.LIFE_TOKEN,
        abi: LIFE_ABI,
        functionName: 'totalSupply',
      }) as bigint;
      return totalSupply;
    } catch (error) {
      console.error('Error fetching total supply:', error);
      return BigInt(0);
    }
  }

  static async getLifetimeCheckIns(userAddress: `0x${string}`): Promise<bigint> {
    try {
      const checkIns = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.LIFE_TOKEN,
        abi: LIFE_ABI,
        functionName: 'getLifetimeCheckIns',
        args: [userAddress],
      }) as bigint;
      return checkIns;
    } catch (error) {
      console.error('Error fetching lifetime check-ins:', error);
      return BigInt(0);
    }
  }

  static formatBalance(balance: bigint): string {
    // Convert from wei to tokens (assuming 18 decimals)
    const balanceInTokens = Number(balance) / Math.pow(10, 18);
    const formatted = balanceInTokens.toFixed(2);
    // Remove trailing zeros and decimal point if not needed
    return parseFloat(formatted).toString();
  }

  // Fetch recent claim events from the blockchain
  static async getRecentClaimEvents(limit: number = 5): Promise<Array<{
    user: string;
    region: string;
    amount: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
  }>> {
    try {
      console.log('[Recent Claims] Fetching last', limit, 'claim events...');
      
      // Get recent DailyRewardClaimed events
      const currentBlock = await rpcManager.getBlockNumber();
      const fromBlock = currentBlock - BigInt(5000); // Look back ~5k blocks (about 10-20 hours)
      
      const events = await rpcManager.getLogs({
        address: CONTRACT_ADDRESSES.LIFE_TOKEN,
        event: {
          type: 'event',
          name: 'DailyRewardClaimed',
          inputs: [
            { type: 'address', name: 'user', indexed: true },
            { type: 'uint256', name: 'amount', indexed: false },
            { type: 'string', name: 'region', indexed: false }
          ]
        },
        fromBlock,
        toBlock: 'latest'
      });

      console.log('[Recent Claims] Found', events.length, 'events');

      // Process and format events
      const formattedEvents = await Promise.all(
        events.slice(-limit).map(async (event: any) => {
          try {
            // Get block details for timestamp
            const block = await rpcManager.getBlock({ blockNumber: event.blockNumber });
            
            // Decode event data
            const decodedLog = {
              user: event.topics[1] ? `0x${event.topics[1].slice(26)}` : '',
              amount: event.data ? BigInt(event.data.slice(0, 66)).toString() : '0',
              region: event.data ? decodeRegionFromEventData(event.data) : 'Unknown'
            };

            return {
              user: decodedLog.user,
              region: decodedLog.region,
              amount: decodedLog.amount,
              timestamp: Number(block.timestamp),
              blockNumber: Number(event.blockNumber),
              transactionHash: event.transactionHash
            };
          } catch (error) {
            console.error('Error processing event:', error);
            return null;
          }
        })
      );

      // Filter out null results and reverse to get most recent first
      const validEvents = formattedEvents.filter(event => event !== null) as Array<{
        user: string;
        region: string;
        amount: string;
        timestamp: number;
        blockNumber: number;
        transactionHash: string;
      }>;

      console.log('[Recent Claims] Processed', validEvents.length, 'valid events');
      return validEvents.reverse();
    } catch (error) {
      console.error('Error fetching recent claim events:', error);
      return [];
    }
  }

  // Count unique claimers in the last 24h (UTC)
  static async getUniqueClaimersLast24h(): Promise<number> {
    try {
      const nowSec = Math.floor(Date.now() / 1000)
      const sinceSec = nowSec - 86400

      const currentBlock = await rpcManager.getBlockNumber()
      const fromBlock = currentBlock - BigInt(20000)

      const events = await rpcManager.getLogs({
        address: CONTRACT_ADDRESSES.LIFE_TOKEN,
        event: {
          type: 'event',
          name: 'DailyRewardClaimed',
          inputs: [
            { type: 'address', name: 'user', indexed: true },
            { type: 'uint256', name: 'amount', indexed: false },
            { type: 'string', name: 'region', indexed: false }
          ]
        },
        fromBlock,
        toBlock: 'latest'
      })

      if (!events.length) return 0

      const unique = new Set<string>()
      for (const ev of events) {
        try {
          const block = await rpcManager.getBlock({ blockNumber: ev.blockNumber })
          const ts = Number(block.timestamp)
          if (ts >= sinceSec) {
            const user = ev.topics[1] ? `0x${ev.topics[1].slice(26)}` : ''
            if (user) unique.add(user.toLowerCase())
          }
        } catch (e) {
          // ignore per-event errors
        }
      }

      return unique.size
    } catch (error) {
      console.error('[24h Alive] Failed to compute unique claimers:', error)
      return 0
    }
  }

  // Convert region strings to approximate coordinates for globe visualization
  static async convertRegionsToCoordinates(regions: string[]): Promise<Array<{
    lat: number;
    lng: number;
    region: string;
    timestamp: number;
  }>> {
    const coordinates: Array<{
      lat: number;
      lng: number;
      region: string;
      timestamp: number;
    }> = [];

    for (const region of regions) {
      try {
        // Use a geocoding service to convert region to coordinates
        // For now, we'll use a simple mapping for common regions
        const coords = await this.getCoordinatesForRegion(region);
        if (coords) {
          coordinates.push({
            lat: coords.lat,
            lng: coords.lng,
            region,
            timestamp: Date.now()
          });
        }
      } catch (error) {
        console.error('Error converting region to coordinates:', region, error);
      }
    }

    return coordinates;
  }

  // Simple region to coordinates mapping (can be enhanced with real geocoding API)
  static async getCoordinatesForRegion(region: string): Promise<{ lat: number; lng: number } | null> {
    // Common region mappings
    const regionMap: { [key: string]: { lat: number; lng: number } } = {
      // Major cities
      'New York, USA': { lat: 40.7128, lng: -74.0060 },
      'London, UK': { lat: 51.5074, lng: -0.1278 },
      'Tokyo, Japan': { lat: 35.6762, lng: 139.6503 },
      'Sydney, Australia': { lat: -33.8688, lng: 151.2093 },
      'Paris, France': { lat: 48.8566, lng: 2.3522 },
      'Berlin, Germany': { lat: 52.5200, lng: 13.4050 },
      'Moscow, Russia': { lat: 55.7558, lng: 37.6176 },
      
      // Philippines - Major Cities and Regions
      'Manila, Philippines': { lat: 14.5995, lng: 120.9842 },
      'Quezon City, Philippines': { lat: 14.6760, lng: 121.0437 },
      'Makati, Philippines': { lat: 14.5547, lng: 121.0244 },
      'Makati City, Philippines': { lat: 14.5547, lng: 121.0244 },
      'Mandaluyong, Philippines': { lat: 14.5794, lng: 121.0359 },
      'Mandaluyong City, Philippines': { lat: 14.5794, lng: 121.0359 },
      'Pasig, Philippines': { lat: 14.5764, lng: 121.0851 },
      'Pasig City, Philippines': { lat: 14.5764, lng: 121.0851 },
      'Taguig, Philippines': { lat: 14.5176, lng: 121.0509 },
      'Taguig City, Philippines': { lat: 14.5176, lng: 121.0509 },
      'Cebu City, Philippines': { lat: 10.3157, lng: 123.8854 },
      'Davao City, Philippines': { lat: 7.1907, lng: 125.4553 },
      'Caloocan, Philippines': { lat: 14.6507, lng: 120.9668 },
      'Zamboanga City, Philippines': { lat: 6.9214, lng: 122.0790 },
      'Antipolo, Philippines': { lat: 14.5932, lng: 121.1815 },
      'Pasay, Philippines': { lat: 14.5378, lng: 120.9896 },
      'Valenzuela, Philippines': { lat: 14.7000, lng: 120.9833 },
      'Bacoor, Philippines': { lat: 14.4598, lng: 120.9429 },
      'General Santos, Philippines': { lat: 6.1164, lng: 125.1716 },
      'Parañaque, Philippines': { lat: 14.4793, lng: 121.0198 },
      'Las Piñas, Philippines': { lat: 14.4378, lng: 120.9761 },
      'Marikina, Philippines': { lat: 14.6507, lng: 121.1029 },
      'Muntinlupa, Philippines': { lat: 14.3832, lng: 121.0409 },
      'San Juan, Philippines': { lat: 14.6019, lng: 121.0355 },
      'Malabon, Philippines': { lat: 14.6570, lng: 120.9633 },
      'Navotas, Philippines': { lat: 14.6681, lng: 120.9470 },
      'Angeles City, Philippines': { lat: 15.1455, lng: 120.5876 },
      'Olongapo, Philippines': { lat: 14.8294, lng: 120.2824 },
      'Iloilo City, Philippines': { lat: 10.7202, lng: 122.5621 },
      'Cagayan de Oro, Philippines': { lat: 8.4542, lng: 124.6319 },
      'Bacolod, Philippines': { lat: 10.6770, lng: 122.9500 },
      'Baguio, Philippines': { lat: 16.4023, lng: 120.5960 },
      
      // Nigeria - Major Cities and States
      'Lagos, Nigeria': { lat: 6.5244, lng: 3.3792 },
      'Abuja, Nigeria': { lat: 9.0765, lng: 7.3986 },
      'Kano, Nigeria': { lat: 12.0022, lng: 8.5920 },
      'Ibadan, Nigeria': { lat: 7.3775, lng: 3.9470 },
      'Port Harcourt, Nigeria': { lat: 4.8156, lng: 7.0498 },
      'Benin City, Nigeria': { lat: 6.3350, lng: 5.6037 },
      'Maiduguri, Nigeria': { lat: 11.8311, lng: 13.1511 },
      'Zaria, Nigeria': { lat: 11.0804, lng: 7.7076 },
      'Aba, Nigeria': { lat: 5.1066, lng: 7.3667 },
      'Jos, Nigeria': { lat: 9.9285, lng: 8.8921 },
      'Ilorin, Nigeria': { lat: 8.5000, lng: 4.5500 },
      'Oyo, Nigeria': { lat: 7.8500, lng: 3.9333 },
      'Enugu, Nigeria': { lat: 6.4474, lng: 7.4981 },
      'Abeokuta, Nigeria': { lat: 7.1475, lng: 3.3619 },
      'Abuja FCT, Nigeria': { lat: 9.0765, lng: 7.3986 },
      'Sokoto, Nigeria': { lat: 13.0059, lng: 5.2476 },
      'Onitsha, Nigeria': { lat: 6.1667, lng: 6.7833 },
      'Warri, Nigeria': { lat: 5.5167, lng: 5.7500 },
      'Okene, Nigeria': { lat: 7.5500, lng: 6.2333 },
      'Calabar, Nigeria': { lat: 4.9517, lng: 8.3220 },
      'Uyo, Nigeria': { lat: 5.0500, lng: 7.9333 },
      'Abakaliki, Nigeria': { lat: 6.3250, lng: 8.1167 },
      'Bauchi, Nigeria': { lat: 10.3158, lng: 9.8442 },
      'Katsina, Nigeria': { lat: 12.9908, lng: 7.6018 },
      'Katsina State, Nigeria': { lat: 12.9908, lng: 7.6018 },
      'Kaduna, Nigeria': { lat: 10.5222, lng: 7.4383 },
      'Gombe, Nigeria': { lat: 10.2897, lng: 11.1711 },
      'Yola, Nigeria': { lat: 9.2000, lng: 12.4833 },
      'Makurdi, Nigeria': { lat: 7.7333, lng: 8.5167 },
      'Lafia, Nigeria': { lat: 8.4833, lng: 8.5167 },
      'Lokoja, Nigeria': { lat: 7.8000, lng: 6.7333 },
      'Minna, Nigeria': { lat: 9.6167, lng: 6.5500 },
      'Birnin Kebbi, Nigeria': { lat: 12.4500, lng: 4.2000 },
      'Dutse, Nigeria': { lat: 11.7564, lng: 9.3453 },
      'Damaturu, Nigeria': { lat: 11.7500, lng: 11.9667 },
      'Jalingo, Nigeria': { lat: 8.8833, lng: 11.3667 },
      'Gusau, Nigeria': { lat: 12.1704, lng: 6.6642 },
      
      // Spain - Major Cities and Regions
      'Madrid, Spain': { lat: 40.4168, lng: -3.7038 },
      'Barcelona, Spain': { lat: 41.3851, lng: 2.1734 },
      'Valencia, Spain': { lat: 39.4699, lng: -0.3763 },
      'Seville, Spain': { lat: 37.3891, lng: -5.9845 },
      'Zaragoza, Spain': { lat: 41.6488, lng: -0.8891 },
      'Málaga, Spain': { lat: 36.7213, lng: -4.4214 },
      'Murcia, Spain': { lat: 37.9922, lng: -1.1307 },
      'Palma, Spain': { lat: 39.5696, lng: 2.6502 },
      'Las Palmas, Spain': { lat: 28.1248, lng: -15.4300 },
      'Bilbao, Spain': { lat: 43.2627, lng: -2.9253 },
      'Alicante, Spain': { lat: 38.3452, lng: -0.4810 },
      'Córdoba, Spain': { lat: 37.8882, lng: -4.7794 },
      'Valladolid, Spain': { lat: 41.6523, lng: -4.7245 },
      'Vigo, Spain': { lat: 42.2406, lng: -8.7207 },
      'Gijón, Spain': { lat: 43.5322, lng: -5.6611 },
      'Hospitalet de Llobregat, Spain': { lat: 41.3598, lng: 2.1006 },
      'Vitoria-Gasteiz, Spain': { lat: 42.8467, lng: -2.6716 },
      'A Coruña, Spain': { lat: 43.3623, lng: -8.4115 },
      'Elche, Spain': { lat: 38.2622, lng: -0.7011 },
      'Granada, Spain': { lat: 37.1773, lng: -3.5986 },
      'Oviedo, Spain': { lat: 43.3614, lng: -5.8593 },
      'Badalona, Spain': { lat: 41.4502, lng: 2.2445 },
      'Cartagena, Spain': { lat: 37.6000, lng: -0.9833 },
      'Terrassa, Spain': { lat: 41.5640, lng: 2.0084 },
      'Jerez de la Frontera, Spain': { lat: 36.6868, lng: -6.1362 },
      'Sabadell, Spain': { lat: 41.5431, lng: 2.1089 },
      'Móstoles, Spain': { lat: 40.3230, lng: -3.8644 },
      'Santa Cruz de Tenerife, Spain': { lat: 28.4636, lng: -16.2518 },
      'Pamplona, Spain': { lat: 42.8125, lng: -1.6458 },
      'Almería, Spain': { lat: 36.8381, lng: -2.4597 },
      'Fuenlabrada, Spain': { lat: 40.2842, lng: -3.7995 },
      'Leganés, Spain': { lat: 40.3267, lng: -3.7636 },
      'Donostia-San Sebastián, Spain': { lat: 43.3183, lng: -1.9812 },
      'Burgos, Spain': { lat: 42.3440, lng: -3.6969 },
      'Santander, Spain': { lat: 43.4623, lng: -3.8099 },
      'Castellón de la Plana, Spain': { lat: 39.9864, lng: -0.0513 },
      'Getafe, Spain': { lat: 40.3058, lng: -3.7327 },
      'Albacete, Spain': { lat: 38.9942, lng: -1.8564 },
      'Alcorcón, Spain': { lat: 40.3459, lng: -3.8242 },
      'Logroño, Spain': { lat: 42.4627, lng: -2.4449 },
      'Badajoz, Spain': { lat: 38.8794, lng: -6.9706 },
      'Salamanca, Spain': { lat: 40.9701, lng: -5.6635 },
      'Huelva, Spain': { lat: 37.2614, lng: -6.9447 },
      'Marbella, Spain': { lat: 36.5108, lng: -4.8850 },
      'Lleida, Spain': { lat: 41.6175, lng: 0.6200 },
      'Tarragona, Spain': { lat: 41.1189, lng: 1.2445 },
      'León, Spain': { lat: 42.5987, lng: -5.5671 },
      'Cadiz, Spain': { lat: 36.5297, lng: -6.2929 },
      'Dos Hermanas, Spain': { lat: 37.2820, lng: -5.9207 },
      'Torrejón de Ardoz, Spain': { lat: 40.4558, lng: -3.4844 },
      'Parla, Spain': { lat: 40.2378, lng: -3.7681 },
      'Mataró, Spain': { lat: 41.5339, lng: 2.4447 },
      'Santa Coloma de Gramenet, Spain': { lat: 41.4520, lng: 2.2081 },
      'Alcalá de Henares, Spain': { lat: 40.4817, lng: -3.3616 },
      'Laguna de Duero, Spain': { lat: 41.5667, lng: -4.7167 },
      'Valladolid Province, Spain': { lat: 41.6523, lng: -4.7245 },
      
      // Additional regions from your claims
      'Lima, Peru': { lat: -12.0464, lng: -77.0428 },
      'Santiago, Chile': { lat: -33.4489, lng: -70.6693 },
      'Bangkok, Thailand': { lat: 13.7563, lng: 100.5018 },
      'Si Sa Ket, Thailand': { lat: 15.1186, lng: 104.3222 },
      'Sepang, Malaysia': { lat: 2.8183, lng: 101.7003 },
      'Kuala Lumpur, Malaysia': { lat: 3.1390, lng: 101.6869 },
      'Jakarta, Indonesia': { lat: -6.2088, lng: 106.8456 },
      'Singapore': { lat: 1.3521, lng: 103.8198 },
      'Hong Kong': { lat: 22.3193, lng: 114.1694 },
      'Seoul, South Korea': { lat: 37.5665, lng: 126.9780 },
      'Mumbai, India': { lat: 19.0760, lng: 72.8777 },
      'Delhi, India': { lat: 28.7041, lng: 77.1025 },
      'Dubai, UAE': { lat: 25.2048, lng: 55.2708 },
      'Cairo, Egypt': { lat: 30.0444, lng: 31.2357 },
      'Johannesburg, South Africa': { lat: -26.2041, lng: 28.0473 },
      'São Paulo, Brazil': { lat: -23.5505, lng: -46.6333 },
      'Buenos Aires, Argentina': { lat: -34.6118, lng: -58.3960 },
      'Mexico City, Mexico': { lat: 19.4326, lng: -99.1332 },
      'Toronto, Canada': { lat: 43.6532, lng: -79.3832 },
      'Vancouver, Canada': { lat: 49.2827, lng: -123.1207 },
      'Beijing, China': { lat: 39.9042, lng: 116.4074 },
      'Mar del Plata, Argentina': { lat: -38.0023, lng: -57.5575 },
      'Neiva, Colombia': { lat: 2.9345, lng: -75.2809 },
      'Hang Dong, Thailand': { lat: 18.7883, lng: 98.9853 },
      'Guatemala City, Guatemala': { lat: 14.6349, lng: -90.5069 },
      'Bogotá, Colombia': { lat: 4.7110, lng: -74.0721 },
      'Medellín, Colombia': { lat: 6.2442, lng: -75.5812 },
      'Cali, Colombia': { lat: 3.4516, lng: -76.5320 },
      'Cartagena, Colombia': { lat: 10.3910, lng: -75.4794 },
      'Chiang Mai, Thailand': { lat: 18.7883, lng: 98.9853 },
      'Phuket, Thailand': { lat: 7.8804, lng: 98.3923 },
      'Pattaya, Thailand': { lat: 12.9236, lng: 100.8825 },
      'Antigua Guatemala, Guatemala': { lat: 14.5586, lng: -90.7295 },
      'Quetzaltenango, Guatemala': { lat: 14.8347, lng: -91.5181 },
      'Rosario, Argentina': { lat: -32.9442, lng: -60.6505 },
      'Córdoba, Argentina': { lat: -31.4201, lng: -64.1888 },
      'Mendoza, Argentina': { lat: -32.8908, lng: -68.8272 },
      
      // Countries (approximate center)
      'USA': { lat: 39.8283, lng: -98.5795 },
      'United States': { lat: 39.8283, lng: -98.5795 },
      'UK': { lat: 55.3781, lng: -3.4360 },
      'United Kingdom': { lat: 55.3781, lng: -3.4360 },
      'Japan': { lat: 36.2048, lng: 138.2529 },
      'Australia': { lat: -25.2744, lng: 133.7751 },
      'France': { lat: 46.6034, lng: 1.8883 },
      'Germany': { lat: 51.1657, lng: 10.4515 },
      'Russia': { lat: 61.5240, lng: 105.3188 },
      'China': { lat: 35.8617, lng: 104.1954 },
      'India': { lat: 20.5937, lng: 78.9629 },
      'Brazil': { lat: -14.2350, lng: -51.9253 },
      'Canada': { lat: 56.1304, lng: -106.3468 },
      'Mexico': { lat: 23.6345, lng: -102.5528 },
      'Philippines': { lat: 12.8797, lng: 121.7740 },
      'Nigeria': { lat: 9.0820, lng: 8.6753 },
      'Spain': { lat: 40.4637, lng: -3.7492 },
      'Thailand': { lat: 15.8700, lng: 100.9925 },
      'Malaysia': { lat: 4.2105, lng: 101.9758 },
      'Indonesia': { lat: -0.7893, lng: 113.9213 },
      'Colombia': { lat: 4.5709, lng: -74.2973 },
      'Argentina': { lat: -38.4161, lng: -63.6167 },
      'Guatemala': { lat: 15.7835, lng: -90.2308 },
      'Chile': { lat: -35.6751, lng: -71.5430 },
      'Peru': { lat: -9.1900, lng: -75.0152 }
    };

    // 1. Direct match (fastest)
    if (regionMap[region]) {
      return regionMap[region];
    }

    // 2. Normalize and try again
    const normalizedRegion = this.normalizeRegionName(region);
    if (regionMap[normalizedRegion]) {
      return regionMap[normalizedRegion];
    }

    // 3. Smart pattern matching
    const patternMatch = this.getPatternMatchCoordinates(region, regionMap);
    if (patternMatch) {
      return patternMatch;
    }

    // 4. Country-based fallback
    const countryMatch = this.getCountryFallbackCoordinates(region);
    if (countryMatch) {
      console.log(`🌍 Using country fallback for: ${region} -> ${countryMatch.country}`);
      return countryMatch.coords;
    }

    // 5. Final fallback - use a more reasonable default than (0,0)
    console.log(`📍 Using default coordinates for unmapped region: ${region}`);
    return { lat: 20, lng: 0 }; // Slightly north of equator, more reasonable than ocean
  }

  // Helper method to normalize region names
  private static normalizeRegionName(region: string): string {
    return region
      .replace(/\s*\(.*?\)\s*/g, '') // Remove parentheses content
      .replace(/\s+/g, ' ') // Normalize spaces
      .replace(/,\s*$/, '') // Remove trailing comma
      .trim();
  }

  // Enhanced pattern matching with smart logic
  private static getPatternMatchCoordinates(
    region: string, 
    regionMap: { [key: string]: { lat: number; lng: number } }
  ): { lat: number; lng: number } | null {
    const normalized = region.toLowerCase();

    // Try exact partial matches first
    for (const [key, coords] of Object.entries(regionMap)) {
      const keyLower = key.toLowerCase();
      if (normalized.includes(keyLower) || keyLower.includes(normalized)) {
        return coords;
      }
    }

    // Try city name extraction (remove common suffixes)
    const cityName = normalized
      .replace(/\s*(city|municipality|province|state|region)\s*/g, '')
      .replace(/,.*$/, '') // Remove everything after comma
      .trim();

    if (cityName && cityName !== normalized) {
      for (const [key, coords] of Object.entries(regionMap)) {
        const keyCity = key.toLowerCase().split(',')[0].trim();
        if (keyCity.includes(cityName) || cityName.includes(keyCity)) {
          return coords;
        }
      }
    }

    return null;
  }

  // Country-based fallback system
  private static getCountryFallbackCoordinates(region: string): { country: string; coords: { lat: number; lng: number } } | null {
    const countryMap: { [key: string]: { country: string; coords: { lat: number; lng: number } } } = {
      // Philippines variations
      'philippines': { country: 'Philippines', coords: { lat: 12.8797, lng: 121.7740 } },
      'ph': { country: 'Philippines', coords: { lat: 12.8797, lng: 121.7740 } },
      'pilipinas': { country: 'Philippines', coords: { lat: 12.8797, lng: 121.7740 } },
      
      // Nigeria variations
      'nigeria': { country: 'Nigeria', coords: { lat: 9.0820, lng: 8.6753 } },
      'ng': { country: 'Nigeria', coords: { lat: 9.0820, lng: 8.6753 } },
      'naija': { country: 'Nigeria', coords: { lat: 9.0820, lng: 8.6753 } },
      
      // Spain variations
      'spain': { country: 'Spain', coords: { lat: 40.4637, lng: -3.7492 } },
      'españa': { country: 'Spain', coords: { lat: 40.4637, lng: -3.7492 } },
      'es': { country: 'Spain', coords: { lat: 40.4637, lng: -3.7492 } },
      
      // Common countries
      'usa': { country: 'United States', coords: { lat: 39.8283, lng: -98.5795 } },
      'united states': { country: 'United States', coords: { lat: 39.8283, lng: -98.5795 } },
      'america': { country: 'United States', coords: { lat: 39.8283, lng: -98.5795 } },
      'uk': { country: 'United Kingdom', coords: { lat: 55.3781, lng: -3.4360 } },
      'united kingdom': { country: 'United Kingdom', coords: { lat: 55.3781, lng: -3.4360 } },
      'britain': { country: 'United Kingdom', coords: { lat: 55.3781, lng: -3.4360 } },
      'japan': { country: 'Japan', coords: { lat: 36.2048, lng: 138.2529 } },
      'australia': { country: 'Australia', coords: { lat: -25.2744, lng: 133.7751 } },
      'france': { country: 'France', coords: { lat: 46.6034, lng: 1.8883 } },
      'germany': { country: 'Germany', coords: { lat: 51.1657, lng: 10.4515 } },
      'russia': { country: 'Russia', coords: { lat: 61.5240, lng: 105.3188 } },
      'china': { country: 'China', coords: { lat: 35.8617, lng: 104.1954 } },
      'india': { country: 'India', coords: { lat: 20.5937, lng: 78.9629 } },
      'brazil': { country: 'Brazil', coords: { lat: -14.2350, lng: -51.9253 } },
      'canada': { country: 'Canada', coords: { lat: 56.1304, lng: -106.3468 } },
      'mexico': { country: 'Mexico', coords: { lat: 23.6345, lng: -102.5528 } },
      'thailand': { country: 'Thailand', coords: { lat: 15.8700, lng: 100.9925 } },
      'malaysia': { country: 'Malaysia', coords: { lat: 4.2105, lng: 101.9758 } },
      'indonesia': { country: 'Indonesia', coords: { lat: -0.7893, lng: 113.9213 } },
      'colombia': { country: 'Colombia', coords: { lat: 4.5709, lng: -74.2973 } },
      'argentina': { country: 'Argentina', coords: { lat: -38.4161, lng: -63.6167 } },
      'guatemala': { country: 'Guatemala', coords: { lat: 15.7835, lng: -90.2308 } },
      'chile': { country: 'Chile', coords: { lat: -35.6751, lng: -71.5430 } },
      'peru': { country: 'Peru', coords: { lat: -9.1900, lng: -75.0152 } }
    };

    const normalized = region.toLowerCase();
    
    // Direct country match
    if (countryMap[normalized]) {
      return countryMap[normalized];
    }

    // Check if region contains country name
    for (const [countryKey, countryData] of Object.entries(countryMap)) {
      if (normalized.includes(countryKey) || normalized.includes(countryData.country.toLowerCase())) {
        return countryData;
      }
    }

    return null;
  }
}

// Helper function to decode region from event data
function decodeRegionFromEventData(data: string): string {
  try {
    // Event data format: [amount (32 bytes)][offset (32 bytes)][length (32 bytes)][region string]
    // Skip first 96 characters (0x + 32*2 + 32*2) to get to the region data
    const regionHex = data.slice(130); // Skip 0x + 64 + 64 chars
    
    // Convert hex to string
    let region = '';
    for (let i = 0; i < regionHex.length; i += 2) {
      const hex = regionHex.substr(i, 2);
      const char = String.fromCharCode(parseInt(hex, 16));
      if (char !== '\0') region += char;
    }
    
    return region || 'Unknown';
  } catch (error) {
    console.error('Error decoding region from event data:', error);
    return 'Unknown';
  }
}

// Property Contract Functions
class PropertyContract {
  static async getUserProperties(userAddress: `0x${string}`): Promise<any[]> {
    try {
      console.log('[Property Contract] Fetching user properties for:', userAddress);
      
      // Get user's property token IDs
      const tokenIds = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.PROPERTY,
        abi: PROPERTY_ABI,
        functionName: 'getPropertiesByOwner',
        args: [userAddress],
      }) as bigint[];
      
      console.log('[Property Contract] Found token IDs:', tokenIds);
      
      // Get details for each property
      const properties = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const details = await rpcManager.readContract({
              address: CONTRACT_ADDRESSES.PROPERTY,
              abi: PROPERTY_ABI,
              functionName: 'getPropertyDetails',
              args: [tokenId],
            }) as any;
            
            return {
              id: tokenId.toString(),
              name: details.name,
              type: details.propertyType,
              location: details.location,
              level: Number(details.level),
              statusPoints: Number(details.statusPoints),
              yieldRate: Number(details.yieldRate),
              createdAt: Number(details.createdAt),
            };
          } catch (error) {
            console.error(`Error fetching details for token ${tokenId}:`, error);
            return null;
          }
        })
      );
      
      return properties.filter(p => p !== null);
    } catch (error) {
      console.error('Error fetching user properties:', error);
      return [];
    }
  }

  static async getPropertyDetails(tokenId: bigint): Promise<any> {
    try {
      const details = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.PROPERTY,
        abi: PROPERTY_ABI,
        functionName: 'getPropertyDetailsWithOwner',
        args: [tokenId],
      }) as any;
      
      return {
        id: tokenId.toString(),
        name: details.metadata.name,
        type: details.metadata.propertyType,
        location: details.metadata.location,
        level: Number(details.metadata.level),
        statusPoints: Number(details.metadata.statusPoints),
        yieldRate: Number(details.metadata.yieldRate),
        createdAt: Number(details.metadata.createdAt),
        owner: details.owner,
      };
    } catch (error) {
      console.error('Error fetching property details:', error);
      return null;
    }
  }

  static async getUserStatusPoints(userAddress: `0x${string}`): Promise<bigint> {
    try {
      const totalPoints = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.PROPERTY,
        abi: PROPERTY_ABI,
        functionName: 'getTotalStatusPoints',
        args: [userAddress],
      }) as bigint;
      
      return totalPoints;
    } catch (error) {
      console.error('Error fetching user status points from properties:', error);
      return BigInt(0);
    }
  }

  static async getTotalSupply(): Promise<bigint> {
    try {
      const supply = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.PROPERTY,
        abi: PROPERTY_ABI,
        functionName: 'totalSupply',
      }) as bigint;
      
      return supply;
    } catch (error) {
      console.error('Error fetching total supply:', error);
      return BigInt(0);
    }
  }
}

// Limited Edition Contract Functions
class LimitedEditionContract {
  static async getUserLimitedEditions(userAddress: `0x${string}`): Promise<any[]> {
    try {
      // This would require the LimitedEdition contract ABI
      // For now, returning mock data structure
      return [];
    } catch (error) {
      console.error('Error fetching user limited editions:', error);
      return [];
    }
  }

  static async getLimitedEditionDetails(tokenId: bigint): Promise<any> {
    try {
      // This would require the LimitedEdition contract ABI
      // For now, returning mock data structure
      return null;
    } catch (error) {
      console.error('Error fetching limited edition details:', error);
      return null;
    }
  }

  static async getUserStatusPoints(userAddress: `0x${string}`): Promise<bigint> {
    try {
      // This would require the LimitedEdition contract ABI
      // For now, returning 0
      return BigInt(0);
    } catch (error) {
      console.error('Error fetching user status points from limited editions:', error);
      return BigInt(0);
    }
  }
}

// Player Registry Contract Functions
class PlayerRegistryContract {
  static async getPlayerData(userAddress: `0x${string}`): Promise<any> {
    try {
      // This would require the PlayerRegistry contract ABI
      // For now, returning mock data structure
      return {
        totalStatusPoints: BigInt(0),
        rank: BigInt(0),
        isRegistered: false,
      };
    } catch (error) {
      console.error('Error fetching player data:', error);
      return null;
    }
  }

  static async getLeaderboard(count: number): Promise<any[]> {
    try {
      // This would require the PlayerRegistry contract ABI
      // For now, returning mock data structure
      return [];
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }

  static async getTotalPlayers(): Promise<bigint> {
    try {
      // This would require the PlayerRegistry contract ABI
      // For now, returning 0
      return BigInt(0);
    } catch (error) {
      console.error('Error fetching total players:', error);
      return BigInt(0);
    }
  }
}

// Economy Contract Functions
class EconomyContract {
  static async getPropertyPrice(propertyType: string): Promise<{ lifePrice: bigint; wldPrice: bigint; isActive: boolean }> {
    try {
      if (!CONTRACT_ADDRESSES.ECONOMY) {
        throw new Error('Economy contract address not configured');
      }
      
      const result = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.ECONOMY,
        abi: ECONOMYV2_ABI,
        functionName: 'getPropertyPrice',
        args: [propertyType],
      }) as any;

      // Handle both tuple and object return types
      if (Array.isArray(result)) {
        return {
          lifePrice: result[0],
          wldPrice: result[1],
          isActive: result[2]
        };
      } else {
        return {
          lifePrice: result.lifePrice || BigInt(0),
          wldPrice: result.wldPrice || BigInt(0),
          isActive: result.isActive || false
        };
      }
    } catch (error) {
      console.error(`Error fetching property price for ${propertyType}:`, error);
      // Return fallback prices based on property type if available
      const fallbackProperty = PROPERTY_TYPES[propertyType as keyof typeof PROPERTY_TYPES];
      if (fallbackProperty) {
        const basePrice = BigInt(fallbackProperty.basePrice * 1e18);
        return { 
          lifePrice: basePrice, 
          wldPrice: basePrice / BigInt(100), 
          isActive: true // Always active for fallback
        };
      }
      return { lifePrice: BigInt(0), wldPrice: BigInt(0), isActive: false };
    }
  }

  static async getLimitedEditionPrice(templateName: string): Promise<{ lifePrice: bigint; wldPrice: bigint; isActive: boolean }> {
    try {
      if (!CONTRACT_ADDRESSES.ECONOMY) {
        throw new Error('Economy contract address not configured');
      }

      const result = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.ECONOMY,
        abi: ECONOMYV2_ABI,
        functionName: 'getLimitedEditionPrice',
        args: [templateName],
      }) as any;

      // Handle both tuple and object return types
      if (Array.isArray(result)) {
        return {
          lifePrice: result[0],
          wldPrice: result[1],
          isActive: result[2]
        };
      } else {
        return {
          lifePrice: result.lifePrice || BigInt(0),
          wldPrice: result.wldPrice || BigInt(0),
          isActive: result.isActive || false
        };
      }
    } catch (error) {
      console.error('Error fetching limited edition price:', error);
      return { lifePrice: BigInt(0), wldPrice: BigInt(0), isActive: false };
    }
  }

  static async getPurchaseStats(userAddress: `0x${string}`): Promise<{ purchases: bigint; lifeSpent: bigint; wldSpent: bigint }> {
    try {
      if (!CONTRACT_ADDRESSES.ECONOMY) {
        throw new Error('Economy contract address not configured');
      }

      const result = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.ECONOMY,
        abi: ECONOMYV2_ABI,
        functionName: 'getPurchaseStats',
        args: [userAddress],
      }) as [bigint, bigint, bigint];

      return {
        purchases: result[0],
        lifeSpent: result[1],
        wldSpent: result[2]
      };
    } catch (error) {
      console.error('Error fetching purchase stats:', error);
      return { purchases: BigInt(0), lifeSpent: BigInt(0), wldSpent: BigInt(0) };
    }
  }

  static async convertWldToLife(wldAmount: bigint): Promise<bigint> {
    try {
      if (!CONTRACT_ADDRESSES.ECONOMY) {
        throw new Error('Economy contract address not configured');
      }

      const result = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.ECONOMY,
        abi: ECONOMYV2_ABI,
        functionName: 'convertWldToLife',
        args: [wldAmount],
      }) as bigint;

      return result;
    } catch (error) {
      console.error('Error converting WLD to LIFE:', error);
      return BigInt(0);
    }
  }

  static async convertLifeToWld(lifeAmount: bigint): Promise<bigint> {
    try {
      if (!CONTRACT_ADDRESSES.ECONOMY) {
        throw new Error('Economy contract address not configured');
      }

      const result = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.ECONOMY,
        abi: ECONOMYV2_ABI,
        functionName: 'convertLifeToWld',
        args: [lifeAmount],
      }) as bigint;

      return result;
    } catch (error) {
      console.error('Error converting LIFE to WLD:', error);
      return BigInt(0);
    }
  }
}

// WLD Token Contract Functions
class WLDContract {
  static async getBalance(userAddress: `0x${string}`): Promise<bigint> {
    try {
      if (!CONTRACT_ADDRESSES.WLD) {
        console.warn('WLD contract address not configured');
        return BigInt(0);
      }

      const balance = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.WLD,
        abi: WLD_ABI,
        functionName: 'balanceOf',
        args: [userAddress],
      }) as bigint;

      return balance;
    } catch (error) {
      console.error('Error fetching WLD balance:', error);
      return BigInt(0);
    }
  }

  static async getAllowance(ownerAddress: `0x${string}`, spenderAddress: `0x${string}`): Promise<bigint> {
    try {
      if (!CONTRACT_ADDRESSES.WLD) {
        console.warn('WLD contract address not configured');
        return BigInt(0);
      }

      const allowance = await rpcManager.readContract({
        address: CONTRACT_ADDRESSES.WLD,
        abi: WLD_ABI,
        functionName: 'allowance',
        args: [ownerAddress, spenderAddress],
      }) as bigint;

      return allowance;
    } catch (error) {
      console.error('Error fetching WLD allowance:', error);
      return BigInt(0);
    }
  }

  static async getTokenInfo(): Promise<{ name: string; symbol: string; decimals: number }> {
    try {
      if (!CONTRACT_ADDRESSES.WLD) {
        return { name: 'Worldcoin', symbol: 'WLD', decimals: 18 };
      }

      const [name, symbol, decimals] = await Promise.all([
        rpcManager.readContract({
          address: CONTRACT_ADDRESSES.WLD,
          abi: WLD_ABI,
          functionName: 'name',
        }) as Promise<string>,
        rpcManager.readContract({
          address: CONTRACT_ADDRESSES.WLD,
          abi: WLD_ABI,
          functionName: 'symbol',
        }) as Promise<string>,
        rpcManager.readContract({
          address: CONTRACT_ADDRESSES.WLD,
          abi: WLD_ABI,
          functionName: 'decimals',
        }) as Promise<number>,
      ]);

      return { name, symbol, decimals };
    } catch (error) {
      console.error('Error fetching WLD token info:', error);
      return { name: 'Worldcoin', symbol: 'WLD', decimals: 18 };
    }
  }
}

// Utility Functions
class ContractUtils {
  static formatAddress(address: string): string {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  }

  static formatTokenAmount(amount: bigint, decimals: number = 18): string {
    try {
      const divisor = BigInt(10 ** decimals);
      const quotient = amount / divisor;
      const remainder = amount % divisor;
      
      // Convert to numbers safely to avoid BigInt mixing
      const quotientNum = Number(quotient);
      const remainderNum = Number(remainder);
      const divisorNum = Number(divisor);
      
      const fractional = remainderNum / divisorNum;
      return (quotientNum + fractional).toFixed(2);
    } catch (error) {
      console.error('Error formatting token amount:', error);
      // Fallback to simple conversion
      return (Number(amount) / Math.pow(10, decimals)).toFixed(2);
    }
  }

  static parseTokenAmount(amount: string, decimals: number = 18): bigint {
    const factor = BigInt(10 ** decimals);
    const [whole, fraction = '0'] = amount.split('.');
    const wholeBigInt = BigInt(whole) * factor;
    const fractionBigInt = BigInt(fraction.padEnd(decimals, '0').slice(0, decimals));
    return wholeBigInt + fractionBigInt;
  }

  static async waitForTransaction(txHash: string, maxWaitTime: number = 60000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const receipt = await rpcManager.getTransactionReceipt({ hash: txHash as `0x${string}` });
        if (receipt) {
          return receipt.status === 'success';
        }
      } catch (error) {
        // Transaction not yet mined, continue waiting
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return false; // Timeout
  }

  static generateAvatarColor(address: string): string {
    const colors = [
      'from-red-400 to-red-600',
      'from-blue-400 to-blue-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
    ];
    const colorIndex = parseInt(address.slice(-1), 16) % colors.length;
    return colors[colorIndex];
  }

  static generateAvatarBgColor(address: string): string {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const colorIndex = parseInt(address.slice(-1), 16) % colors.length;
    return colors[colorIndex];
  }

  static formatTimeRemaining(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  static formatTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    } else {
      return `${minutes}m ago`;
    }
  }
}

// Error handling utilities
class ContractError extends Error {
  constructor(message: string, public contractAddress?: string, public functionName?: string) {
    super(message);
    this.name = 'ContractError';
  }
}

export function handleContractError(error: any, contractName: string, functionName: string): ContractError {
  console.error(`Error in ${contractName}.${functionName}:`, error);
  
  if (error.message?.includes('User rejected')) {
    return new ContractError('Transaction was rejected by user', undefined, functionName);
  } else if (error.message?.includes('insufficient funds')) {
    return new ContractError('Insufficient funds for transaction', undefined, functionName);
  } else if (error.message?.includes('execution reverted')) {
    return new ContractError('Transaction failed - contract requirements not met', undefined, functionName);
  } else {
    return new ContractError(`Failed to execute ${functionName}`, undefined, functionName);
  }
}

// Export all contract classes and utilities
export {
  LifeTokenContract,
  PropertyContract,
  LimitedEditionContract,
  PlayerRegistryContract,
  EconomyContract,
  WLDContract,
  ContractUtils,
  ContractError,
};