import { UnauthorizedError } from "@/lib/api";

/** Holds the outcome of a single widget's data fetch. */
export type PartialResult<T> = {
  data: T;
  error: string | null;
};

/**
 * Wraps a data-fetch function so that any thrown error is captured instead of
 * propagating. On failure the widget receives its fallback value plus a
 * human-readable French error message — preserving partial-failure tolerance
 * while giving the UI something concrete to show.
 *
 * @example
 *   const { data: quotes, error: quotesError } = await fetchSafe(
 *     () => getQuotes(token),
 *     [],
 *     "Propositions",
 *   );
 */
export async function fetchSafe<T>(
  fn: () => Promise<T>,
  fallback: T,
  label: string,
): Promise<PartialResult<T>> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (e) {
    const isAuth = e instanceof UnauthorizedError;
    console.error(`[dashboard] ${label}:`, isAuth ? "401 Unauthorized" : e);
    return {
      data: fallback,
      error: isAuth
        ? "Session expirée — reconnectez-vous."
        : `${label} indisponible pour le moment.`,
    };
  }
}
