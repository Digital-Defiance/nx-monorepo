import * as puppeteer from 'puppeteer';

export async function getBrowser(): Promise<puppeteer.Browser> {
    return await puppeteer.launch({
        headless: true,
        ignoreDefaultArgs: [
            "--mute-audio",
        ],
        args: [
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
}

export interface IOpenedPage {
    browser: puppeteer.Browser;
    page: puppeteer.Page;
}

export async function testBrowser(): Promise<undefined | IOpenedPage> {
    const browser = await getBrowser();
    if (browser === undefined) {
        console.log('browser is undefined');
        return;
    }
    const page = await  browser.newPage();
    await page.goto('about:blank'); // TODO: replace with local web server
    const result: IOpenedPage = {
        browser,
        page,
    };
    return result;
}