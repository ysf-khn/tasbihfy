import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface Dua {
  id: number;
  arabic: string;
  translation: string;
  transliteration: string;
  reference: string;
  hisnNumber: string;
}

interface Chapter {
  id: number;
  title: string;
  arabicTitle: string;
  duas: Dua[];
}

interface HisnulMuslim {
  source: string;
  title: string;
  extractedAt: string;
  totalChapters: number;
  totalDuas: number;
  chapters: Chapter[];
}

function parseHisnHtml(): HisnulMuslim {
  // Read the HTML file
  const htmlPath = join(process.cwd(), 'hisn.html');
  const html = readFileSync(htmlPath, 'utf-8');
  const $ = cheerio.load(html);

  const chapters: Chapter[] = [];
  let duaCounter = 0;

  // Extract chapter information
  $('.chapter').each((index, element) => {
    const chapterElement = $(element);
    
    const chapterNumber = parseInt(chapterElement.find('.echapno').text().replace(/[()]/g, '')) || index + 1;
    const englishTitle = chapterElement.find('.englishchapter').text().replace('Chapter: ', '').trim();
    const arabicTitle = chapterElement.find('.arabicchapter').text().trim();

    if (!englishTitle) return; // Skip if no title found

    const chapter: Chapter = {
      id: chapterNumber,
      title: englishTitle,
      arabicTitle: arabicTitle,
      duas: []
    };

    // Find all duas in this chapter (following hadith containers)
    let nextElement = chapterElement.next();
    
    while (nextElement.length > 0 && !nextElement.hasClass('chapter')) {
      if (nextElement.hasClass('actualHadithContainer')) {
        const duaContainer = nextElement;
        
        // Extract dua data
        const hisnNumber = duaContainer.find('.hadith_reference_sticky').text().trim();
        const transliteration = duaContainer.find('.transliteration').text().trim();
        const translation = duaContainer.find('.translation').text().trim();
        const arabicText = duaContainer.find('.arabic_text_details').text().trim();
        const reference = duaContainer.find('.hisn_english_reference').text().trim();

        if (arabicText && translation) {
          duaCounter++;
          const dua: Dua = {
            id: duaCounter,
            arabic: arabicText,
            translation: translation,
            transliteration: transliteration,
            reference: reference,
            hisnNumber: hisnNumber
          };
          
          chapter.duas.push(dua);
        }
      }
      
      nextElement = nextElement.next();
    }

    if (chapter.duas.length > 0) {
      chapters.push(chapter);
    }
  });

  const result: HisnulMuslim = {
    source: 'https://sunnah.com/hisn',
    title: 'Hisnul Muslim - Fortress of the Muslim',
    extractedAt: new Date().toISOString().split('T')[0],
    totalChapters: chapters.length,
    totalDuas: duaCounter,
    chapters: chapters
  };

  return result;
}

function main() {
  try {
    console.log('Parsing Hisnul Muslim HTML file...');
    const data = parseHisnHtml();
    
    console.log(`Extracted ${data.totalChapters} chapters and ${data.totalDuas} duas`);
    
    // Write to JSON file
    const outputPath = join(process.cwd(), 'data', 'hisnul-muslim-complete.json');
    writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`JSON file created at: ${outputPath}`);
    console.log('Sample chapters:', data.chapters.slice(0, 3).map(c => `${c.id}. ${c.title} (${c.duas.length} duas)`));
    
  } catch (error) {
    console.error('Error parsing HTML:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { parseHisnHtml, type HisnulMuslim, type Chapter, type Dua };