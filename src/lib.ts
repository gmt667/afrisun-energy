import { useEffect, useState } from "react";
export async function api<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  if (!res.headers.get("content-type")?.includes("application/json")) {
    throw new Error(
      "The service is temporarily unavailable. Please try again shortly.",
    );
  }
  const result = await res.json();
  if (!res.ok)
    throw new Error(result.error || "Something went wrong. Please try again.");
  return result as T;
}
export function useApi<T>(url: string, initial: T) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api<T>(url, { signal: controller.signal })
      .then((value) => {
        if (!controller.signal.aborted) setData(value);
      })
      .catch((e) => {
        if (!controller.signal.aborted && e.name !== "AbortError")
          setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [url]);
  return { data, loading, error, setData };
}
export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
export const readingTime = (text: string) =>
  Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
