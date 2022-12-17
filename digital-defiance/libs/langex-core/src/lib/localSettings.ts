import {
  getKeyIdentifier,
  storageGetKey,
  storageSetKey,
} from './chromeStorage';
import { ILocalSettings } from './interfaces';
import { SettingsManager } from './settingsManager';
import StorageOption from './storageOption';
import UrlFilterMethod from './urlFilterMethod';

/**
 * Settings stored in browser local storage only (not global sync)
 */
export class LocalSettings implements ILocalSettings {
  public filterMethod: UrlFilterMethod;
  public includedSites: string[];
  public excludedSites: string[];
  public extensionEnabled: boolean;

  constructor(
    defaultFilterMethod: UrlFilterMethod,
    defaultIncludedSites: string[],
    defaultExcludedSites: string[],
    defaultExtensionEnabled: boolean = true
  ) {
    this.filterMethod = storageGetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'filterMethod'),
      StorageOption.LocalStorage
    ) || defaultFilterMethod;
    this.excludedSites =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'excludedSites'),
        StorageOption.LocalStorage
      ) || defaultExcludedSites;
    this.extensionEnabled =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'extensionEnabled'),
        StorageOption.LocalStorage
      ) || defaultExtensionEnabled;
    this.includedSites =
      storageGetKey(
        getKeyIdentifier(SettingsManager.settingsKey, 'includedSites'),
        StorageOption.LocalStorage
      ) || defaultIncludedSites;
  }

  public save(): void {
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'filterMethod'),
      this.filterMethod,
      StorageOption.LocalStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'excludedSites'),
      this.excludedSites,
      StorageOption.LocalStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'extensionEnabled'),
      this.extensionEnabled,
      StorageOption.LocalStorage
    );
    storageSetKey(
      getKeyIdentifier(SettingsManager.settingsKey, 'includedSites'),
      this.includedSites,
      StorageOption.LocalStorage
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
