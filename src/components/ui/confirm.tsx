"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export type ConfirmOptions = {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
};

type Pending = ConfirmOptions & { resolve: (value: boolean) => void };

let showFn: ((options: ConfirmOptions) => Promise<boolean>) | null = null;

/**
 * Confirmation stylée (remplace window.confirm natif).
 * À utiliser avec await : `if (!(await confirmAction({ message }))) return;`
 */
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  if (showFn) return showFn(options);
  // Repli si ConfirmHost n'est pas monté (ne devrait jamais arriver) .
  if (typeof window !== "undefined") return Promise.resolve(window.confirm(options.message));
  return Promise.resolve(false);
}

export function ConfirmHost() {
  const [pending, setPending] = useState<Pending | null>(null);

  useEffect(() => {
    showFn = (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setPending({ ...options, resolve }));
    return () => {
      showFn = null;
    };
  }, []);

  const close = useCallback((value: boolean) => {
    setPending((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  return (
    <Modal
      isOpen={!!pending}
      onClose={() => close(false)}
      title={pending?.title ?? "Confirmation"}
    >
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {pending?.message}
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => close(false)}>
          {pending?.cancelLabel ?? "Annuler"}
        </Button>
        <Button
          variant={pending?.danger === false ? "primary" : "danger"}
          className="flex-1"
          onClick={() => close(true)}
        >
          {pending?.confirmLabel ?? "Confirmer"}
        </Button>
      </div>
    </Modal>
  );
}
