'use client';

import { useEffect, useState } from 'react';

export default function ForceUpdatePage() {
  const [status, setStatus] = useState('Starting update process...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    const forceUpdate = async () => {
      try {
        addLog('Starting force update process...');
        setStatus('Checking for service workers...');

        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) {
          addLog('Service workers not supported');
          setStatus('Service workers not supported on this device');
          return;
        }

        // Get all service worker registrations
        const registrations = await navigator.serviceWorker.getRegistrations();
        addLog(`Found ${registrations.length} service worker(s)`);

        // Unregister all service workers
        for (const registration of registrations) {
          addLog(`Unregistering service worker: ${registration.scope}`);
          await registration.unregister();
          addLog('✓ Service worker unregistered');
        }

        setStatus('Clearing all caches...');

        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          addLog(`Found ${cacheNames.length} cache(s)`);

          for (const cacheName of cacheNames) {
            addLog(`Deleting cache: ${cacheName}`);
            await caches.delete(cacheName);
            addLog('✓ Cache deleted');
          }
        }

        // Clear localStorage
        setStatus('Clearing local storage...');
        const localStorageSize = localStorage.length;
        addLog(`Clearing ${localStorageSize} localStorage items`);
        localStorage.clear();
        addLog('✓ localStorage cleared');

        // Clear sessionStorage
        setStatus('Clearing session storage...');
        const sessionStorageSize = sessionStorage.length;
        addLog(`Clearing ${sessionStorageSize} sessionStorage items`);
        sessionStorage.clear();
        addLog('✓ sessionStorage cleared');

        // Clear IndexedDB (if needed)
        setStatus('Clearing IndexedDB...');
        const databases = await indexedDB.databases?.() || [];
        addLog(`Found ${databases.length} IndexedDB database(s)`);

        for (const db of databases) {
          if (db.name) {
            addLog(`Deleting IndexedDB: ${db.name}`);
            indexedDB.deleteDatabase(db.name);
            addLog('✓ IndexedDB deleted');
          }
        }

        setStatus('✅ Update complete! Reloading in 3 seconds...');
        addLog('All caches and service workers cleared successfully!');
        addLog('Page will reload in 3 seconds...');

        // Reload the page after a delay
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);

      } catch (error) {
        console.error('Error during force update:', error);
        setStatus('❌ Error during update');
        addLog(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    forceUpdate();
  }, []);

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl mb-4">🔄 Force Update</h1>

            <div className="alert alert-warning mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>This will clear all app data and force a complete refresh!</span>
            </div>

            <div className="mb-4">
              <div className="text-lg font-semibold mb-2">Status:</div>
              <div className={`text-base ${status.includes('✅') ? 'text-success' : status.includes('❌') ? 'text-error' : 'text-info'}`}>
                {status}
              </div>
            </div>

            <div className="mb-4">
              <div className="text-lg font-semibold mb-2">Process Log:</div>
              <div className="bg-base-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs font-mono">
                  {logs.map((log, i) => (
                    <div key={i} className={log.includes('✓') ? 'text-success' : log.includes('Error') ? 'text-error' : ''}>
                      {log}
                    </div>
                  ))}
                </pre>
              </div>
            </div>

            <div className="alert alert-info">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>
                This page automatically clears all caches and service workers to force the app to update to the latest version.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}