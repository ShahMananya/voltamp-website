import json
import time
import urllib.request
import websocket

BASE = "https://3000-iwkosjarrhs5cosyi2dp1-1a176733.us1.manus.computer/about-volamp"
PORT = 9224


def send(ws, method, params=None, ident=[0]):
    ident[0] += 1
    ws.send(json.dumps({"id": ident[0], "method": method, "params": params or {}}))
    while True:
        message = json.loads(ws.recv())
        if message.get("id") == ident[0]:
            return message


def run(theme):
    url = BASE + f"?theme={theme}"
    request = urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{url}", method="PUT")
    try:
        page = json.load(urllib.request.urlopen(request))
    except Exception:
        page = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list"))[0]
    ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=10)
    send(ws, "Runtime.enable")
    send(ws, "Page.enable")
    send(ws, "Emulation.setDeviceMetricsOverride", {"width": 390, "height": 844, "deviceScaleFactor": 1, "mobile": True})
    send(ws, "Page.navigate", {"url": url})
    time.sleep(5)
    expression = """(async () => {
      const response = await fetch('/manus-storage/india_state_simplified_3808fbf8.geojson');
      const geojson = await response.json();
      return {
        ready: document.readyState,
        theme: document.documentElement.className,
        mobile: matchMedia('(max-width:900px)').matches,
        page: !!document.querySelector('.about-page'),
        footprintConsole: !!document.querySelector('.about-footprint-console'),
        stateButtons: document.querySelectorAll('.about-state-list button').length,
        columns: getComputedStyle(document.querySelector('.about-footprint-console')).gridTemplateColumns,
        geojsonFeatures: geojson.features?.length ?? 0,
        "heroHeight": document.querySelector('.about-hero')?.getBoundingClientRect().height ?? 0
      };
    })()"""
    result = send(ws, "Runtime.evaluate", {"expression": expression, "returnByValue": True, "awaitPromise": True})["result"]["result"].get("value")
    select_expression = """(async () => { const button = [...document.querySelectorAll('.about-state-list button')].find((node) => node.textContent?.trim() === 'Maharashtra'); button?.click(); await new Promise((resolve) => setTimeout(resolve, 250)); return { selected: document.querySelector('.about-footprint-panel h3')?.textContent ?? null, code: document.querySelector('.about-state-code')?.textContent ?? null, heritageVariant: document.querySelector('.about-state-heritage-art')?.className ?? null }; })()"""
    selection = send(ws, "Runtime.evaluate", {"expression": select_expression, "returnByValue": True, "awaitPromise": True})["result"]["result"].get("value")
    result["selection"] = selection
    ws.close()
    return result

print(json.dumps({"lightMobile": run("light"), "darkMobile": run("dark")}, ensure_ascii=False, indent=2))
