import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';

(async () => {
  // Create a minimal Angular application with platform providers
  const app = await createApplication({
    providers: []
  });

  // Create the custom element with the app's injector
  const launchesAreaChart = createCustomElement(AppComponent, { 
    injector: app.injector 
  });
  
  // Define the custom element
  customElements.define('launches-area-chart', launchesAreaChart);
})();
