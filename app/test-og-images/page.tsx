export default function TestOGImages() {
  const ogImages = [
    { title: "Verse OG - Al-Fatihah", url: "/api/og/verse?surah=1&verse=1" },
    { title: "Verse OG - Ayat al-Kursi", url: "/api/og/verse?surah=2&verse=255" },
    { title: "99 Names General", url: "/api/og/99-names" },
    { title: "99 Names - Ar-Rahman", url: "/api/og/99-names/ar-rahman" },
    { title: "99 Names - Ar-Rahim", url: "/api/og/99-names/ar-rahim" },
    { title: "Prayer Times - London", url: "/api/og/prayer-times?location=London" },
    { title: "Prayer Times - New York", url: "/api/og/prayer-times?location=New York" },
  ];

  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">OG Image Test Page</h1>

        <div className="grid gap-8">
          {ogImages.map((og, index) => (
            <div key={index} className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-4">{og.title}</h2>
                <p className="text-sm text-base-content/60 mb-4">URL: {og.url}</p>

                {/* Display the OG image */}
                <div className="border-2 border-base-300 rounded-lg overflow-hidden">
                  <img
                    src={og.url}
                    alt={og.title}
                    className="w-full"
                    style={{ maxWidth: '1200px', height: 'auto' }}
                  />
                </div>

                <div className="mt-4">
                  <a
                    href={og.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                  >
                    Open in New Tab
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}