
'use server';

import type { Page, ElementHandle } from 'puppeteer';
import { BrowserController } from './BrowserController';

export interface ActionResult {
  action: string;
  target: string;
  success: boolean;
  error?: string;
  details?: any;
  timestamp: Date;
}

export class InstagramActions {
  constructor(
    private browserController: BrowserController,
    private userId: string
  ) {}
  
  async likePostsByHashtag(hashtag: string, count: number): Promise<ActionResult[]> {
    const page = this.browserController.getPage();
    if (!page) {
      throw new Error("Browser not initialized.");
    }
    const results: ActionResult[] = [];
    
    try {
      // Navigate to hashtag page
      await page.goto(`https://www.instagram.com/explore/tags/${hashtag}/`, {
        waitUntil: 'networkidle2'
      });
      
      // Wait for posts to load
      await page.waitForSelector('article div div div div a');
      
      // Get post links
      const postLinks = await page.evaluate((targetCount) => {
        const links = Array.from(document.querySelectorAll('article div div div div a'));
        return links.slice(0, targetCount).map(link => (link as HTMLAnchorElement).href);
      }, count);
      
      // Like each post
      for (let i = 0; i < Math.min(postLinks.length, count); i++) {
        try {
          await page.goto(postLinks[i], { waitUntil: 'networkidle2' });
          
          // Find and click like button
          const likeButton = await page.waitForSelector('button[aria-label="Like"], svg[aria-label="Like"]', {
            timeout: 5000
          });
          
          if (likeButton) {
            await likeButton.click();
            
            results.push({
              action: 'like',
              target: postLinks[i],
              success: true,
              timestamp: new Date()
            });
            
            // Human-like delay between likes (2-5 minutes)
            await this.randomDelay(120000, 300000);
          }
          
        } catch (error: any) {
          results.push({
            action: 'like',
            target: postLinks[i],
            success: false,
            error: error.message,
            timestamp: new Date()
          });
        }
      }
      
    } catch (error: any) {
      console.error('Error liking posts:', error);
    }
    
    return results;
  }
  
  async followUsersByHashtag(hashtag: string, count: number): Promise<ActionResult[]> {
    const page = this.browserController.getPage();
    if (!page) {
        throw new Error("Browser not initialized.");
    }
    const results: ActionResult[] = [];
    
    try {
      await page.goto(`https://www.instagram.com/explore/tags/${hashtag}/`, {
        waitUntil: 'networkidle2'
      });
      
      // Get recent posts
      await page.waitForSelector('article div div div div a');
      const postLinks = await page.evaluate((targetCount) => {
        const links = Array.from(document.querySelectorAll('article div div div div a'));
        return links.slice(0, targetCount * 2).map(link => (link as HTMLAnchorElement).href);
      }, count);
      
      const followedUsers = new Set();
      
      for (const postLink of postLinks) {
        if (followedUsers.size >= count) break;
        
        try {
          await page.goto(postLink, { waitUntil: 'networkidle2' });
          
          // Get username
          const username = await page.evaluate(() => {
            const usernameElement = document.querySelector('header a');
            return usernameElement?.textContent || '';
          });
          
          if (username && !followedUsers.has(username)) {
            // Click follow button
            const followButton = await page.waitForSelector('button', {
              timeout: 3000
            });
            
            if (followButton) {
              const buttonText = await page.evaluate(btn => btn.textContent, followButton);
              
              if (buttonText?.toLowerCase().includes('follow') && !buttonText.toLowerCase().includes('following')) {
                await followButton.click();
                followedUsers.add(username);
                
                results.push({
                  action: 'follow',
                  target: username,
                  success: true,
                  timestamp: new Date()
                });
                
                // Longer delay for follows (5-10 minutes)
                await this.randomDelay(300000, 600000);
              }
            }
          }
          
        } catch (error: any) {
          results.push({
            action: 'follow',
            target: 'unknown',
            success: false,
            error: error.message,
            timestamp: new Date()
          });
        }
      }
      
    } catch (error: any) {
      console.error('Error following users:', error);
    }
    
    return results;
  }
  
  async commentOnPosts(hashtag: string, comments: string[], count: number): Promise<ActionResult[]> {
    const page = this.browserController.getPage();
    if (!page) {
        throw new Error("Browser not initialized.");
    }
    const results: ActionResult[] = [];
    
    try {
      await page.goto(`https://www.instagram.com/explore/tags/${hashtag}/`, {
        waitUntil: 'networkidle2'
      });
      
      const postLinks = await page.evaluate((targetCount) => {
        const links = Array.from(document.querySelectorAll('article div div div div a'));
        return links.slice(0, targetCount).map(link => (link as HTMLAnchorElement).href);
      }, count);
      
      for (let i = 0; i < Math.min(postLinks.length, count); i++) {
        try {
          await page.goto(postLinks[i], { waitUntil: 'networkidle2' });
          
          // Find comment textarea
          const commentArea = await page.waitForSelector('textarea[aria-label="Add a comment…"]', {
            timeout: 5000
          });
          
          if (commentArea) {
            const randomComment = comments[Math.floor(Math.random() * comments.length)];
            
            await commentArea.click();
            await this.humanType(commentArea, randomComment);
            
            // Submit comment
            const postButton = await page.waitForSelector('button[type="submit"]');
            if (postButton) {
              await postButton.click();
              
              results.push({
                action: 'comment',
                target: postLinks[i],
                success: true,
                details: { comment: randomComment },
                timestamp: new Date()
              });
              
              // Very long delay for comments (10-15 minutes)
              await this.randomDelay(600000, 900000);
            }
          }
          
        } catch (error: any) {
          results.push({
            action: 'comment',
            target: postLinks[i],
            success: false,
            error: error.message,
            timestamp: new Date()
          });
        }
      }
      
    } catch (error: any) {
      console.error('Error commenting on posts:', error);
    }
    
    return results;
  }
  
  private async humanType(element: ElementHandle<Element>, text: string): Promise<void> {
    await element.click();
    
    for (const char of text) {
      await element.type(char, { delay: Math.random() * 100 + 50 });
    }
  }
  
  private async randomDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
