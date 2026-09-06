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


def capture(theme):
    url = BASE + f"?surface=calculator&theme={theme}"
    request = urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{url}", method="PUT")
    try:
        page = json.load(urllib.request.urlopen(request))
    except Exception:
        page = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list"))[0]
    ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=10)
    send(ws, "Runtime.enable")
    send(ws, "Page.enable")
    send(ws, "Page.navigate", {"url": url})
    time.sleep(3)
    expression = "(() => { const modal = document.querySelector('.calculator-modal'); const page = document.querySelector('.volamp-marketplace'); return {theme:" + json.dumps(theme) + ", ready:document.readyState, htmlClass:document.documentElement.className, calculatorVisible:!!modal, modalBackground:modal ? getComputedStyle(modal).backgroundColor : null, modalText:modal ? getComputedStyle(modal).color : null, pageBackground:page ? getComputedStyle(page).backgroundColor : null}; })()"
    result = send(ws, "Runtime.evaluate", {"expression": expression, "returnByValue": True})["result"]["result"].get("value")
    ws.close()
    return result

print(json.dumps({"light": capture("light"), "dark": capture("dark")}, ensure_ascii=False, indent=2))
