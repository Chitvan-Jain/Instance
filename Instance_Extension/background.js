async function logChromeState() {
  const windows = await chrome.windows.getAll({ populate: true })
  const tabGroups = await chrome.tabGroups.query({})

  console.log('Instance debug — windows:', windows)
  console.log('Instance debug — tab groups:', tabGroups)
}

const NATIVE_HOST_NAME = 'com.instance.native_host'

function testNativeMessaging() {
  const port = chrome.runtime.connectNative(NATIVE_HOST_NAME)

  port.onMessage.addListener((message) => {
    console.log('Instance debug — native host replied:', message)
  })

  port.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
      console.error('Instance debug — native messaging error:', chrome.runtime.lastError.message)
    }
  })

  port.postMessage({ type: 'ping' })
}

// Re-run any time the toolbar icon is clicked, for easy manual testing.
chrome.action.onClicked.addListener(() => {
  logChromeState()
  testNativeMessaging()
})

// Also run once whenever this service worker starts up.
logChromeState()
testNativeMessaging()