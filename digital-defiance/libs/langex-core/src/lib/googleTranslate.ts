//import * as $ from 'jquery';
import { bestGuessSourceLanguage } from './languages';
import { translate as apiTranslate } from '@vitalets/google-translate-api';
import { TranslateOptions } from '@vitalets/google-translate-api/dist/cjs/types';

export function makeTranslateLink(
  text: string,
  source: string,
  target: string
): string {
  const encoded = encodeURIComponent(text);
  return `https://translate.google.com/?op=translate&sl=${source}&tl=${target}&text=${encoded}`;
}

export async function googleTranslateApiLookup(
  text: string,
  target: string,
  source?: string
): Promise<string> {
  const queryObject: TranslateOptions =
    source === undefined ? { to: target } : { to: target, from: source };
  const { text: result } = await apiTranslate(text, queryObject);
  console.log(result);
  return result;
}

/**
// function that handles selection search
 * @param info 
 * @param tab 
 */
export function googleTranslateBrowserTabLookup(
  currentLanguage: string,
  studiedLanguages: string[],
  info: chrome.contextMenus.OnClickData,
  tab: chrome.tabs.Tab | undefined
) {
  console.log(info, tab);
  const source = bestGuessSourceLanguage(
    currentLanguage,
    studiedLanguages,
    info.selectionText || ''
  );
  const target = currentLanguage;
  chrome.tabs.create({
    url: makeTranslateLink(info.selectionText || '', source, target),
  });
}
