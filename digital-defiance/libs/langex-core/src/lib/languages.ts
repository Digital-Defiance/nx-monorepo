import { isValid } from 'all-iso-language-codes';
import { WordMasteryStatus } from './interfaces';

export function languageSupported(language: string): boolean {
  const result = isValid(language);
  if (typeof result === 'boolean') {
    return result;
  } else if (typeof result === 'object') {
    return result.found;
  } else {
    return false;
  }
}

/**
 * Detects the language. "text" can be a string for detecting the language of
 * a single piece of text, or an array of strings for detecting the languages
 * of multiple texts.
 * @param text The text or texts to detect a language for.
 * @returns
 */
export async function detectLanguage_idea(
  text: string | string[],
  /**
   * if an array of strings is passed in and are predominately one language then indeterminate results will be swayed towards the mean language
   */
  swayByMean: boolean = false
): Promise<Record<string, WordMasteryStatus>> {
  throw new Error('Method not implemented.');
  // // try google translate
  // const googleTranslate = new GoogleTranslate();
  // const googleDetections = await googleTranslate.detectLanguage(text);
  // // try lingvo, etc
  // const detections: Record<string, string> = {};
  // const wordCounts: Record<string, number> = {};
  // googleDetections.forEach((detection) => {
  //   detections[detection.input] = detection.language;
  //   if (wordCounts[detection.language]) {
  //       wordCounts[detection.language] += 1;
  //   } else {
  //       wordCounts[detection.language] = 1;
  //   }
  // });
  // if (swayByMean) {
  //   // determine the language with the largest number of words
  //       let maxCount = 0;
  //       let maxLanguage = '';
  //       Object.keys(wordCounts).forEach((language) => {
  //           if (wordCounts[language] > maxCount) {
  //               maxCount = wordCounts[language];
  //               maxLanguage = language;
  //           }
  //       });
  //       // go through the detections and look for indeterminate results
  //       googleDetections.forEach((detection) => {
  //           if (detection.language === 'und') {
  //               //
  //           }
  //       });
  //   }
  // return detections;
}

/**
 * Detects the language. "text" can be a string for detecting the language of
 * a single piece of text, or an array of strings for detecting the languages
 * of multiple texts.
 * @param inputText The text or texts to detect a language for.
 * @returns
 */
export function detectLanguage2(
  inputText: string
): chrome.i18n.DetectedLanguage[] {
  const langList: chrome.i18n.DetectedLanguage[] = [];
  chrome.i18n.detectLanguage(inputText, function (result) {
    for (let i = 0; i < result.languages.length; i++) {
      langList.push(result.languages[i]);
    }
  });
  return langList;
}

export function bestGuessSourceLanguage(
  currentLanguage: string,
  studiedLanguages: string[],
  text: string
) {
  let source = currentLanguage;
  const sourceLanguages = detectLanguage2(text);
  /*
  [
    {
        "language": "be",
        "percentage": 48
    },
    {
        "language": "uk",
        "percentage": 44
    },
    {
        "language": "sl",
        "percentage": 6
    }
  ]
  */
  /* in this case, we are studying ukrainian which is the second choice at 44% and the belarussian detection is wrong.
   * although in this case looking through the studied languages list and seeing ukraine there and using that would help,
   * there may be cases where the selected text is in fact a different language than the one we are studying but
   * included in the detection
   */
  if (sourceLanguages && sourceLanguages.length > 0) {
    // for now just use the first studied language, and if none then the first
    const studiedDetections: string[] = [];
    for (let i = 0; i < sourceLanguages.length; i++) {
      // check against the studied languages list
      if (studiedLanguages.includes(sourceLanguages[i].language)) {
        studiedDetections.push(sourceLanguages[i].language);
      }
    }
    if (studiedDetections.length > 0) {
      source = studiedDetections[0];
    } else {
      source = sourceLanguages[0].language;
    }
  }
  return source;
}

// detect by div, span, p, etc?
// break page into hunks, detect language of each hunk, then determine language of page by majority vote?
