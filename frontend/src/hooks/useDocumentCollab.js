import { useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { getToken } from '../lib/api.js';

const COLORS = ['#f783ac', '#74c0fc', '#63e6be', '#ffd43b', '#ff8787', '#a9e34b'];

function pickColor(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function useDocumentCollab(docId, username) {
  const ydocRef = useRef(null);
  const providerRef = useRef(null);

  if (!ydocRef.current) {
    ydocRef.current = new Y.Doc();
  }

  if (!providerRef.current && docId && username) {
    const token = getToken();
    const provider = new HocuspocusProvider({
      url: 'ws://localhost:1234',
      name: `doc-${docId}`,
      document: ydocRef.current,
      token: token ?? undefined,
      connect: false,
    });
    provider.setAwarenessField('user', {
      name: username,
      color: pickColor(username),
    });
    providerRef.current = provider;
  }

  useEffect(() => {
    if (!providerRef.current) return;
    providerRef.current.connect();
    return () => {
      providerRef.current?.destroy();
      providerRef.current = null;
    };
  }, [docId, username]);

  return {
    ydoc: ydocRef.current,
    provider: providerRef.current,
    user: username ? { name: username, color: pickColor(username) } : null,
  };
}
