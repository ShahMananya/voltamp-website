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
send(ws, "Page.navigate", {"url": PREVIEW})
time.sleep(2)


def evaluate(expression):
    return send(ws, "Runtime.evaluate", {"expression": expression, "returnByValue": True})["result"]["result"].get("value")


def click_text(text, selector="button"):
    expression = f"(() => {{ const el = [...document.querySelectorAll({json.dumps(selector)})].find((node) => node.textContent?.trim() === {json.dumps(text)}); if (!el) return false; el.click(); return true; }})()"
    if not evaluate(expression):
        raise RuntimeError(f"Could not click {text}")
    time.sleep(0.2)

if not evaluate("document.querySelector('button[aria-label=\\\"Open calculator\\\"]')?.click(), true"):
    raise RuntimeError("Calculator trigger was not found")
time.sleep(0.3)
state = [evaluate("({open:!!document.querySelector('.calculator-modal'), columns:document.querySelectorAll('.calculator-tree-column').length, mainButtons:document.querySelectorAll('.calculator-tree-column:first-child .calculator-tree-list button').length})")]
click_text("HDC (Heavy Duty Cable)")
state.append(evaluate("({category:document.querySelector('.calculator-selection-summary strong')?.textContent, subButtons:document.querySelectorAll('.calculator-tree-column:nth-child(2) .calculator-tree-list button').length})"))
click_text("LT Aluminium Arm Cable")
state.append(evaluate("({path:document.querySelector('.calculator-selection-summary strong')?.textContent, detailButtons:document.querySelectorAll('.calculator-tree-column:nth-child(3) .calculator-tree-list button').length})"))
click_text("LT Aluminium Arm Cable specification")
state.append(evaluate("({path:document.querySelector('.calculator-selection-summary strong')?.textContent, status:document.querySelector('.calculator-selection-summary > span')?.textContent})"))
initial_total = evaluate("document.querySelector('.calculator-total b')?.textContent")
for input_id, value in [("calculator-quantity", "250"), ("calculator-discount", "12")]:
    expression = f"(() => {{ const input = document.getElementById({json.dumps(input_id)}); if (!input) return false; const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; setter.call(input, {json.dumps(value)}); input.dispatchEvent(new Event('input', {{ bubbles: true }})); return true; }})()"
    if not evaluate(expression):
        raise RuntimeError(f"Could not update {input_id}")
    time.sleep(0.2)
updated_total = evaluate("document.querySelector('.calculator-total b')?.textContent")
style_state = evaluate("({htmlClass:document.documentElement.className, modalBackground:getComputedStyle(document.querySelector('.calculator-modal')).backgroundColor, modalText:getComputedStyle(document.querySelector('.calculator-modal')).color, pageBackground:getComputedStyle(document.querySelector('.volamp-marketplace')).backgroundColor})")
print(json.dumps({"states": state, "initialTotal": initial_total, "updatedTotal": updated_total, "style": style_state}, ensure_ascii=False, indent=2))
ws.close()
