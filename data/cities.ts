// Major cities worldwide for prayer times pages
// Focusing on cities with significant Muslim populations and high search volumes
export const cities = [
  // Middle East
  { name: "Mecca", country: "Saudi Arabia", slug: "mecca", countrySlug: "saudi-arabia", lat: 21.4225, lng: 39.8262 },
  { name: "Medina", country: "Saudi Arabia", slug: "medina", countrySlug: "saudi-arabia", lat: 24.4686, lng: 39.6142 },
  { name: "Riyadh", country: "Saudi Arabia", slug: "riyadh", countrySlug: "saudi-arabia", lat: 24.7136, lng: 46.6753 },
  { name: "Jeddah", country: "Saudi Arabia", slug: "jeddah", countrySlug: "saudi-arabia", lat: 21.5428, lng: 39.1972 },
  { name: "Dubai", country: "UAE", slug: "dubai", countrySlug: "uae", lat: 25.2048, lng: 55.2708 },
  { name: "Abu Dhabi", country: "UAE", slug: "abu-dhabi", countrySlug: "uae", lat: 24.2532, lng: 54.3665 },
  { name: "Doha", country: "Qatar", slug: "doha", countrySlug: "qatar", lat: 25.2854, lng: 51.5310 },
  { name: "Kuwait City", country: "Kuwait", slug: "kuwait-city", countrySlug: "kuwait", lat: 29.3117, lng: 47.4818 },
  { name: "Cairo", country: "Egypt", slug: "cairo", countrySlug: "egypt", lat: 30.0444, lng: 31.2357 },
  { name: "Istanbul", country: "Turkey", slug: "istanbul", countrySlug: "turkey", lat: 41.0082, lng: 28.9784 },
  { name: "Ankara", country: "Turkey", slug: "ankara", countrySlug: "turkey", lat: 39.9334, lng: 32.8597 },
  { name: "Tehran", country: "Iran", slug: "tehran", countrySlug: "iran", lat: 35.6892, lng: 51.3890 },
  { name: "Baghdad", country: "Iraq", slug: "baghdad", countrySlug: "iraq", lat: 33.3152, lng: 44.3661 },
  { name: "Damascus", country: "Syria", slug: "damascus", countrySlug: "syria", lat: 33.5138, lng: 36.2765 },
  { name: "Amman", country: "Jordan", slug: "amman", countrySlug: "jordan", lat: 31.9454, lng: 35.9284 },
  { name: "Beirut", country: "Lebanon", slug: "beirut", countrySlug: "lebanon", lat: 33.8938, lng: 35.5018 },

  // South Asia
  { name: "Karachi", country: "Pakistan", slug: "karachi", countrySlug: "pakistan", lat: 24.8607, lng: 67.0011 },
  { name: "Lahore", country: "Pakistan", slug: "lahore", countrySlug: "pakistan", lat: 31.5804, lng: 74.3587 },
  { name: "Islamabad", country: "Pakistan", slug: "islamabad", countrySlug: "pakistan", lat: 33.7294, lng: 73.0931 },
  { name: "Dhaka", country: "Bangladesh", slug: "dhaka", countrySlug: "bangladesh", lat: 23.8103, lng: 90.4125 },
  { name: "Delhi", country: "India", slug: "delhi", countrySlug: "india", lat: 28.7041, lng: 77.1025 },
  { name: "Mumbai", country: "India", slug: "mumbai", countrySlug: "india", lat: 19.0760, lng: 72.8777 },
  { name: "Hyderabad", country: "India", slug: "hyderabad", countrySlug: "india", lat: 17.3850, lng: 78.4867 },
  { name: "Lucknow", country: "India", slug: "lucknow", countrySlug: "india", lat: 26.8467, lng: 80.9462 },

  // Southeast Asia
  { name: "Jakarta", country: "Indonesia", slug: "jakarta", countrySlug: "indonesia", lat: -6.2088, lng: 106.8456 },
  { name: "Kuala Lumpur", country: "Malaysia", slug: "kuala-lumpur", countrySlug: "malaysia", lat: 3.1390, lng: 101.6869 },
  { name: "Bandung", country: "Indonesia", slug: "bandung", countrySlug: "indonesia", lat: -6.9175, lng: 107.6191 },
  { name: "Surabaya", country: "Indonesia", slug: "surabaya", countrySlug: "indonesia", lat: -7.2575, lng: 112.7521 },

  // North America
  { name: "New York", country: "USA", slug: "new-york", countrySlug: "usa", lat: 40.7128, lng: -74.0060 },
  { name: "Los Angeles", country: "USA", slug: "los-angeles", countrySlug: "usa", lat: 34.0522, lng: -118.2437 },
  { name: "Chicago", country: "USA", slug: "chicago", countrySlug: "usa", lat: 41.8781, lng: -87.6298 },
  { name: "Houston", country: "USA", slug: "houston", countrySlug: "usa", lat: 29.7604, lng: -95.3698 },
  { name: "Detroit", country: "USA", slug: "detroit", countrySlug: "usa", lat: 42.3314, lng: -83.0458 },
  { name: "Washington DC", country: "USA", slug: "washington-dc", countrySlug: "usa", lat: 38.9072, lng: -77.0369 },
  { name: "Toronto", country: "Canada", slug: "toronto", countrySlug: "canada", lat: 43.6532, lng: -79.3832 },
  { name: "Montreal", country: "Canada", slug: "montreal", countrySlug: "canada", lat: 45.5017, lng: -73.5673 },
  { name: "Vancouver", country: "Canada", slug: "vancouver", countrySlug: "canada", lat: 49.2827, lng: -123.1207 },

  // Europe
  { name: "London", country: "UK", slug: "london", countrySlug: "uk", lat: 51.5074, lng: -0.1278 },
  { name: "Birmingham", country: "UK", slug: "birmingham", countrySlug: "uk", lat: 52.4862, lng: -1.8904 },
  { name: "Manchester", country: "UK", slug: "manchester", countrySlug: "uk", lat: 53.4808, lng: -2.2426 },
  { name: "Paris", country: "France", slug: "paris", countrySlug: "france", lat: 48.8566, lng: 2.3522 },
  { name: "Berlin", country: "Germany", slug: "berlin", countrySlug: "germany", lat: 52.5200, lng: 13.4050 },
  { name: "Amsterdam", country: "Netherlands", slug: "amsterdam", countrySlug: "netherlands", lat: 52.3676, lng: 4.9041 },
  { name: "Brussels", country: "Belgium", slug: "brussels", countrySlug: "belgium", lat: 50.8503, lng: 4.3517 },
  { name: "Stockholm", country: "Sweden", slug: "stockholm", countrySlug: "sweden", lat: 59.3293, lng: 18.0686 },
  { name: "Oslo", country: "Norway", slug: "oslo", countrySlug: "norway", lat: 59.9139, lng: 10.7522 },

  // Australia & Oceania
  { name: "Sydney", country: "Australia", slug: "sydney", countrySlug: "australia", lat: -33.8688, lng: 151.2093 },
  { name: "Melbourne", country: "Australia", slug: "melbourne", countrySlug: "australia", lat: -37.8136, lng: 144.9631 },
  { name: "Perth", country: "Australia", slug: "perth", countrySlug: "australia", lat: -31.9505, lng: 115.8605 },

  // Africa
  { name: "Casablanca", country: "Morocco", slug: "casablanca", countrySlug: "morocco", lat: 33.5731, lng: -7.5898 },
  { name: "Tunis", country: "Tunisia", slug: "tunis", countrySlug: "tunisia", lat: 36.8065, lng: 10.1815 },
  { name: "Algiers", country: "Algeria", slug: "algiers", countrySlug: "algeria", lat: 36.7538, lng: 3.0588 },
  { name: "Lagos", country: "Nigeria", slug: "lagos", countrySlug: "nigeria", lat: 6.5244, lng: 3.3792 },
  { name: "Kano", country: "Nigeria", slug: "kano", countrySlug: "nigeria", lat: 12.0022, lng: 8.5920 },

  // Central Asia
  { name: "Almaty", country: "Kazakhstan", slug: "almaty", countrySlug: "kazakhstan", lat: 43.2220, lng: 76.8512 },
  { name: "Tashkent", country: "Uzbekistan", slug: "tashkent", countrySlug: "uzbekistan", lat: 41.2995, lng: 69.2401 },
  { name: "Baku", country: "Azerbaijan", slug: "baku", countrySlug: "azerbaijan", lat: 40.4093, lng: 49.8671 },
];

