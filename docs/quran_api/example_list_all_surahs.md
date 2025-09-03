const axios = require('axios');

async function getChapters(accessToken, clientId) {
  try {
    const response = await axios({
      method: 'get',
      url: 'https://apis-prelive.quran.foundation/content/api/v4/chapters',
      headers: {
        'x-auth-token': accessToken,
        'x-client-id': clientId
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching chapters:', error);
  }
}

response

{
  "chapters": [
    {
      "id": 1,
      "revelation_place": "makka",
      "revelation_order": 5,
      "bismillah_pre": false,
      "name_simple": "Al-Fatihah",
      "name_complex": "Al-Fatihah",
      "name_arabic": "ٱلْفَاتِحَةُ",
      "verses_count": 7,
      "pages": [1, 1],
      "translated_name": {
        "language_name": "english",
        "name": "The Opener"
      }
    },
    {
      "id": 2,
      "revelation_place": "madinah",
      "revelation_order": 87,
      "bismillah_pre": true,
      "name_simple": "Al-Baqarah",
      "name_complex": "Al-Baqarah",
      "name_arabic": "ٱلْبَقَرَةُ",
      "verses_count": 286,
      "pages": [2, 49],
      "translated_name": {
        "language_name": "english",
        "name": "The Cow"
      }
    }
    // ... more chapters
  ]
}