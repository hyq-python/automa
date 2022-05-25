import browser from 'webextension-polyfill';

export async function getFrames(tabId) {
  try {
    const frames = await browser.webNavigation.getAllFrames({ tabId });
    const framesObj = frames.reduce((acc, { frameId, url }) => {
      const key = url === 'about:blank' ? '' : url;

      acc[key] = frameId;

      return acc;
    }, {});

    return framesObj;
  } catch (error) {
    console.error(error);
    return {};
  }
}

async function contentScriptExist(tabId, frameId = 0) {
  try {
    await browser.tabs.sendMessage(
      tabId,
      { type: 'content-script-exists' },
      { frameId }
    );

    return true;
  } catch (error) {
    return false;
  }
}

export default async function (tabId, frameId = 0) {
  try {
    const currentFrameId = typeof frameId !== 'number' ? 0 : frameId;
    const isScriptExists = await contentScriptExist(tabId, currentFrameId);

    if (!isScriptExists) {
      await browser.tabs.executeScript(tabId, {
        allFrames: true,
        runAt: 'document_end',
        file: './contentScript.bundle.js',
      });
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
