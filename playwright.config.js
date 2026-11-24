import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir:'tests', testMatch:'*.e2e.js', timeout:30000, fullyParallel:true, workers:2,
  use:{baseURL:'http://localhost:4173',trace:'retain-on-failure'},
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome'],viewport:{width:1440,height:960},channel:'chrome'}},
    {name:'iphone',use:{...devices['iPhone 15'],browserName:'webkit'}}
  ],
  webServer:{command:'npm run preview -- --port 4173 --strictPort',url:'http://localhost:4173',reuseExistingServer:!process.env.CI}
});