// Helper function to get all country slugs
export const getCountrySlugs = () => {
  return Array.from(new Set(cities.map(city => city.countrySlug)));
};

// Helper function to get cities by country
export const getCitiesByCountry = (countrySlug: string) => {
  return cities.filter(city => city.countrySlug === countrySlug);
};

// Helper function to find city by slug
export const findCity = (countrySlug: string, citySlug: string) => {
  return cities.find(city => city.countrySlug === countrySlug && city.slug === citySlug);
};

// Popular search terms for different regions
export const popularSearchTerms = {
  'saudi-arabia': ['prayer times riyadh', 'salah times mecca', 'namaz times jeddah'],
  'uae': ['prayer times dubai', 'salah times abu dhabi', 'fajr time dubai'],
  'uk': ['prayer times london', 'salah times birmingham', 'namaz times manchester'],
  'usa': ['prayer times new york', 'salah times chicago', 'muslim prayer times los angeles'],
  'canada': ['prayer times toronto', 'salah times montreal', 'islamic prayer times vancouver'],
  'pakistan': ['prayer times karachi', 'namaz times lahore', 'salah times islamabad'],
  'india': ['prayer times delhi', 'namaz times mumbai', 'salah times hyderabad'],
  'indonesia': ['prayer times jakarta', 'jadwal sholat bandung', 'waktu sholat surabaya'],
  'malaysia': ['prayer times kuala lumpur', 'waktu solat kl'],
  'france': ['horaires priere paris', 'prayer times paris'],
  'germany': ['gebetszeiten berlin', 'prayer times berlin'],
  'australia': ['prayer times sydney', 'salah times melbourne'],
};