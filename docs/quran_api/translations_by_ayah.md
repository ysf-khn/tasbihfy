const axios = require('axios');

let config = {
  method: 'get',
maxBodyLength: Infinity,
  url: 'https://apis-prelive.quran.foundation/content/api/v4/translations/:resource_id/by_ayah/:ayah_key',
  headers: { 
    'Accept': 'application/json', 
    'x-auth-token': '6NOtX8cNdg0avtQdt482EQoYUJmQOsuV.yqJ3CHT14Vv6TnEWqhlH9Yam0CvlcDhe1u41jKGlnoc%3D', 
    'x-client-id': 'c157a0a5-4a4d-4b67-8f2e-8b821b331860'
  }
};

axios(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});

Ayah key is combination of surah number and ayah number. e.g 1:1 will be first Ayah of first Surah


response

{
  "translations": [
    {
      "resource_id": 131,
      "resource_name": "Dr. Mustafa Khattab, the Clear Quran",
      "id": 903958,
      "text": "In the Name of Allah—the Most Compassionate, Most Merciful.",
      "verse_id": 1,
      "language_id": 38,
      "language_name": "english",
      "verse_key": "1:1",
      "chapter_id": 1,
      "verse_number": 1,
      "juz_number": 1,
      "hizb_number": 1,
      "rub_number": 1,
      "page_number": 1
    }
  ]
}