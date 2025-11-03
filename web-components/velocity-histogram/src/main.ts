import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';

(async () => {
  // Create a minimal Angular application with platform providers
  const app = await createApplication({
    providers: []
  });

  // Create the custom element with the app's injector
  const velocityHistogram = createCustomElement(AppComponent, { 
    injector: app.injector 
  });
  
  // Define the custom element
  customElements.define('velocity-histogram', velocityHistogram);
})();
