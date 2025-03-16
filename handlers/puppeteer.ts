import puppeteer from 'puppeteer-extra';
import chromium from '@sparticuz/chromium';

// Load Stealth Plugin Evasions Before Importing the Plugin
require('puppeteer-extra-plugin-stealth/evasions/chrome.app');
require('puppeteer-extra-plugin-stealth/evasions/chrome.csi');
require('puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes');
require('puppeteer-extra-plugin-stealth/evasions/chrome.runtime');
require('puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow');
require('puppeteer-extra-plugin-stealth/evasions/media.codecs');
require('puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency');
require('puppeteer-extra-plugin-stealth/evasions/navigator.languages');
require('puppeteer-extra-plugin-stealth/evasions/navigator.permissions');
require('puppeteer-extra-plugin-stealth/evasions/navigator.plugins');
require('puppeteer-extra-plugin-stealth/evasions/navigator.vendor');
require('puppeteer-extra-plugin-stealth/evasions/navigator.webdriver');
require('puppeteer-extra-plugin-stealth/evasions/sourceurl');
require('puppeteer-extra-plugin-stealth/evasions/user-agent-override');
require('puppeteer-extra-plugin-stealth/evasions/webgl.vendor');
require('puppeteer-extra-plugin-stealth/evasions/window.outerdimensions');
require('puppeteer-extra-plugin-stealth/evasions/defaultArgs');
require('puppeteer-extra-plugin-user-preferences');
require('puppeteer-extra-plugin-user-data-dir');

// Now Import the Stealth Plugin
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';

// Puppeteer Handler Class
export class PuppeteerHandler {
    constructor() {
        puppeteer.use(StealthPlugin());
        puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
        chromium.setGraphicsMode = false;
    }
    
    async captureScreenshot({ url, device, width, height, followRedirects }) {
        let browser;
        try {
            const isLocal = process.env.NODE_ENV === 'development';
            const executablePath = isLocal ? '/opt/homebrew/bin/chromium' : await chromium.executablePath();
            const options = isLocal ? {
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath,
                headless: chromium.headless,
                ignoreHTTPSErrors: true
            } : {
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath,
                headless: chromium.headless,
            };
            browser = await puppeteer.launch(options);

            const page = await browser.newPage();
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            );

            // Set viewport based on device type
            switch (device) {
                case 'mobile':
                    await page.setViewport({ width: 375, height: 667 });
                    break;
                case 'tablet':
                    await page.setViewport({ width: 768, height: 1024 });
                    break;
                default:
                    await page.setViewport({ width: width || 1920, height: height || 1080 });
            }

            // Prevent detection as a bot
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => false });
            });

            // Handle redirects
            if (!followRedirects) {
                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    if (request.isNavigationRequest() && request.redirectChain().length) {
                        request.abort();
                    } else {
                        request.continue();
                    }
                });
            }

            // Visit the target URL
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            // Ensure body loads before taking screenshot
            await page.waitForSelector('body', { timeout: 10000 });

            // Capture screenshot
            const screenshot = await page.screenshot({ type: 'png', fullPage: true });

            return screenshot;
        } catch (error) {
            console.error('Puppeteer Error:', error);
            throw new Error('Failed to capture screenshot');
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}