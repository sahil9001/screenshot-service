import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import RecaptchaPlugin from 'puppeteer-extra-plugin-recaptcha';
import { createClient } from '@supabase/supabase-js';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
puppeteer.use(
  RecaptchaPlugin({ provider: { id: '2captcha', token: process.env.RECAPTCHA_API_KEY } })
);

export async function POST(req: Request) {
  try {
    // Extract Authorization header
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url, device, width, height, followRedirects } = await req.json();
    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    // Launch browser with stealth mode
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled'
      ]
    });
    const page = await browser.newPage();

    // Spoof user agent
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

    // Prevent detection by removing WebDriver property
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    // Solve reCAPTCHA if encountered
    await page.solveRecaptchas();

    // Configure redirect behavior
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

    // Navigate to URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    await page.waitForSelector('body', { timeout: 10000 });
    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
    });

    await browser.close();

    // Upload to Supabase Storage
    const timestamp = new Date().getTime();
    const fileName = `screenshots/${timestamp}-${url.replace(/[^a-z0-9]/gi, '_')}.png`;

    const { data, error } = await supabase.storage
      .from('screenshots')
      .upload(fileName, screenshot, { contentType: 'image/png' });

    if (error) {
      console.log(error);
      throw new Error('Failed to upload screenshot');
    }

    // Save screenshot metadata to database
    const { data: screenshotData, error: dbError } = await supabase
      .from('screenshots')
      .insert([
        {
          user_id: user.id,
          url,
          device,
          width: width || 1920,
          height: height || 1080,
          storage_path: fileName,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (dbError) {
      console.log(dbError);
      throw new Error('Failed to save screenshot metadata');
    }

    // Update user's total_screenshots count
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_screenshots')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      const newTotal = profile.total_screenshots + 1;
      await supabase
        .from('profiles')
        .update({ total_screenshots: newTotal })
        .eq('user_id', user.id);
    }
    return NextResponse.json({
      success: true,
      screenshot: screenshotData[0],
    });
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: 'Failed to capture screenshot' },
      { status: 500 }
    );
  }
}
