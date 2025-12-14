// src/hooks/useUnsavedChangesWarning.ts
import { useEffect } from 'react';

export function useUnsavedChangesWarning(shouldWarn: boolean) {
  useEffect(() => {
    if (!shouldWarn) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // 某些瀏覽器需要設定 returnValue 才會顯示提示
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);

    // 離開頁面或 shouldWarn 變成 false 時移除監聽
    return () => {
      window.removeEventListener('beforeunload', handler);
    };
  }, [shouldWarn]);
}
