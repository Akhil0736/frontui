
'use server';

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';

puppeteer.use(StealthPlugin());

export class BrowserController {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private userAgent: string;
  
  constructor(private userId: string) {
    this.userAgent = this.generateRandomUserAgent();
  }
  
  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-features=VizDisplayCompositor',
        `--user-agent=${this.userAgent}`
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport to mobile (Instagram mobile is less protected)
    await this.page.setViewport({ width: 375, height: 812 });
    
    // Block unnecessary resources for speed
    await this.page.setRequestInterception(true);
    this.page.on('request', (req) => {
      if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
        req.abort();
      } else {
        req.continue();
      }
    });
  }
  
  async loginToInstagram(username: string, password: string): Promise<boolean> {
    if (!this.page) {
        throw new Error("Browser not initialized. Call initialize() first.");
    }
    try {
      await this.page!.goto('https://www.instagram.com/accounts/login/', {
        waitUntil: 'networkidle2'
      });
      
      // Wait for login form
      await this.page!.waitForSelector('input[name="username"]');
      
      // Human-like typing
      await this.humanType('input[name="username"]', username);
      await this.randomDelay(1000, 2000);
      
      await this.humanType('input[name="password"]', password);
      await this.randomDelay(1000, 2000);
      
      // Click login button
      await this.page!.click('button[type="submit"]');
      
      // Wait for redirect or error
      await this.page!.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Check if login successful
      const currentUrl = this.page!.url();
      return !currentUrl.includes('/accounts/login/');
      
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }
  
  private async humanType(selector: string, text: string): Promise<void> {
    if (!this.page) {
        throw new Error("Browser not initialized. Call initialize() first.");
    }
    await this.page!.click(selector);
    await this.page!.evaluate((sel) => {
      const element = document.querySelector(sel) as HTMLInputElement;
      element.value = '';
    }, selector);
    
    // Type character by character with random delays
    for (const char of text) {
      await this.page!.type(selector, char);
      await this.randomDelay(50, 150);
    }
  }
  
  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  private generateRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }
  
  getPage(): Page | null {
    return this.page;
  }
  
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
