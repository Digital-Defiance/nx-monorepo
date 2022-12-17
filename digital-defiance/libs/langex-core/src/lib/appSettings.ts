import { DefaultWordMasteryColors, ISettings } from './interfaces';
import StorageOption from './storageOption';
import PreferredVoiceGender from './preferredVoiceGender';
import SpeechSources from './speechSources';
import WordMastery from './wordMastery';
import {
  getKeyIdentifier,
  storageGetKey,
  storageSetKey,
} from './chromeStorage';
import { SettingsManager } from './settingsManager';

/**
 * Settings stored in synced storage for the application
 */
export default class AppSettings implements ISettings {
  public lingvoApiKey: string;
  public lingvoApiEnabled: boolean;
  public forvoApiKey: string;
  public forvoApiEnabled: boolean;
  public googleApiKey: string;
  public googleApiEnabled: boolean;
  public preferredVoiceGender: PreferredVoiceGender;
  /**
   * The iso 639-2 language code of the primary langauge of the speaker, which studied words will be translated to and from.
   * e.g. 'uk' for Ukrainian
   */
  public primaryLanguage: string;
  /**
   * The primary language for forvo and speech synthesis
   * e.g. 'en-US' for American English
   */
  public primaryLocale: string;
  public storeAudio: StorageOption;
  /**
   * Languages being studied to use for translation, in order of preference/likelihood, not including your primary language.
   * iso369-2 codes
   */
  public studiedLanguages: string[];
  /**
   * Supported speech sources, in order of preference.
   */
  public speechSources: SpeechSources[];
  public wordMasteryColors: Record<WordMastery, string>;

  constructor(
    primaryLanguage = 'en',
    primaryLocale = 'en-US',
    defaultStudiedLanguages: string[] = ['uk', 'ru'],
    defaultSpeechSources: SpeechSources[] = [SpeechSources.WebSpeechAPI]
  ) {
    this.forvoApiEnabled =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'forvoApiEnabled'),
        StorageOption.SyncedStorage
      ) || false;
    this.forvoApiKey =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'forvoApiKey'),
        StorageOption.SyncedStorage
      ) || '';
    this.googleApiEnabled =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'googleApiEnabled'),
        StorageOption.SyncedStorage
      ) || false;
    this.googleApiKey =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'googleApiKey'),
        StorageOption.SyncedStorage
      ) || '';
    this.lingvoApiEnabled =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'lingvoApiEnabled'),
        StorageOption.SyncedStorage
      ) || false;
    this.lingvoApiKey =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'lingvoApiKey'),
        StorageOption.SyncedStorage
      ) || '';
    this.preferredVoiceGender =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'preferredVoiceGender'),
        StorageOption.SyncedStorage
      ) || PreferredVoiceGender.Either;
    this.primaryLanguage =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'primaryLanguage'),
        StorageOption.SyncedStorage
      ) || primaryLanguage;
    this.primaryLocale =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'primaryLocale'),
        StorageOption.SyncedStorage
      ) || primaryLocale;
    this.speechSources =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'speechSources'),
        StorageOption.SyncedStorage
      ) || defaultSpeechSources;
    this.storeAudio =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'storeAudio'),
        StorageOption.SyncedStorage
      ) || StorageOption.None;
    this.studiedLanguages =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'studiedLanguages'),
        StorageOption.SyncedStorage
      ) || defaultStudiedLanguages;
    this.wordMasteryColors =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'wordMasteryColors'),
        StorageOption.SyncedStorage
      ) || DefaultWordMasteryColors;
  }
  public save(): void {
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'forvoApiEnabled'),
      this.forvoApiEnabled,
      StorageOption.SyncedStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'forvoApiKey'),
      this.forvoApiKey,
      StorageOption.SyncedStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'googleApiEnabled'),
      this.googleApiEnabled,
      StorageOption.SyncedStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'googleApiKey'),
      this.googleApiKey,
      StorageOption.SyncedStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'lingvoApiEnabled'),
      this.lingvoApiEnabled,
      StorageOption.SyncedStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'lingvoApiKey'),
      this.lingvoApiKey,
      StorageOption.SyncedStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'preferredVoiceGender'),
      this.preferredVoiceGender,
      StorageOption.SyncedStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'primaryLanguage'),
      this.primaryLanguage,
      StorageOption.SyncedStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'primaryLocale'),
      this.primaryLocale,
      StorageOption.SyncedStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'storeAudio'),
      this.storeAudio,
      StorageOption.SyncedStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'studiedLanguages'),
      this.studiedLanguages,
      StorageOption.SyncedStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'speechSources'),
      this.speechSources,
      StorageOption.SyncedStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'wordMasteryColors'),
      this.wordMasteryColors,
      StorageOption.SyncedStorage
    );
  }

  public updateSetting(key: string, value: any, save = false): void {
    if (!Object.prototype.hasOwnProperty.call(this, key)) {
      throw new Error(`updateSetting: key ${key} not found`);
    }
    (this as any)[key] = value;
    if (save) {
      storageSetKey(
        getKeyIdentifier(SettingsManager.settingsKey, key),
        value,
        StorageOption.SyncedStorage
      );
    }
  }
}
