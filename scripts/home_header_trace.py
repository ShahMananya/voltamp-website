import json
import time
import urllib.request
import websocket

PORT = 9225
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


def run(width, mobile):
    page = open_target()
    ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=10)
    send(ws, "Runtime.enable")
    send(ws, "Page.enable")
    send(ws, "Emulation.setDeviceMetricsOverride", {"width": width, "height": 844, "deviceScaleFactor": 1, "mobile": mobile})
    send(ws, "Page.navigate", {"url": f"{BASE}/?from_webdev=1"})
    time.sleep(2)
    if mobile:
        evaluate(ws, "document.querySelector('.market-menu')?.click(); true")
        time.sleep(0.25)
    result = evaluate(ws, """({
      ready: document.readyState,
      desktopHeader: document.querySelector('.market-nav')?.textContent?.trim() ?? '',
      mobileHeader: document.querySelector('.market-mobile-nav')?.textContent?.trim() ?? '',
      aboutHomepageMatches: [...document.querySelectorAll('a,button')].filter((node) => /about volamp/i.test(node.textContent || '')).length,
      dedicatedRouteLinkExists: !!document.querySelector('[href="/about-volamp"]')
    })""")
    ws.close()
    return result


def route_check():
    page = open_target()
    ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=10)
    send(ws, "Runtime.enable")
    send(ws, "Page.enable")
    send(ws, "Page.navigate", {"url": f"{BASE}/about-volamp"})
    time.sleep(2)
    result = evaluate(ws, "({ready: document.readyState, aboutPage: !!document.querySelector('.about-page')})")
    ws.close()
    return result

print(json.dumps({"desktop": run(1280, False), "mobile": run(390, True), "dedicatedRoute": route_check()}, indent=2))
