import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppSettingsService } from './shared/appSettings.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [AppSettingsService],
  bootstrap: [AppComponent],
})
export class AppModule {}
