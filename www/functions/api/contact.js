import { EmailMessage } from "cloudflare:email";

const DEFAULT_RECIPIENT = "dtozturk02@gmail.com";
const DEFAULT_SENDER = "contact@foxguard.dev";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function cleanHeader(value) {
  return String(value || "")
    .replace(/[\r\n]+/g, " ")
    .trim();
}

function cleanBody(value) {
  return String(value || "").replace(/\r\n/g, "\n").trim();
}

function buildRawEmail({ from, to, replyTo, subject, text }) {
  return [
    `From: foxguard.dev <${from}>`,
    `To: ${to}`,
    `Reply-To: ${replyTo}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
  ].join("\r\n");
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.CONTACT_EMAIL || typeof env.CONTACT_EMAIL.send !== "function") {
    return json({ error: "Contact email binding is not configured." }, 500);
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return json({ error: "Invalid form submission." }, 400);
  }

  const website = cleanBody(formData.get("website"));
  if (website) {
    return json({ ok: true });
  }

  const name = cleanBody(formData.get("name"));
  const email = cleanBody(formData.get("email"));
  const message = cleanBody(formData.get("message"));

  if (!name || !email || !message) {
    return json({ error: "Name, email, and message are required." }, 400);
  }

  if (name.length > 120 || email.length > 320 || message.length > 5000) {
    return json({ error: "Contact submission is too large." }, 400);
  }

  const replyTo = cleanHeader(email);
  const subject = cleanHeader(`foxguard.dev contact from ${name}`);
  const recipient = cleanHeader(env.CONTACT_RECIPIENT || DEFAULT_RECIPIENT);
  const sender = cleanHeader(env.CONTACT_SENDER || DEFAULT_SENDER);

  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    "",
    message,
  ].join("\n");

  const raw = buildRawEmail({
    from: sender,
    to: recipient,
    replyTo,
    subject,
    text,
  });

  const emailMessage = new EmailMessage(
    sender,
    recipient,
    new TextEncoder().encode(raw),
  );

  try {
    await env.CONTACT_EMAIL.send(emailMessage);
  } catch (error) {
    return json(
      {
        error: "Failed to send email.",
        detail: error instanceof Error ? error.message : "unknown error",
      },
      502,
    );
  }

  return json({ ok: true });
}
