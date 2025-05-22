let logging = false;

function onError(e = "error log") {
  if (logging) {
    console.error(e);
  }
}

// fulfilled logging for promises
function resolveLog(e = "Promise fulfilled") {
  if (logging) {
    console.log(e);
  }
}

// general logging with timestamp
function appLog(e) {
  if (logging) {
    const timestamp = new Date().toISOString();
    if (typeof e == "object") {
      console.log(`[${timestamp}]: ` + JSON.stringify(e));
    } else {
      console.log(`[${timestamp}]: ` + e);
    }
  }
}

function storeSettings() {
  appLog("store Settings clicked");

  function storeNewValues(currentsettings) {
    function getInputValue(elementid) {
      const input = document.querySelector(elementid);
      if (input.type == "checkbox") {
        return input.checked;
      }
      return input.value;
    }

    const sockshost = getInputValue("#sockshost");
    const socksport = getInputValue("#socksport");
    const proxydns = getInputValue("#proxydns");
    const loggingopt = getInputValue("#logging");

    currentsettings.value.socks = `${sockshost}:${socksport}`;
    currentsettings.value.proxyDNS = proxydns;
    currentsettings.logging = loggingopt;

    appLog(currentsettings.value);

    logging = loggingopt;

    browser.storage.local.set(currentsettings);
    delete currentsettings.logging;
    browser.proxy.settings.set(currentsettings);
  }

  const getCurrentSettings = browser.storage.local.get();
  getCurrentSettings.then(storeNewValues, onError);
}

function updateSettingsPage(storedproxysettings) {
  const sockshost = document.querySelector("#sockshost");
  const socksport = document.querySelector("#socksport");
  const proxydns = document.querySelector("#proxydns");
  const loggingopt = document.querySelector("#logging");

  const sockssettings = storedproxysettings.value.socks.split(":");
  sockshost.value = sockssettings[0];
  socksport.value = sockssettings[1];

  proxydns.checked = storedproxysettings.value.proxyDNS;
  loggingopt.checked = storedproxysettings.logging;
}

function refreshUI() {
  const getStorageSettings = browser.storage.local.get();
  getStorageSettings.then(updateSettingsPage, onError);
}

const saveButton = document.querySelector("#save-button");
saveButton.addEventListener("click", storeSettings);

refreshUI();

document.addEventListener("focus", function () {
  refreshUI();
});
