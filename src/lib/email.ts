import "server-only";

/**
 * Provider-agnostic email sending. Uses a Resend-compatible HTTP API when
 * EMAIL_API_KEY is set; otherwise returns { sent: false } so callers can fall
 * back to copyable invite links.
 */
export async function sendInviteEmail(to: string, inviteUrl: string) {
  const apiKey = process.env.EMAIL_API_KEY;
  const from = process.env.EMAIL_FROM || "Melow <portal@melow.ai>";
  if (!apiKey) {
    console.log(`[email] EMAIL_API_KEY not set — invite link for ${to}: ${inviteUrl}`);
    return { sent: false as const, reason: "Email is not configured. Copy the invite link instead." };
  }

  const body = [
    "Hi,",
    "",
    "You’ve been invited to access Melow’s private Investor & Advisor Intro Portal.",
    "",
    "You can use it to view Melow materials, understand target accounts, and copy intro blurbs.",
    "",
    "Accept your invite here:",
    inviteUrl,
    "",
    "Best,",
    "The Melow Team",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "You’ve been invited to Melow’s Investor & Advisor Intro Portal",
      text: body,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error(`[email] send failed (${res.status}): ${detail}`);
    return { sent: false as const, reason: "Email provider rejected the request. Copy the invite link instead." };
  }
  return { sent: true as const };
}
