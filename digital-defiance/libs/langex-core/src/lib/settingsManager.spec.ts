import { SettingsManager } from './settingsManager';
import * as sinon from 'sinon';
import * as chrome from 'sinon-chrome';
import MessageContext from './messageContext';
import { makeExpectedAppSettings, makeExpectedISettings } from './testUtils';
import AppSettings from './appSettings';
import { getKeyIdentifier, storageGetKey } from './chromeStorage';

describe('AppComponent', () => {
  beforeEach(async () => {
    chrome.reset();
    chrome.storage.local.set.reset();
    chrome.storage.local.get.reset();
    chrome.storage.sync.set.reset();
    chrome.storage.sync.get.reset();
  });
  it('should create the manager', () => {
    const settingsManager = new SettingsManager(MessageContext.Extension);
    expect(settingsManager).toBeInstanceOf(SettingsManager);
    expect(settingsManager.Settings).toEqual(
      makeExpectedISettings() as AppSettings
    );
    // creating a new instance loads the settings
    sinon.assert.callCount(chrome.storage.sync.get, 13);
    sinon.assert.calledOnce(chrome.i18n.getUILanguage);
  });
  it('should load the correct settings from the storage', () => {
    // force chrome.storage.sync.get to return the correct value
    // arrange
    const updatedForvoApiKey = 'forvoApiKeyTest';
    const expectedSettingValue: { [key: string]: any } = {};
    expectedSettingValue[
      getKeyIdentifier(SettingsManager.settingsKey, 'forvoApiKey')
    ] = updatedForvoApiKey;
    chrome.storage.sync.get.yields(expectedSettingValue);
    /// act
    const settingsManager = new SettingsManager(MessageContext.Extension);
    // assert
    expect(settingsManager).toBeInstanceOf(SettingsManager);
    expect(settingsManager.Settings).toEqual(
      makeExpectedISettings('forvoApiKey', updatedForvoApiKey)
    );
  });
  it('should be able to save the settings', () => {
    // arrange
    const updatedForvoApiKey = 'forvoApiKeyTest';
    const expectedSettings = makeExpectedAppSettings(
      'forvoApiKey',
      updatedForvoApiKey
    );
    // act
    const settingsManager = new SettingsManager(MessageContext.Extension);
    // assert
    expect(settingsManager).toBeInstanceOf(SettingsManager);
    expect(settingsManager.Settings).toEqual(makeExpectedISettings());

    // arrange - update the settings
    // act - save the settings (passing true acts and updates the setting)
    settingsManager.Settings.updateSetting(
      'forvoApiKey',
      updatedForvoApiKey,
      true
    );
    // assert
    sinon.assert.callCount(chrome.storage.sync.get, 13);
    sinon.assert.calledOnce(chrome.storage.sync.set);
  });
  it('should create the correctly formatted key when getKeyIdentifier is given extra arguments', () => {
    // arrange
    const expectedKey = `testKey1_testKey2_testKey3`;
    // act
    const key = getKeyIdentifier('testKey1', 'testKey2', 'testKey3');
    // assert
    expect(key).toEqual(expectedKey);
  });
  it('should verify hex colors', () => {
    // arrange
    const settingsManager = new SettingsManager(MessageContext.Extension);
    // act
    const isValid = settingsManager.verifyHexColor('#000000');
    // assert
    expect(isValid).toEqual(true);
  });
  it('should not verify invalid colors, no pound sign', () => {
    // arrange
    const settingsManager = new SettingsManager(MessageContext.Extension);
    // act
    const isValid = settingsManager.verifyHexColor('000000');
    // assert
    expect(isValid).toEqual(false);
  });
  it('should not verify invalid colors, non-hex/numeric', () => {
    // arrange
    const settingsManager = new SettingsManager(MessageContext.Extension);
    // act
    const isValid = settingsManager.verifyHexColor('#GGGGGG');
    // assert
    expect(isValid).toEqual(false);
  });
  it('should fail to update a setting not in the settings keys', () => {
    // arrange
    const settingsManager = new SettingsManager(MessageContext.Extension);
    // act, deferred
    const deferredAction = () =>
      settingsManager.Settings.updateSetting('testKey', 'testValue');
    // assert
    expect(() => deferredAction()).toThrow();
  });
  it('should make sure save is called when updateSetting is called with save = true', () => {
    // arrange
    const settingsManager = new SettingsManager(MessageContext.Extension);
    // act
    settingsManager.Settings.updateSetting('forvoApiKey', 'testValue', true);
    // assert
    sinon.assert.calledOnce(chrome.storage.sync.set);
    const expectedSetting: { [key: string]: string } = {};
    expectedSetting[
      getKeyIdentifier(SettingsManager.settingsKey, 'forvoApiKey')
    ] = 'testValue';
    sinon.assert.calledWith(chrome.storage.sync.set, expectedSetting);
  });
});
