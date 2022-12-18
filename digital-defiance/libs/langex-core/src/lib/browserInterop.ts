/***
 * This file is currently housing some possibly YAGNI code, I found from examples elsewhere,
 * but I'm leaving it in for now and expect to use it.
 */

export function getBackgroundPage(): Window | null {
  return chrome.extension.getBackgroundPage();
}

export function getApplicationVersion(): string {
  return chrome.runtime.getManifest().version;
}

export function reloadExtension(win: Window) {
  if (win != null && win.location !== undefined) {
    return (win.location as any).reload(true);
  } else {
    return chrome.runtime.reload();
  }
}

export async function requestPermission(permission: any): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.permissions.request(permission, resolve);
  });
}
