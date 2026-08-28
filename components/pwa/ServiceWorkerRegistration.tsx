"use client";

import { useEffect, useRef, useState } from "react";

export default function ServiceWorkerRegistration({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const refreshing = useRef(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let registration: ServiceWorkerRegistration | undefined;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        registration?.update().catch(() => {});
      }
    };

    const handleControllerChange = () => {
      // Reload once when the new SW takes over (guard against loops)
      if (refreshing.current) return;
      refreshing.current = true;
      window.location.reload();
    };

    const trackInstalling = (worker: ServiceWorker | null) => {
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        // "installed" with an existing controller means an update is waiting;
        // without a controller it's the first install (no prompt needed)
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          setWaitingWorker(worker);
        }
      });
    };

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        if (registration.waiting && navigator.serviceWorker.controller) {
          setWaitingWorker(registration.waiting);
        }
        trackInstalling(registration.installing);
        registration.addEventListener("updatefound", () => {
          trackInstalling(registration?.installing ?? null);
        });
      } catch (error) {
        console.error("[SW] Service Worker registration failed:", error);
      }
    };

    register();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );
    };
  }, []);

  const applyUpdate = () => {
    if (!waitingWorker) return;
    setIsUpdating(true);
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  };

  return (
    <>
      {children}
      {waitingWorker && (
        <div className="toast toast-bottom toast-center z-[100]">
          <div className="alert bg-base-100 border border-base-300 shadow-lg">
            <span className="text-sm font-medium">
              A new version of Tasbihfy is available
            </span>
            <button
              className="btn btn-primary btn-sm"
              onClick={applyUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                "Refresh"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
