// Test using Puppeteer to control real browser
import puppeteer from 'puppeteer';

async function testRealBrowser() {
  const browser = await puppeteer.launch({ 
    headless: false, // Show browser for debugging
    args: ['--no-sandbox'] 
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🔍 Navigating to prompt studio...');
    await page.goto('http://localhost:5000/prompt-studio', { waitUntil: 'networkidle0' });
    
    console.log('🔍 Waiting for prompt input...');
    await page.waitForSelector('textarea[data-testid="input-prompt"]', { timeout: 10000 });
    
    console.log('✅ Found prompt input!');
    
    console.log('🔍 Checking for providers...');
    const providers = await page.$$('div[data-testid^="provider-"]');
    console.log(`Found ${providers.length} providers`);
    
    console.log('🔍 Looking for send button...');
    const sendButton = await page.$('button[data-testid="button-send-prompt"]');
    console.log(sendButton ? '✅ Found send button!' : '❌ Send button missing');
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-debug.png' });
    console.log('📸 Screenshot saved as test-debug.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testRealBrowser();