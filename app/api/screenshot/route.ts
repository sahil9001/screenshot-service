import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PuppeteerHandler } from '@/handlers/puppeteer';

export const dynamic = 'force-dynamic';

const SCREENSHOT_LIMIT = 10;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const puppeteerHandler = new PuppeteerHandler();

const authenticateUser = async (authHeader: string | null) => {
  if (!authHeader) {
    throw new Error('Unauthorized');
  }
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  return user;
};

const validateAndFormatUrl = (url: string) => {
  if (!url) {
    throw new Error('Invalid URL');
  }
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

const captureAndUploadScreenshot = async (params: any) => {
  const screenshot = await puppeteerHandler.captureScreenshot(params);
  const fileName = `screenshots/${Date.now()}-${params.url.replace(/[^a-z0-9]/gi, '_')}.png`;
  const { error } = await supabase.storage
    .from('screenshots')
    .upload(fileName, screenshot, { contentType: 'image/png' });
  if (error) throw new Error('Failed to upload screenshot');
  return fileName;
};

const saveScreenshotMetadata = async (user: any, params: any, fileName: string) => {
  const { data, error } = await supabase
    .from('screenshots')
    .insert([{
      user_id: user.id,
      url: params.url,
      device: params.device,
      width: params.width || 1920,
      height: params.height || 1080,
      storage_path: fileName,
      created_at: new Date().toISOString(),
    }])
    .select();
  if (error) throw new Error('Failed to save screenshot metadata');
  return data[0];
};

const updateUserTotalScreenshots = async (userId: string) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_screenshots')
    .eq('user_id', userId)
    .single();
  if (profile) {
    await supabase
      .from('profiles')
      .update({ total_screenshots: profile.total_screenshots + 1 })
      .eq('user_id', userId);
  }
};

const checkSubscription = async (userId: string) => {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .limit(1);

  if(subscription?.[0]?.status !== 'active'){
    return false;
  }
  if(!subscription){
    const { data: profile } = await supabase
      .from('profiles')
      .select('total_screenshots')
      .eq('user_id', userId)
      .limit(1);
    return profile?.[0]?.total_screenshots < SCREENSHOT_LIMIT;
  }
  return true;
};

export async function POST(req: Request) {
  try {
    const user = await authenticateUser(req.headers.get('authorization') || req.headers.get('Authorization'));
    const params = await req.json();
    params.url = validateAndFormatUrl(params.url);
    const hasSubscription = await checkSubscription(user.id);
    if(!hasSubscription){
      throw new Error('You have reached your screenshot limit or subscription has expired');
    }
    const fileName = await captureAndUploadScreenshot(params);
    const screenshotData = await saveScreenshotMetadata(user, params, fileName);
    await updateUserTotalScreenshots(user.id);
    return NextResponse.json({ success: true, screenshot: screenshotData });
  } catch (error) {
    console.error('Screenshot error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to capture screenshot' },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
