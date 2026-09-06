import json
import time
import urllib.request
import websocket

BASE = "https://3000-iwkosjarrhs5cosyi2dp1-1a176733.us1.manus.computer/"


def send(ws, method, params=None, ident=[0]):
    ident[0] += 1
    ws.send(json.dumps({"id": ident[0], "method": method, "params": params or {}}))
    while True:
        message = json.loads(ws.recv())
        if message.get("id") == ident[0]:
            return message


def trace(url, main_tabs):
    request = urllib.request.Request("http://127.0.0.1:9223/json/new?" + url, method="PUT")
    try:
        page = json.load(urllib.request.urlopen(request))
    except Exception:
        page = json.load(urllib.request.urlopen("http://127.0.0.1:9223/json/list"))[0]
    ws = websocket.create_connection(page["webSocketDebuggerUrl"], timeout=10)
    send(ws, "Runtime.enable")
    send(ws, "Page.enable")
    send(ws, "Page.navigate", {"url": url})
    time.sleep(2)

    def active():
        result = send(ws, "Runtime.evaluate", {"expression": "({text: document.activeElement?.textContent?.trim() || '', className: document.activeElement?.className || ''})", "returnByValue": True})
        return result["result"]["result"].get("value", {})

    send(ws, "Runtime.evaluate", {"expression": "document.querySelector('button.category-menu')?.focus()"})
    trace_items = [active()]
    send(ws, "Input.dispatchKeyEvent", {"type": "keyDown", "key": "Tab", "code": "Tab", "windowsVirtualKeyCode": 9, "nativeVirtualKeyCode": 9})
    send(ws, "Input.dispatchKeyEvent", {"type": "keyUp", "key": "Tab", "code": "Tab", "windowsVirtualKeyCode": 9, "nativeVirtualKeyCode": 9})
    time.sleep(0.2)
    trace_items.append(active())
    for _ in range(main_tabs - 1):
        send(ws, "Input.dispatchKeyEvent", {"type": "keyDown", "key": "Tab", "code": "Tab", "windowsVirtualKeyCode": 9, "nativeVirtualKeyCode": 9})
        send(ws, "Input.dispatchKeyEvent", {"type": "keyUp", "key": "Tab", "code": "Tab", "windowsVirtualKeyCode": 9, "nativeVirtualKeyCode": 9})
        time.sleep(0.2)
        trace_items.append(active())
    send(ws, "Input.dispatchKeyEvent", {"type": "keyDown", "key": "ArrowRight", "code": "ArrowRight", "windowsVirtualKeyCode": 39, "nativeVirtualKeyCode": 39})
    send(ws, "Input.dispatchKeyEvent", {"type": "keyUp", "key": "ArrowRight", "code": "ArrowRight", "windowsVirtualKeyCode": 39, "nativeVirtualKeyCode": 39})
    time.sleep(0.3)
    trace_items.append(active())
    ws.close()
    return trace_items

print(json.dumps({"hdc": trace(BASE + "?surface=keyboard", 1), "ldc": trace(BASE + "?surface=keyboard-ldc", 2)}, ensure_ascii=False, indent=2))
