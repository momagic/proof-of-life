// Hierarchical location data structure for structured selection
// Comprehensive list of all world countries in alphabetical order

export interface LocationData {
  countries: Country[];
}

export interface Country {
  name: string;
  code: string;
  coords: { lat: number; lng: number };
  aliases?: string[];
}

// Comprehensive country database with coordinates (alphabetically sorted)
export const LOCATION_DATA: LocationData = {
  countries: [
    { name: "Afghanistan", code: "AF", coords: { lat: 33.9391, lng: 67.7100 } },
    { name: "Albania", code: "AL", coords: { lat: 41.1533, lng: 20.1683 } },
    { name: "Algeria", code: "DZ", coords: { lat: 28.0339, lng: 1.6596 } },
    { name: "Andorra", code: "AD", coords: { lat: 42.5063, lng: 1.5218 } },
    { name: "Angola", code: "AO", coords: { lat: -11.2027, lng: 17.8739 } },
    { name: "Antigua and Barbuda", code: "AG", coords: { lat: 17.0608, lng: -61.7964 } },
    { name: "Argentina", code: "AR", coords: { lat: -38.4161, lng: -63.6167 } },
    { name: "Armenia", code: "AM", coords: { lat: 40.0691, lng: 45.0382 } },
    { name: "Australia", code: "AU", coords: { lat: -25.2744, lng: 133.7751 } },
    { name: "Austria", code: "AT", coords: { lat: 47.5162, lng: 14.5501 } },
    { name: "Azerbaijan", code: "AZ", coords: { lat: 40.1431, lng: 47.5769 } },
    { name: "Bahamas", code: "BS", coords: { lat: 25.0343, lng: -77.3963 } },
    { name: "Bahrain", code: "BH", coords: { lat: 25.9304, lng: 50.6378 } },
    { name: "Bangladesh", code: "BD", coords: { lat: 23.6850, lng: 90.3563 } },
    { name: "Barbados", code: "BB", coords: { lat: 13.1939, lng: -59.5432 } },
    { name: "Belarus", code: "BY", coords: { lat: 53.7098, lng: 27.9534 } },
    { name: "Belgium", code: "BE", coords: { lat: 50.5039, lng: 4.4699 } },
    { name: "Belize", code: "BZ", coords: { lat: 17.1899, lng: -88.4976 } },
    { name: "Benin", code: "BJ", coords: { lat: 9.3077, lng: 2.3158 } },
    { name: "Bhutan", code: "BT", coords: { lat: 27.5142, lng: 90.4336 } },
    { name: "Bolivia", code: "BO", coords: { lat: -16.2902, lng: -63.5887 } },
    { name: "Bosnia and Herzegovina", code: "BA", coords: { lat: 43.9159, lng: 17.6791 } },
    { name: "Botswana", code: "BW", coords: { lat: -22.3285, lng: 24.6849 } },
    { name: "Brazil", code: "BR", coords: { lat: -14.2350, lng: -51.9253 } },
    { name: "Brunei", code: "BN", coords: { lat: 4.5353, lng: 114.7277 } },
    { name: "Bulgaria", code: "BG", coords: { lat: 42.7339, lng: 25.4858 } },
    { name: "Burkina Faso", code: "BF", coords: { lat: 12.2383, lng: -1.5616 } },
    { name: "Burundi", code: "BI", coords: { lat: -3.3731, lng: 29.9189 } },
    { name: "Cabo Verde", code: "CV", coords: { lat: 16.5388, lng: -24.0132 } },
    { name: "Cambodia", code: "KH", coords: { lat: 12.5657, lng: 104.9910 } },
    { name: "Cameroon", code: "CM", coords: { lat: 7.3697, lng: 12.3547 } },
    { name: "Canada", code: "CA", coords: { lat: 56.1304, lng: -106.3468 } },
    { name: "Central African Republic", code: "CF", coords: { lat: 6.6111, lng: 20.9394 } },
    { name: "Chad", code: "TD", coords: { lat: 15.4542, lng: 18.7322 } },
    { name: "Chile", code: "CL", coords: { lat: -35.6751, lng: -71.5430 } },
    { name: "China", code: "CN", coords: { lat: 35.8617, lng: 104.1954 } },
    { name: "Colombia", code: "CO", coords: { lat: 4.5709, lng: -74.2973 } },
    { name: "Comoros", code: "KM", coords: { lat: -11.6455, lng: 43.3333 } },
    { name: "Congo", code: "CG", coords: { lat: -0.2280, lng: 15.8277 } },
    { name: "Costa Rica", code: "CR", coords: { lat: 9.7489, lng: -83.7534 } },
    { name: "Croatia", code: "HR", coords: { lat: 45.1000, lng: 15.2000 } },
    { name: "Cuba", code: "CU", coords: { lat: 21.5218, lng: -77.7812 } },
    { name: "Cyprus", code: "CY", coords: { lat: 35.1264, lng: 33.4299 } },
    { name: "Czech Republic", code: "CZ", coords: { lat: 49.8175, lng: 15.4730 } },
    { name: "Democratic Republic of the Congo", code: "CD", coords: { lat: -4.0383, lng: 21.7587 } },
    { name: "Denmark", code: "DK", coords: { lat: 56.2639, lng: 9.5018 } },
    { name: "Djibouti", code: "DJ", coords: { lat: 11.8251, lng: 42.5903 } },
    { name: "Dominica", code: "DM", coords: { lat: 15.4150, lng: -61.3710 } },
    { name: "Dominican Republic", code: "DO", coords: { lat: 18.7357, lng: -70.1627 } },
    { name: "Ecuador", code: "EC", coords: { lat: -1.8312, lng: -78.1834 } },
    { name: "Egypt", code: "EG", coords: { lat: 26.0975, lng: 31.2357 } },
    { name: "El Salvador", code: "SV", coords: { lat: 13.7942, lng: -88.8965 } },
    { name: "Equatorial Guinea", code: "GQ", coords: { lat: 1.6508, lng: 10.2679 } },
    { name: "Eritrea", code: "ER", coords: { lat: 15.1794, lng: 39.7823 } },
    { name: "Estonia", code: "EE", coords: { lat: 58.5953, lng: 25.0136 } },
    { name: "Eswatini", code: "SZ", coords: { lat: -26.5225, lng: 31.4659 } },
    { name: "Ethiopia", code: "ET", coords: { lat: 9.1450, lng: 40.4897 } },
    { name: "Fiji", code: "FJ", coords: { lat: -16.5780, lng: 179.4144 } },
    { name: "Finland", code: "FI", coords: { lat: 61.9241, lng: 25.7482 } },
    { name: "France", code: "FR", coords: { lat: 46.2276, lng: 2.2137 } },
    { name: "Gabon", code: "GA", coords: { lat: -0.8037, lng: 11.6094 } },
    { name: "Gambia", code: "GM", coords: { lat: 13.4432, lng: -15.3101 } },
    { name: "Georgia", code: "GE", coords: { lat: 42.3154, lng: 43.3569 } },
    { name: "Germany", code: "DE", coords: { lat: 51.1657, lng: 10.4515 } },
    { name: "Ghana", code: "GH", coords: { lat: 7.9465, lng: -1.0232 } },
    { name: "Greece", code: "GR", coords: { lat: 39.0742, lng: 21.8243 } },
    { name: "Grenada", code: "GD", coords: { lat: 12.1165, lng: -61.6790 } },
    { name: "Guatemala", code: "GT", coords: { lat: 15.7835, lng: -90.2308 } },
    { name: "Guinea", code: "GN", coords: { lat: 9.9456, lng: -9.6966 } },
    { name: "Guinea-Bissau", code: "GW", coords: { lat: 11.8037, lng: -15.1804 } },
    { name: "Guyana", code: "GY", coords: { lat: 4.8604, lng: -58.9302 } },
    { name: "Haiti", code: "HT", coords: { lat: 18.9712, lng: -72.2852 } },
    { name: "Honduras", code: "HN", coords: { lat: 15.2000, lng: -86.2419 } },
    { name: "Hungary", code: "HU", coords: { lat: 47.1625, lng: 19.5033 } },
    { name: "Iceland", code: "IS", coords: { lat: 64.9631, lng: -19.0208 } },
    { name: "India", code: "IN", coords: { lat: 20.5937, lng: 78.9629 } },
    { name: "Indonesia", code: "ID", coords: { lat: -0.7893, lng: 113.9213 } },
    { name: "Iran", code: "IR", coords: { lat: 32.4279, lng: 53.6880 } },
    { name: "Iraq", code: "IQ", coords: { lat: 33.2232, lng: 43.6793 } },
    { name: "Ireland", code: "IE", coords: { lat: 53.4129, lng: -8.2439 } },
    { name: "Israel", code: "IL", coords: { lat: 31.0461, lng: 34.8516 } },
    { name: "Italy", code: "IT", coords: { lat: 41.8719, lng: 12.5674 } },
    { name: "Ivory Coast", code: "CI", coords: { lat: 7.5400, lng: -5.5471 } },
    { name: "Jamaica", code: "JM", coords: { lat: 18.1096, lng: -77.2975 } },
    { name: "Japan", code: "JP", coords: { lat: 36.2048, lng: 138.2529 } },
    { name: "Jordan", code: "JO", coords: { lat: 30.5852, lng: 36.2384 } },
    { name: "Kazakhstan", code: "KZ", coords: { lat: 48.0196, lng: 66.9237 } },
    { name: "Kenya", code: "KE", coords: { lat: -0.0236, lng: 37.9062 } },
    { name: "Kiribati", code: "KI", coords: { lat: -3.3704, lng: -168.7340 } },
    { name: "Kuwait", code: "KW", coords: { lat: 29.3117, lng: 47.4818 } },
    { name: "Kyrgyzstan", code: "KG", coords: { lat: 41.2044, lng: 74.7661 } },
    { name: "Laos", code: "LA", coords: { lat: 19.8563, lng: 102.4955 } },
    { name: "Latvia", code: "LV", coords: { lat: 56.8796, lng: 24.6032 } },
    { name: "Lebanon", code: "LB", coords: { lat: 33.8547, lng: 35.8623 } },
    { name: "Lesotho", code: "LS", coords: { lat: -29.6100, lng: 28.2336 } },
    { name: "Liberia", code: "LR", coords: { lat: 6.4281, lng: -9.4295 } },
    { name: "Libya", code: "LY", coords: { lat: 26.3351, lng: 17.2283 } },
    { name: "Liechtenstein", code: "LI", coords: { lat: 47.1660, lng: 9.5554 } },
    { name: "Lithuania", code: "LT", coords: { lat: 55.1694, lng: 23.8813 } },
    { name: "Luxembourg", code: "LU", coords: { lat: 49.8153, lng: 6.1296 } },
    { name: "Madagascar", code: "MG", coords: { lat: -18.7669, lng: 46.8691 } },
    { name: "Malawi", code: "MW", coords: { lat: -13.2543, lng: 34.3015 } },
    { name: "Malaysia", code: "MY", coords: { lat: 4.2105, lng: 101.9758 } },
    { name: "Maldives", code: "MV", coords: { lat: 3.2028, lng: 73.2207 } },
    { name: "Mali", code: "ML", coords: { lat: 17.5707, lng: -3.9962 } },
    { name: "Malta", code: "MT", coords: { lat: 35.9375, lng: 14.3754 } },
    { name: "Marshall Islands", code: "MH", coords: { lat: 7.1315, lng: 171.1845 } },
    { name: "Mauritania", code: "MR", coords: { lat: 21.0079, lng: -10.9408 } },
    { name: "Mauritius", code: "MU", coords: { lat: -20.3484, lng: 57.5522 } },
    { name: "Mexico", code: "MX", coords: { lat: 23.6345, lng: -102.5528 } },
    { name: "Micronesia", code: "FM", coords: { lat: 7.4256, lng: 150.5508 } },
    { name: "Moldova", code: "MD", coords: { lat: 47.4116, lng: 28.3699 } },
    { name: "Monaco", code: "MC", coords: { lat: 43.7384, lng: 7.4246 } },
    { name: "Mongolia", code: "MN", coords: { lat: 46.8625, lng: 103.8467 } },
    { name: "Montenegro", code: "ME", coords: { lat: 42.7087, lng: 19.3744 } },
    { name: "Morocco", code: "MA", coords: { lat: 31.7917, lng: -7.0926 } },
    { name: "Mozambique", code: "MZ", coords: { lat: -18.6657, lng: 35.5296 } },
    { name: "Myanmar", code: "MM", coords: { lat: 21.9162, lng: 95.9560 } },
    { name: "Namibia", code: "NA", coords: { lat: -22.9576, lng: 18.4904 } },
    { name: "Nauru", code: "NR", coords: { lat: -0.5228, lng: 166.9315 } },
    { name: "Nepal", code: "NP", coords: { lat: 28.3949, lng: 84.1240 } },
    { name: "Netherlands", code: "NL", coords: { lat: 52.1326, lng: 5.2913 } },
    { name: "New Zealand", code: "NZ", coords: { lat: -40.9006, lng: 174.8860 } },
    { name: "Nicaragua", code: "NI", coords: { lat: 12.8654, lng: -85.2072 } },
    { name: "Niger", code: "NE", coords: { lat: 17.6078, lng: 8.0817 } },
    { name: "Nigeria", code: "NG", coords: { lat: 9.0820, lng: 8.6753 } },
    { name: "North Korea", code: "KP", coords: { lat: 40.3399, lng: 127.5101 } },
    { name: "North Macedonia", code: "MK", coords: { lat: 41.6086, lng: 21.7453 } },
    { name: "Norway", code: "NO", coords: { lat: 60.4720, lng: 8.4689 } },
    { name: "Oman", code: "OM", coords: { lat: 21.4735, lng: 55.9754 } },
    { name: "Pakistan", code: "PK", coords: { lat: 30.3753, lng: 69.3451 } },
    { name: "Palau", code: "PW", coords: { lat: 7.5150, lng: 134.5825 } },
    { name: "Palestine", code: "PS", coords: { lat: 31.9522, lng: 35.2332 } },
    { name: "Panama", code: "PA", coords: { lat: 8.5380, lng: -80.7821 } },
    { name: "Papua New Guinea", code: "PG", coords: { lat: -6.3150, lng: 143.9555 } },
    { name: "Paraguay", code: "PY", coords: { lat: -23.4425, lng: -58.4438 } },
    { name: "Peru", code: "PE", coords: { lat: -9.1900, lng: -75.0152 } },
    { name: "Philippines", code: "PH", coords: { lat: 12.8797, lng: 121.7740 } },
    { name: "Poland", code: "PL", coords: { lat: 51.9194, lng: 19.1451 } },
    { name: "Portugal", code: "PT", coords: { lat: 39.3999, lng: -8.2245 } },
    { name: "Qatar", code: "QA", coords: { lat: 25.3548, lng: 51.1839 } },
    { name: "Romania", code: "RO", coords: { lat: 45.9432, lng: 24.9668 } },
    { name: "Russia", code: "RU", coords: { lat: 61.5240, lng: 105.3188 } },
    { name: "Rwanda", code: "RW", coords: { lat: -1.9403, lng: 29.8739 } },
    { name: "Saint Kitts and Nevis", code: "KN", coords: { lat: 17.3578, lng: -62.7830 } },
    { name: "Saint Lucia", code: "LC", coords: { lat: 13.9094, lng: -60.9789 } },
    { name: "Saint Vincent and the Grenadines", code: "VC", coords: { lat: 12.9843, lng: -61.2872 } },
    { name: "Samoa", code: "WS", coords: { lat: -13.7590, lng: -172.1046 } },
    { name: "San Marino", code: "SM", coords: { lat: 43.9424, lng: 12.4578 } },
    { name: "Sao Tome and Principe", code: "ST", coords: { lat: 0.1864, lng: 6.6131 } },
    { name: "Saudi Arabia", code: "SA", coords: { lat: 23.8859, lng: 45.0792 } },
    { name: "Senegal", code: "SN", coords: { lat: 14.4974, lng: -14.4524 } },
    { name: "Serbia", code: "RS", coords: { lat: 44.0165, lng: 21.0059 } },
    { name: "Seychelles", code: "SC", coords: { lat: -4.6796, lng: 55.4920 } },
    { name: "Sierra Leone", code: "SL", coords: { lat: 8.4606, lng: -11.7799 } },
    { name: "Singapore", code: "SG", coords: { lat: 1.3521, lng: 103.8198 } },
    { name: "Slovakia", code: "SK", coords: { lat: 48.6690, lng: 19.6990 } },
    { name: "Slovenia", code: "SI", coords: { lat: 46.1512, lng: 14.9955 } },
    { name: "Solomon Islands", code: "SB", coords: { lat: -9.6457, lng: 160.1562 } },
    { name: "Somalia", code: "SO", coords: { lat: 5.1521, lng: 46.1996 } },
    { name: "South Africa", code: "ZA", coords: { lat: -30.5595, lng: 22.9375 } },
    { name: "South Korea", code: "KR", coords: { lat: 35.9078, lng: 127.7669 } },
    { name: "South Sudan", code: "SS", coords: { lat: 6.8770, lng: 31.3070 } },
    { name: "Spain", code: "ES", coords: { lat: 40.4637, lng: -3.7492 } },
    { name: "Sri Lanka", code: "LK", coords: { lat: 7.8731, lng: 80.7718 } },
    { name: "Sudan", code: "SD", coords: { lat: 12.8628, lng: 30.2176 } },
    { name: "Suriname", code: "SR", coords: { lat: 3.9193, lng: -56.0278 } },
    { name: "Sweden", code: "SE", coords: { lat: 60.1282, lng: 18.6435 } },
    { name: "Switzerland", code: "CH", coords: { lat: 46.8182, lng: 8.2275 } },
    { name: "Syria", code: "SY", coords: { lat: 34.8021, lng: 38.9968 } },
    { name: "Taiwan", code: "TW", coords: { lat: 23.6978, lng: 120.9605 } },
    { name: "Tajikistan", code: "TJ", coords: { lat: 38.8610, lng: 71.2761 } },
    { name: "Tanzania", code: "TZ", coords: { lat: -6.3690, lng: 34.8888 } },
    { name: "Thailand", code: "TH", coords: { lat: 15.8700, lng: 100.9925 } },
    { name: "Timor-Leste", code: "TL", coords: { lat: -8.8742, lng: 125.7275 } },
    { name: "Togo", code: "TG", coords: { lat: 8.6195, lng: 0.8248 } },
    { name: "Tonga", code: "TO", coords: { lat: -21.1789, lng: -175.1982 } },
    { name: "Trinidad and Tobago", code: "TT", coords: { lat: 10.6918, lng: -61.2225 } },
    { name: "Tunisia", code: "TN", coords: { lat: 33.8869, lng: 9.5375 } },
    { name: "Turkey", code: "TR", coords: { lat: 38.9637, lng: 35.2433 } },
    { name: "Turkmenistan", code: "TM", coords: { lat: 38.9697, lng: 59.5563 } },
    { name: "Tuvalu", code: "TV", coords: { lat: -7.1095, lng: 177.6493 } },
    { name: "Uganda", code: "UG", coords: { lat: 1.3733, lng: 32.2903 } },
    { name: "Ukraine", code: "UA", coords: { lat: 48.3794, lng: 31.1656 } },
    { name: "United Arab Emirates", code: "AE", coords: { lat: 23.4241, lng: 53.8478 }, aliases: ["UAE"] },
    { name: "United Kingdom", code: "GB", coords: { lat: 55.3781, lng: -3.4360 }, aliases: ["UK", "Britain", "England"] },
    { name: "United States", code: "US", coords: { lat: 39.8283, lng: -98.5795 }, aliases: ["USA", "America"] },
    { name: "Uruguay", code: "UY", coords: { lat: -32.5228, lng: -55.7658 } },
    { name: "Uzbekistan", code: "UZ", coords: { lat: 41.3775, lng: 64.5853 } },
    { name: "Vanuatu", code: "VU", coords: { lat: -15.3767, lng: 166.9592 } },
    { name: "Vatican City", code: "VA", coords: { lat: 41.9029, lng: 12.4534 } },
    { name: "Venezuela", code: "VE", coords: { lat: 6.4238, lng: -66.5897 } },
    { name: "Vietnam", code: "VN", coords: { lat: 14.0583, lng: 108.2772 } },
    { name: "Yemen", code: "YE", coords: { lat: 15.5527, lng: 48.5164 } },
    { name: "Zambia", code: "ZM", coords: { lat: -13.1339, lng: 27.8493 } },
    { name: "Zimbabwe", code: "ZW", coords: { lat: -19.0154, lng: 29.1549 } }
  ]
};

