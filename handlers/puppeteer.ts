import puppeteer from 'puppeteer-extra';
import chromium from '@sparticuz/chromium';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';

// Initialize plugins
puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

// Puppeteer Handler Class
export class PuppeteerHandler {
    constructor() {
        if (typeof window === 'undefined') {
            chromium.setGraphicsMode = false;
        }
    }
    
    async captureScreenshot({ url, device, width, height, followRedirects } : any) {
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
