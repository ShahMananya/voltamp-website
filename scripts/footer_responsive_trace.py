import json
import time
import urllib.request
import websocket

PORT = 9226
BASE = "http://127.0.0.1:3000"


def send(ws, method, params=None, ident=[0]):
    ident[0] += 1
    ws.send(json.dumps({"id": ident[0], "method": method, "params": params or {}}))
    while True:
        message = json.loads(ws.recv())
        if message.get("id") == ident[0]:
            return message


def open_target():
    request = urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{BASE}/?from_webdev=1", method="PUT")
    try:
        return json.load(urllib.request.urlopen(request))
    except Exception:
        return json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list"))[0]


def evaluate(ws, expression):
    return send(ws, "Runtime.evaluate", {"expression": expression, "returnByValue": True, "awaitPromise": True})["result"]["result"].get("value")


def trace(width, theme):
    page = open_target()
    ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=10)
    send(ws, "Runtime.enable")
    send(ws, "Page.enable")
    send(ws, "Emulation.setDeviceMetricsOverride", {"width": width, "height": 900, "deviceScaleFactor": 1, "mobile": width < 700})
    send(ws, "Page.navigate", {"url": f"{BASE}/?from_webdev=1&theme={theme}"})
    time.sleep(1.5)
    result = evaluate(ws, """(() => {
      const footer = document.querySelector('.site-footer');
      const columns = [...document.querySelectorAll('.footer-column-title')].map((node) => node.textContent?.trim());
      const gem = document.querySelector('.footer-gem-mark img');
      const style = footer ? getComputedStyle(footer) : null;
      const grid = document.querySelector('.footer-columns');
      return {
        ready: document.readyState,
        theme: document.documentElement.className,
        columns,
        columnCount: columns.length,
        gemLoaded: !!gem && gem.complete && gem.naturalWidth > 0,
        gemAlt: gem?.getAttribute('alt') || '',
        blog: document.querySelector('.footer-blog-inner strong')?.textContent?.trim() || '',
        copyright: document.querySelector('.footer-bottom span')?.textContent?.trim() || '',
        footerBackground: style?.backgroundColor || '',
        gridColumns: grid ? getComputedStyle(grid).gridTemplateColumns : ''
      };
    })()""")
    ws.close()
    return result

print(json.dumps({
  "desktopLight": trace(1280, "light"),
  "desktopDark": trace(1280, "dark"),
  "mobileLight": trace(390, "light"),
  "mobileDark": trace(390, "dark")
}, indent=2))
