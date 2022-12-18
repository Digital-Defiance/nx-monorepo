import StorageOption from './storageOption';
import MessageContext from './messageContext';
import MessageType from './messageType';
import PreferredVoiceGender from './preferredVoiceGender';
import SpeechSources from './speechSources';
import WordMastery from './wordMastery';
import UrlFilterMethod from './urlFilterMethod';

export interface WordMasteryStatus {
  word: string;
  language: string;
  status: WordMastery;
  color: CSSStyleDeclaration['color'];
}

/**
 * Each word will be highlighted with a color depending on its mastery status.
 * Ideally these will have an alpha transparency
 */
export const DefaultWordMasteryColors: Record<WordMastery, string> = {
  [WordMastery.Unrecognized]: '#F08080', // red (light coral)
  [WordMastery.Unfamiliar]: '#FFFACD', // yellow (lemonchiffon)
  [WordMastery.Practice]: '#FFA500', // orange
  [WordMastery.Familiar]: '#90EE90', // light green
  [WordMastery.Mastered]: '#FFFFFF', // white/page background
};

export interface PageLanguageDetectionResult {
  page: string;
  selection: WordMasteryStatus;
}

/**
 * Settings stored in synced storage for the application
 */
export interface ISettings {
  wordMasteryColors: Record<WordMastery, string>;
  lingvoApiKey: string;
  lingvoApiEnabled: boolean;
  forvoApiKey: string;
  forvoApiEnabled: boolean;
  googleApiKey: string;
  googleApiEnabled: boolean;
  /**
   * The iso 639-2 language code of the primary langauge of the speaker, which studied words will be translated to and from.
   * e.g. 'uk' for Ukrainian
   */
  primaryLanguage: string;
  /**
   * The primary language for forvo and speech synthesis
   * e.g. 'en-US' for American English
   */
  primaryLocale: string;
  preferredVoiceGender: PreferredVoiceGender;
  storeAudio: StorageOption;
  /**
   * Languages being studied to use for translation, in order of preference/likelihood, not including your primary language.
   * iso369-2 codes
   */
  studiedLanguages: string[];
  /**
   * Supported speech sources, in order of preference.
   */
  speechSources: SpeechSources[];
}

/**
 * Settings stored in browser local storage only (not global sync)
 */
export interface ILocalSettings {
  filterMethod: UrlFilterMethod;
  includedSites: string[];
  excludedSites: string[];
  extensionEnabled: boolean;
}

export interface IChromeMessage {
  type: MessageType;
  context: MessageContext;
  data: any;
}
