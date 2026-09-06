import json
import time
import urllib.request
import websocket

BASE = "https://3000-iwkosjarrhs5cosyi2dp1-1a176733.us1.manus.computer/"
PORT = 9223


def send(ws, method, params=None, ident=[0]):
    ident[0] += 1
    ws.send(json.dumps({"id": ident[0], "method": method, "params": params or {}}))
    while True:
        message = json.loads(ws.recv())
        if message.get("id") == ident[0]:
            return message

request = urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{BASE}?surface=calculator", method="PUT")
try:
    page = json.load(urllib.request.urlopen(request))
except Exception:
    page = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list"))[0]
ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=10)
send(ws, "Runtime.enable")
send(ws, "Page.enable")
send(ws, "Emulation.setDeviceMetricsOverride", {"width": 390, "height": 844, "deviceScaleFactor": 1, "mobile": True})
send(ws, "Page.navigate", {"url": BASE + "?surface=calculator"})
time.sleep(4)
expression = "(() => { const modal = document.querySelector('.calculator-modal'); const layout = document.querySelector('.calculator-tree-layout'); const buttonCount = document.querySelectorAll('.calculator-tree-column:first-child .calculator-tree-list button').length; return {ready: document.readyState, url: location.href, mobile: matchMedia('(max-width:760px)').matches, hasModal: !!modal, columns: layout ? getComputedStyle(layout).gridTemplateColumns : null, modalWidth: modal?.getBoundingClientRect().width ?? null, modalBackground: modal ? getComputedStyle(modal).backgroundColor : null, mainButtons: buttonCount}; })()"
result = send(ws, "Runtime.evaluate", {"expression": expression, "returnByValue": True})["result"]["result"].get("value")
print(json.dumps(result, ensure_ascii=False, indent=2))
ws.close()
