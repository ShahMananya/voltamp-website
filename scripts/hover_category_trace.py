import json
import time
import urllib.request
import websocket

PREVIEW = "https://3000-iwkosjarrhs5cosyi2dp1-1a176733.us1.manus.computer/"
PORT = 9223


def send(ws, method, params=None, ident=[0]):
    ident[0] += 1
    ws.send(json.dumps({"id": ident[0], "method": method, "params": params or {}}))
    while True:
        message = json.loads(ws.recv())
        if message.get("id") == ident[0]:
            return message

request = urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{PREVIEW}", method="PUT")
try:
    page = json.load(urllib.request.urlopen(request))
except Exception:
    page = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list"))[0]
ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=10)
send(ws, "Runtime.enable")
send(ws, "Page.enable")
send(ws, "Input.enable")
send(ws, "Page.navigate", {"url": PREVIEW})
time.sleep(2)

rects = send(ws, "Runtime.evaluate", {"expression": "(() => { const b = document.querySelector('button.category-menu'); const r = b?.getBoundingClientRect(); return r ? {x:r.x, y:r.y, width:r.width, height:r.height} : null; })()", "returnByValue": True})["result"]["result"].get("value")
if not rects:
    raise RuntimeError("Categories trigger was not found")

x = rects["x"] + min(rects["width"] - 20, rects["width"] / 2)
y = rects["y"] + rects["height"] / 2
send(ws, "Input.dispatchMouseEvent", {"type": "mouseMoved", "x": x, "y": y})
time.sleep(0.2)
menu = send(ws, "Runtime.evaluate", {"expression": "document.querySelector('.mega-menu-cascading')?.getBoundingClientRect() ? (() => { const r=document.querySelector('.mega-menu-cascading').getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height}; })() : null", "returnByValue": True})["result"]["result"].get("value")
if not menu:
    raise RuntimeError("Cascading panel did not open from pointer hover")

states = []
def record(label):
    value = send(ws, "Runtime.evaluate", {"expression": "({label:" + json.dumps(label) + ", open:!!document.querySelector('.mega-menu-cascading'), active:document.querySelector('.mega-menu-main-item.is-active')?.textContent?.trim() || null})", "returnByValue": True})["result"]["result"].get("value")
    states.append(value)

record("trigger")
# Traverse the exact vertical gap between trigger and panel, then enter the panel.
for target_y, label in [
    (rects["y"] + rects["height"] + 2, "bridge"),
    (menu["y"] + 4, "panel-edge"),
    (menu["y"] + 36, "panel-content"),
]:
    send(ws, "Input.dispatchMouseEvent", {"type": "mouseMoved", "x": min(x, menu["x"] + 18), "y": target_y})
    time.sleep(0.2)
    record(label)

print(json.dumps({"states": states, "trigger": rects, "panel": menu}, ensure_ascii=False, indent=2))
ws.close()
