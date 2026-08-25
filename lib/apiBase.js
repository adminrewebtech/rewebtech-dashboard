/**
 * API ka base URL — poore app me ek hi jagah se.
 *
 * Default seedha live API hai, taaki koi env var set kiye bina bhi app chale.
 * Ismein chhupane jaisa kuch hai bhi nahi: yeh URL har browser request me
 * dikhta hai, secret nahi.
 *
 * `NEXT_PUBLIC_API_URL` set karo to woh jeet jaata hai — local dev me API ko
 * apni machine par chalane ke liye:
 *
 *   NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
 *
 * Yaad rahe `NEXT_PUBLIC_*` build ke waqt bundle me inline hota hai, runtime par
 * padha nahi jaata — value badalne ke baad rebuild zaroori hai.
 */
const DEFAULT_BASE = 'https://api.rewebtech.in/api/v1';

/** Trailing slash hata dete hain, warna har URL me `//` aa jaata hai. */
export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE).replace(/\/+$/, '');
