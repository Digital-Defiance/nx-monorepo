import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MessageContext, SettingsManager } from '@digital-defiance/langex-core';

@Injectable()
export class AppSettingsService {
  private static readonly _settingsManager: SettingsManager =
    new SettingsManager(MessageContext.Extension);
  getSettingsManager(): Observable<SettingsManager> {
    return new Observable((observer) => {
      observer.next(AppSettingsService._settingsManager);
    });
  }
}