// Helper functions for searching locations
export function searchCountries(query: string): Country[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  return LOCATION_DATA.countries.filter(country => {
    const nameMatch = country.name.toLowerCase().includes(normalizedQuery);
    const codeMatch = country.code.toLowerCase().includes(normalizedQuery);
    const aliasMatch = country.aliases?.some(alias => 
      alias.toLowerCase().includes(normalizedQuery)
    );
    
    return nameMatch || codeMatch || aliasMatch;
  });
}

export function getCountryByName(name: string): Country | undefined {
  const normalizedName = name.toLowerCase().trim();
  
  return LOCATION_DATA.countries.find(country => {
    const nameMatch = country.name.toLowerCase() === normalizedName;
    const aliasMatch = country.aliases?.some(alias => 
      alias.toLowerCase() === normalizedName
    );
    
    return nameMatch || aliasMatch;
  });
}

export function getCountryByCode(code: string): Country | undefined {
  return LOCATION_DATA.countries.find(country => 
    country.code.toLowerCase() === code.toLowerCase()
  );
}

// Legacy compatibility - simplified search function
export function searchLocations(query: string): Array<{
  type: 'country';
  country: string;
  coords: { lat: number; lng: number };
}> {
  const countries = searchCountries(query);
  
  return countries.map(country => ({
    type: 'country' as const,
    country: country.name,
    coords: country.coords
  }));
}