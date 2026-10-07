import net from "node:net";
import tls from "node:tls";

export interface SmtpSendOptions {
  host: string;
  port?: number;
  secure?: boolean; // true for 465 (direct TLS), false for 587 (STARTTLS) or 25
  user?: string;
  pass?: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Lightweight, zero-dependency SMTP client built natively on Node.js net/tls sockets.
 * Supports SMTPS (port 465) and STARTTLS (port 587), AUTH LOGIN, and multipart HTML/text.
 */
export async function sendViaNativeSmtp(options: SmtpSendOptions): Promise<void> {
  const {
    host,
    port = 465,
    secure = port === 465,
    user,
    pass,
    from,
    to,
    subject,
    text,
    html,
  } = options;

  return new Promise<void>((resolve, reject) => {
    let socket: net.Socket | tls.TLSSocket;
    let step = 0;
    let buffer = "";
    let isTlsUpgraded = false;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error(`SMTP connection timed out after 20 seconds while talking to ${host}:${port}`));
    }, 20000);

    function cleanup() {
      clearTimeout(timeout);
      try {
        socket.removeAllListeners();
        socket.destroy();
      } catch {
        // ignore
      }
    }

    function sendCommand(cmd: string) {
      if (socket.writable) {
        socket.write(cmd + "\r\n");
      }
    }

    function handleResponse(response: string) {
      const code = parseInt(response.slice(0, 3), 10);
      if (isNaN(code)) return;

      // Check if multi-line response (e.g. 250-...)
      const lines = response.trim().split("\r\n");
      const lastLine = lines[lines.length - 1] || "";
      if (lastLine.length >= 4 && lastLine[3] === "-") {
        // More lines expected
        return;
      }

      if (code >= 400) {
        cleanup();
        reject(new Error(`SMTP Error [${code}] from ${host}: ${response.trim()}`));
        return;
      }

      // State machine for SMTP transmission
      if (step === 0 && code === 220) {
        // Connected, send EHLO
        step = 1;
        sendCommand("EHLO localhost");
      } else if (step === 1 && code === 250) {
        if (!secure && !isTlsUpgraded && (port === 587 || port === 25)) {
          // Send STARTTLS
          step = 2;
          sendCommand("STARTTLS");
        } else if (user && pass) {
          step = 4;
          sendCommand("AUTH LOGIN");
        } else {
          step = 7;
          sendCommand(`MAIL FROM:<${from}>`);
        }
      } else if (step === 2 && code === 220) {
        // STARTTLS accepted, upgrade socket to TLS
        isTlsUpgraded = true;
        const plainSocket = socket;
        plainSocket.removeAllListeners("data");

        const tlsSocket = tls.connect({
          socket: plainSocket,
          host,
          servername: host,
          rejectUnauthorized: false,
        });

        socket = tlsSocket;
        attachListeners(tlsSocket);

        // After TLS handshake, re-send EHLO
        step = 3;
        sendCommand("EHLO localhost");
      } else if (step === 3 && code === 250) {
        if (user && pass) {
          step = 4;
          sendCommand("AUTH LOGIN");
        } else {
          step = 7;
          sendCommand(`MAIL FROM:<${from}>`);
        }
      } else if (step === 4 && code === 334) {
        // Server asks for username
        step = 5;
        sendCommand(Buffer.from(user || "").toString("base64"));
      } else if (step === 5 && code === 334) {
        // Server asks for password
        step = 6;
        sendCommand(Buffer.from(pass || "").toString("base64"));
      } else if (step === 6 && (code === 235 || code === 250)) {
        // Authenticated! Send MAIL FROM
        step = 7;
        sendCommand(`MAIL FROM:<${from}>`);
      } else if (step === 7 && code === 250) {
        // Mail from ok, send RCPT TO
        step = 8;
        sendCommand(`RCPT TO:<${to}>`);
      } else if (step === 8 && code === 250) {
        // Recipient accepted, request DATA
        step = 9;
        sendCommand("DATA");
      } else if (step === 9 && code === 354) {
        // Send email message
        step = 10;
        const boundary = `volamp_mime_${Date.now()}`;
        const message = [
          `From: "VOLAMP Elektrikals" <${from}>`,
          `To: <${to}>`,
          `Subject: ${subject}`,
          `Date: ${new Date().toUTCString()}`,
          `MIME-Version: 1.0`,
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          ``,
          `--${boundary}`,
          `Content-Type: text/plain; charset=UTF-8`,
          `Content-Transfer-Encoding: 7bit`,
          ``,
          text,
          ``,
          `--${boundary}`,
          `Content-Type: text/html; charset=UTF-8`,
          `Content-Transfer-Encoding: 7bit`,
          ``,
          html,
          ``,
          `--${boundary}--`,
          `.`,
        ].join("\r\n");

        socket.write(message + "\r\n");
      } else if (step === 10 && code === 250) {
        // Message queued/sent!
        step = 11;
        sendCommand("QUIT");
        cleanup();
        resolve();
      }
    }

    function attachListeners(s: net.Socket | tls.TLSSocket) {
      s.on("data", (chunk: Buffer) => {
        buffer += chunk.toString("utf8");
        // Look for end of line
        if (buffer.includes("\r\n")) {
          const currentBuffer = buffer;
          buffer = "";
          handleResponse(currentBuffer);
        }
      });

      s.on("error", (err: Error) => {
        cleanup();
        reject(new Error(`SMTP socket error connecting to ${host}:${port}: ${err.message}`));
      });

      s.on("close", () => {
        if (step < 10) {
          reject(new Error(`SMTP connection closed prematurely by ${host} during step ${step}`));
        }
      });
    }

    try {
      if (secure) {
        socket = tls.connect({
          host,
          port,
          servername: host,
          rejectUnauthorized: false,
        });
      } else {
        socket = net.connect({
          host,
          port,
        });
      }
      attachListeners(socket);
    } catch (err: any) {
      cleanup();
      reject(err);
    }
  });
}
