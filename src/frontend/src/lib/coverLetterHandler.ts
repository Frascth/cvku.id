// src/lib/coverLetterHandler.ts

// GANTI sesuai nama canister di dfx.json:
// import { cover_letter_service } from "../../../declarations/cover_letter_service";
import { coverleter_service } from "../../../declarations/coverleter_service";

export type CoverLetterBuilder = {
  recipientName: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  tone: string;
};

export type CoverLetterEditor = {
  introduction: string;
  body: string;
  conclusion: string;
};

const unopt = <T,>(v: any): T | null =>
  Array.isArray(v) ? (v.length ? (v[0] as T) : null) : ((v ?? null) as T | null);

// === Generate (LLM) ===
export async function generateCoverLetterViaCanister(
  builder: CoverLetterBuilder
): Promise<CoverLetterEditor | null> {
  try {
    // GANTI juga di sini kalau pakai cover_letter_service
    const res = await coverleter_service.generateCoverLetter(builder);
    return unopt<CoverLetterEditor>(res);
  } catch (e) {
    console.error("generateCoverLetterViaCanister error:", e);
    return null;
  }
}

// === CRUD (opsional, tapi sudah siap dipakai) ===
export async function createCoverLetter(
  builder: CoverLetterBuilder
): Promise<bigint> {
  // Nat (Motoko) -> bigint (TS)
  return /* cover_letter_service */ coverleter_service.createCoverLetter(builder);
}

export async function getCoverLetter(id: bigint): Promise<{
  id: bigint;
  builder: CoverLetterBuilder;
  editor: CoverLetterEditor;
} | null> {
  const res = await /* cover_letter_service */ coverleter_service.getCoverLetter(id);
  return unopt(res);
}

export async function updateCoverLetter(
  id: bigint,
  editor: CoverLetterEditor
): Promise<{
  id: bigint;
  builder: CoverLetterBuilder;
  editor: CoverLetterEditor;
} | null> {
  const res = await /* cover_letter_service */ coverleter_service.updateCoverLetter(id, editor);
  return unopt(res);
}

// === Helper praktis: create-or-update (save draft) ===
export async function saveDraft(
  currentId: bigint | null,
  builder: CoverLetterBuilder,
  editor: CoverLetterEditor
): Promise<bigint> {
  if (currentId == null) {
    const id = await createCoverLetter(builder);
    await updateCoverLetter(id, editor);
    return id;
  } else {
    await updateCoverLetter(currentId, editor);
    return currentId;
  }
}
