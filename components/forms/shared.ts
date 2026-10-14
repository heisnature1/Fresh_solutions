"use client";

export type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | {
      status: "success";
      message?: string;
      reference?: string;
      accessCode?: string;
      data?: Record<string, unknown>;
    };

/** Attach the honeypot + origin signal every submission carries. */
function injectBase(data: Record<string, unknown>): Record<string, unknown> {
  if (typeof document !== "undefined") {
    const hp = document.querySelector<HTMLInputElement>('input[name="website"]');
    if (hp && data.website === undefined) data.website = hp.value || "";
  }
  return data;
}

export async function postJson(url: string, body: Record<string, unknown>): Promise<SubmitState> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(injectBase({ ...body })),
    });
    const json = (await res.json().catch(() => null)) as
      | { ok?: boolean; error?: string; fieldErrors?: Record<string, string>; [k: string]: unknown }
      | null;
    if (res.ok && json?.ok) {
      const { ok, error: _e, fieldErrors: _f, ...rest } = json;
      return { status: "success", data: rest, reference: rest.reference as string | undefined };
    }
    return {
      status: "error",
      message: json?.error || `Something went wrong (${res.status}). Please try again.`,
      fieldErrors: json?.fieldErrors,
    };
  } catch {
    return { status: "error", message: "Network error — please check your connection and try again." };
  }
}

export async function postFormData(url: string, formData: FormData): Promise<SubmitState> {
  try {
    const res = await fetch(url, { method: "POST", body: formData });
    const json = (await res.json().catch(() => null)) as
      | { ok?: boolean; error?: string; fieldErrors?: Record<string, string>; [k: string]: unknown }
      | null;
    if (res.ok && json?.ok) {
      const { ok, error: _e, fieldErrors: _f, ...rest } = json;
      return {
        status: "success",
        data: rest,
        reference: rest.reference as string | undefined,
        accessCode: rest.accessCode as string | undefined,
      };
    }
    return {
      status: "error",
      message: json?.error || `Something went wrong (${res.status}). Please try again.`,
      fieldErrors: json?.fieldErrors,
    };
  } catch {
    return { status: "error", message: "Network error — please check your connection and try again." };
  }
}
