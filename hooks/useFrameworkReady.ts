import { useEffect } from 'react';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // Use globalThis to be safe across web and native; guard for undefined
    const globalObj: any = typeof globalThis !== 'undefined' ? (globalThis as any) : undefined;
    if (globalObj && typeof globalObj.frameworkReady === 'function') {
      globalObj.frameworkReady();
    }
  });
}
