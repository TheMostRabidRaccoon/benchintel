import { getStore } from "@netlify/blobs";

const STORE_NAME = "passkeys";
const INDEX_KEY = "_index";
const MAX_LOG_ENTRIES = 100;

async function getPasskeyStore() {
  return getStore(STORE_NAME);
}

/**
 * Validate a passkey. Returns { valid, record, reason }.
 * Does NOT increment usage -- call recordUsage() separately after a successful search.
 */
export async function validatePasskey(passkey) {
  if (!passkey || passkey.trim().length < 4) {
    return { valid: false, reason: "Invalid access code format." };
  }

  const store = await getPasskeyStore();
  const raw = await store.get(passkey, { type: "json" });

  if (!raw) {
    return { valid: false, reason: "Access code not recognized." };
  }

  if (raw.revoked) {
    return { valid: false, reason: "This access code has been revoked." };
  }

  if (raw.expiresAt && new Date(raw.expiresAt) < new Date()) {
    return { valid: false, reason: "This access code has expired." };
  }

  if (raw.usedCount >= raw.maxUses) {
    return { valid: false, reason: "This access code has reached its usage limit." };
  }

  return { valid: true, record: raw };
}

/**
 * Record a search against a passkey. Increments usedCount and appends to log.
 */
export async function recordUsage(passkey, searchDetails) {
  const store = await getPasskeyStore();
  const raw = await store.get(passkey, { type: "json" });
  if (!raw) return;

  raw.usedCount = (raw.usedCount || 0) + 1;
  raw.lastUsedAt = new Date().toISOString();

  const logEntry = {
    ts: raw.lastUsedAt,
    judge: searchDetails.judge || "",
    court: searchDetails.court || "",
  };

  if (!raw.log) raw.log = [];
  raw.log.push(logEntry);

  // Keep only last MAX_LOG_ENTRIES
  if (raw.log.length > MAX_LOG_ENTRIES) {
    raw.log = raw.log.slice(-MAX_LOG_ENTRIES);
  }

  await store.setJSON(passkey, raw);
}

/**
 * Create a new passkey.
 */
export async function createPasskey(passkey, { label, email, maxUses, expiresAt }) {
  const store = await getPasskeyStore();

  const existing = await store.get(passkey, { type: "json" });
  if (existing) {
    return { ok: false, message: "Passkey already exists." };
  }

  const record = {
    label: label || "",
    email: email || "",
    maxUses: maxUses || 25,
    usedCount: 0,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
    revoked: false,
    expiresAt: expiresAt || null,
    log: [],
  };

  await store.setJSON(passkey, record);

  // Update index
  let index = (await store.get(INDEX_KEY, { type: "json" })) || [];
  if (!index.includes(passkey)) {
    index.push(passkey);
    await store.setJSON(INDEX_KEY, index);
  }

  return { ok: true, passkey, record };
}

/**
 * List all passkeys (summary view, no full logs).
 */
export async function listPasskeys() {
  const store = await getPasskeyStore();
  const index = (await store.get(INDEX_KEY, { type: "json" })) || [];

  const summaries = [];
  for (const key of index) {
    const raw = await store.get(key, { type: "json" });
    if (raw) {
      summaries.push({
        passkey: key,
        label: raw.label,
        email: raw.email,
        maxUses: raw.maxUses,
        usedCount: raw.usedCount,
        createdAt: raw.createdAt,
        lastUsedAt: raw.lastUsedAt,
        revoked: raw.revoked,
        expiresAt: raw.expiresAt,
        remaining: raw.maxUses - raw.usedCount,
      });
    }
  }

  return summaries;
}

/**
 * Get full passkey details including usage log.
 */
export async function getPasskeyDetail(passkey) {
  const store = await getPasskeyStore();
  return await store.get(passkey, { type: "json" });
}

/**
 * Revoke a passkey.
 */
export async function revokePasskey(passkey) {
  const store = await getPasskeyStore();
  const raw = await store.get(passkey, { type: "json" });
  if (!raw) return { ok: false, message: "Passkey not found." };

  raw.revoked = true;
  await store.setJSON(passkey, raw);
  return { ok: true };
}

/**
 * Delete a passkey entirely.
 */
export async function deletePasskey(passkey) {
  const store = await getPasskeyStore();
  await store.delete(passkey);

  // Update index
  let index = (await store.get(INDEX_KEY, { type: "json" })) || [];
  index = index.filter(k => k !== passkey);
  await store.setJSON(INDEX_KEY, index);

  return { ok: true };
}

/**
 * Generate a random passkey string like "BENCH-BAKER-7X3M"
 */
export function generatePasskeyString(label) {
  const slug = (label || "DEMO").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BENCH-${slug}-${rand}`;
}
