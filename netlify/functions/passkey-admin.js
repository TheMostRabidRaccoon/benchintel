import { connectLambda } from "@netlify/blobs";
import {
  createPasskey,
  listPasskeys,
  getPasskeyDetail,
  revokePasskey,
  deletePasskey,
  generatePasskeyString,
} from "./lib/passkeys.js";

const ADMIN_KEY = process.env.BENCHINTEL_ADMIN_KEY;

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  // Initialize Netlify Blobs context
  connectLambda(event);

  // Verify admin key
  const adminKey = event.headers["x-admin-key"];
  if (!ADMIN_KEY || adminKey !== ADMIN_KEY) {
    return jsonResponse(401, { ok: false, message: "Invalid admin key." });
  }

  const method = event.httpMethod;
  const params = event.queryStringParameters || {};
  const action = params.action;

  try {
    // GET /?action=list --> List all passkeys (summary)
    if (method === "GET" && action === "list") {
      const keys = await listPasskeys();
      return jsonResponse(200, { ok: true, passkeys: keys });
    }

    // GET /?action=detail&key=BENCH-XXX --> Full detail + usage log
    if (method === "GET" && action === "detail") {
      const detail = await getPasskeyDetail(params.key);
      if (!detail) {
        return jsonResponse(404, { ok: false, message: "Passkey not found" });
      }
      return jsonResponse(200, { ok: true, passkey: params.key, ...detail });
    }

    // POST /?action=create --> Create a new passkey
    if (method === "POST" && action === "create") {
      const body = JSON.parse(event.body || "{}");
      const key = body.passkey || generatePasskeyString(body.label);
      const result = await createPasskey(key, {
        label: body.label || "",
        email: body.email || "",
        maxUses: body.maxUses || 25,
        expiresAt: body.expiresAt || null,
      });
      return jsonResponse(result.ok ? 201 : 409, result);
    }

    // POST /?action=revoke&key=BENCH-XXX --> Revoke a passkey
    if (method === "POST" && action === "revoke") {
      const result = await revokePasskey(params.key);
      return jsonResponse(result.ok ? 200 : 404, result);
    }

    // DELETE /?action=delete&key=BENCH-XXX --> Delete a passkey
    if (method === "DELETE" && action === "delete") {
      const result = await deletePasskey(params.key);
      return jsonResponse(200, result);
    }

    return jsonResponse(400, { ok: false, message: "Unknown action. Use: list, detail, create, revoke, delete" });
  } catch (err) {
    return jsonResponse(500, { ok: false, message: err.message });
  }
}
