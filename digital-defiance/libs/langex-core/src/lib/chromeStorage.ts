import StorageOption from './storageOption';

export function storageSetKey(
  key: string,
  value: any,
  storageType: StorageOption
): void {
  if (storageType === StorageOption.LocalStorage) {
    chrome.storage.local.set({ [key]: value });
  } else if (storageType === StorageOption.SyncedStorage) {
    chrome.storage.sync.set({ [key]: value });
  } else {
    throw new Error('Invalid storage type');
  }
}

export function storageGetKey(key: string, storageType: StorageOption): any {
  let value: any = null;
  const cb = (items: { [key: string]: any }) => {
    if (items[key] !== undefined) {
      value = items[key];
    }
  };
  if (storageType === StorageOption.LocalStorage) {
    chrome.storage.local.get(key, cb);
  } else if (storageType === StorageOption.SyncedStorage) {
    chrome.storage.sync.get(key, cb);
  } else {
    throw new Error('Invalid storage type');
  }
  return value;
}

export function getKeyIdentifier(key: string, ...args: string[]): string {
  // if no additional arguments, no trailing _ will be added
  const trailing = args.length > 0 ? `_${args.join('_')}` : '';
  return `${key}${trailing}`;
}

/**
 * @param key
 * @param value
 */
export function saveExtraData<T>(
  key: string,
  value: T,
  ...extraKeyArgs: string[]
): void {
  const keyIdentifier = getKeyIdentifier(key, ...extraKeyArgs);
  chrome.storage.sync.set({ [keyIdentifier]: JSON.stringify(value) });
}

export function loadExtraData<T>(
  key: string,
  ...extraKeyArgs: string[]
): T | null {
  const keyIdentifier = getKeyIdentifier(key, ...extraKeyArgs);
  let value: T | null = null;
  chrome.storage.sync.get(keyIdentifier, (items: { [key: string]: any }) => {
    if (items[keyIdentifier]) {
      value = JSON.parse(items[keyIdentifier] as string);
    }
  });
  return value;
}

export function removeExtraData(key: string, ...extraKeyArgs: string[]): void {
  const keyIdentifier = getKeyIdentifier(key, ...extraKeyArgs);
  chrome.storage.sync.remove(keyIdentifier);
}
