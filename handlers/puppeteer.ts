import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import chromium from "@sparticuz/chromium";

// Puppeteer Handler Class
export class PuppeteerHandler {
    constructor() {
        puppeteer.use(StealthPlugin());
        puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
        puppeteer.use(
            RecaptchaPlugin({ provider: { id: '2captcha', token: process.env.RECAPTCHA_API_KEY } })
        );
    }

    async captureScreenshot({ url, device, width, height, followRedirects }: any) {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ],
            executablePath: (await chromium.executablePath()) || "/usr/bin/google-chrome-stable"
        });

        const page = await browser.newPage();
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
        );

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

        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });

        await page.solveRecaptchas();

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

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForSelector('body', { timeout: 10000 });
        const screenshot = await page.screenshot({ type: 'png', fullPage: true });
        await browser.close();
        return screenshot;
    }
}