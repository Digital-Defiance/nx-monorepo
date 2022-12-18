import AppSettings from './appSettings';
import MessageContext from './messageContext';
import SpeechSources from './speechSources';
import WordMastery from './wordMastery';
import { WordMasteryStatus } from './interfaces';
import { LocalSettings } from './localSettings';
import { loadExtraData, removeExtraData, saveExtraData } from './chromeStorage';
import UrlFilterMethod from './urlFilterMethod';

/**
 * Use browser/chrome storage to store settings
 */
export class SettingsManager {
  public static readonly settingsKey = 'settings';
  public static readonly learnedWordKey = 'learnedWords';
  public static readonly studiedLanguagesKey = 'studiedLanguages';
  public readonly context: MessageContext;
  private readonly _globalSettings: AppSettings;
  private readonly _localSettings: LocalSettings;
  private readonly _uiLanguage: string;

  constructor(
    context: MessageContext,
    primaryLanguage = 'en',
    primaryLocale = 'en-US',
    defaultStudiedLanguages: string[] = ['uk', 'ru'],
    defaultSpeechSources: SpeechSources[] = [SpeechSources.WebSpeechAPI]
  ) {
    this._uiLanguage = chrome.i18n.getUILanguage();
    //this.browserAcceptLanguages = chrome.i18n.getAcceptLanguages();
    this.context = context;
    this._globalSettings = new AppSettings(
      primaryLanguage,
      primaryLocale,
      defaultStudiedLanguages,
      defaultSpeechSources
    );
    this._localSettings = new LocalSettings(UrlFilterMethod.Blacklist, [], [], true);
    console.log(
      `settingsManager loaded in ${context}`,
      this._globalSettings,
      this._localSettings
    );
  }

  public verifyHexColor(color: string): boolean {
    const colorRegex = /^#[0-9A-F]{6}$/i;
    return colorRegex.test(color);
  }

  public verifyColorName(color: string): boolean {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
  }

  private setGlobalSettingsFromOther(value: AppSettings): void {
    this._globalSettings.forvoApiKey = value.forvoApiKey;
    this._globalSettings.forvoApiEnabled = value.forvoApiEnabled;
    this._globalSettings.googleApiKey = value.googleApiKey;
    this._globalSettings.googleApiEnabled = value.googleApiEnabled;
    this._globalSettings.lingvoApiKey = value.lingvoApiKey;
    this._globalSettings.lingvoApiEnabled = value.lingvoApiEnabled;
    this._globalSettings.preferredVoiceGender = value.preferredVoiceGender;
    this._globalSettings.primaryLanguage = value.primaryLanguage;
    this._globalSettings.primaryLocale = value.primaryLocale;
    this._globalSettings.studiedLanguages = value.studiedLanguages;
    this._globalSettings.speechSources = value.speechSources;
    this._globalSettings.storeAudio = value.storeAudio;
    this._globalSettings.wordMasteryColors = value.wordMasteryColors;
  }

  public get Settings(): AppSettings {
    return this._globalSettings;
  }

  public set Settings(value: AppSettings) {
    this.setGlobalSettingsFromOther(value);
    this._globalSettings.save();
  }

  public setLocalSettingsFromOther(value: LocalSettings): void {
    this._localSettings.filterMethod = value.filterMethod;
    this._localSettings.extensionEnabled = value.extensionEnabled;
    this._localSettings.excludedSites = value.excludedSites;
    this._localSettings.includedSites = value.includedSites;
  }

  public get LocalSettings(): LocalSettings {
    return this._localSettings;
  }

  public set LocalSettings(value: LocalSettings) {
    this.setLocalSettingsFromOther(value);
    this._localSettings.save();
  }

  public get uiLanguage(): string {
    return this._uiLanguage;
  }

  public get studiedLanguages(): string[] {
    const languages: string[] = [];
    const extraData: string[] | null = loadExtraData<string[]>(
      SettingsManager.studiedLanguagesKey
    );
    if (extraData) {
      extraData.forEach((language) => {
        languages.push(language);
      });
    }
    return languages;
  }

  public studyLanguage(language: string): void {
    const studiedLanguages = this.studiedLanguages;
    if (!studiedLanguages.includes(language)) {
      studiedLanguages.push(language);
      saveExtraData(SettingsManager.studiedLanguagesKey, studiedLanguages);
    }
  }

  public studyingLanguage(language: string): boolean {
    return this.studiedLanguages.includes(language);
  }

  public updateWord(language: string, word: string, status: WordMastery): void {
    if (status === WordMastery.Unrecognized) {
      removeExtraData(SettingsManager.learnedWordKey, language, word);
      return;
    }
    saveExtraData(SettingsManager.learnedWordKey, status, language, word);
  }

  public lookupWordMastery(language: string, word: string): WordMastery {
    const learnedWord = loadExtraData<WordMastery>(
      SettingsManager.learnedWordKey,
      language,
      word
    );
    if (learnedWord !== null) {
      return learnedWord;
    }
    return WordMastery.Unrecognized;
  }

  public lookupWordMasteryForWords(
    language: string,
    words: string[]
  ): WordMastery[] {
    const masteredWords: WordMastery[] = [];
    words.forEach((word) => {
      masteredWords.push(this.lookupWordMastery(language, word));
    });
    return masteredWords;
  }

  public makeWordMasteryStatusMap(
    language: string,
    words: string[]
  ): Map<string, WordMasteryStatus> {
    // ensure word list is unique
    const uniqueWords = [...new Set(words)];
    const masteredWordMap = new Map<string, WordMasteryStatus>();
    uniqueWords.forEach((word, index) => {
      const mastery = this.lookupWordMastery(language, word);
      masteredWordMap.set(word, {
        word: word,
        language: language,
        status: mastery,
        color: this._globalSettings.wordMasteryColors[mastery],
      });
    });
    return masteredWordMap;
  }

  // async analyzePage(title: string, text: string): Promise<Record<string, WordLanguageAndStatus>> {
  //   const words = text.split(' ');
  //   const detections = await detectLanguage(words);
  //     const wordLanguageAndStatuses: Record<string, WordLanguageAndStatus> = {};
  //     words.forEach((word) => {
  //       wordLanguageAndStatuses[word] = {
  //         language: detections[word],
  //         status:
  //       };
  //     });
  //     return wordLanguageAndStatuses;
  //   }

  // public filterPageWordsByStudiedLanguages(pageWords: string[])
  // {
  //   const studiedLanguages = this.studiedLanguages;
  //   detectLanguage(pageWords).then((language: DetectionResult) => {
  //     if (language && studiedLanguages.includes(language)) {

  //   return pageWords.filter((word) => {
  //     return studiedLanguages.includes());
  //   });
  // }
}
