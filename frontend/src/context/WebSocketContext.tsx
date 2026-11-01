import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

interface WebSocketContextType {
  isConnected: boolean;
  subscribe: (topic: string) => void;
  unsubscribe: (topic: string) => void;
  sendChannelMessage: (channelId: number, content: string) => void;
  sendDirectMessage: (conversationId: number, content: string) => void;
  addListener: (event: string, callback: (data: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const addListener = (event: string, callback: (data: any) => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)?.add(callback);

    return () => {
      listenersRef.current.get(event)?.delete(callback);
    };
  };

  useEffect(() => {
    if (!token || !user) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // proxied by Vite in dev to 127.0.0.1:8000
    
    let wsUrl = `${protocol}//${host}/ws?token=${token}`;
    if (import.meta.env.VITE_WS_URL) {
      wsUrl = `${import.meta.env.VITE_WS_URL.replace(/\/+$/, '')}?token=${token}`;
    } else if (import.meta.env.VITE_API_URL) {
      const apiHost = import.meta.env.VITE_API_URL.replace(/^http/, 'ws').replace(/\/+$/, '');
      wsUrl = `${apiHost}/ws?token=${token}`;
    }


    if (!import.meta.env.VITE_WS_URL && !import.meta.env.VITE_API_URL && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      wsUrl = `wss://rmvs-backend.onrender.com/ws?token=${token}`;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const action = data.action;
        if (action && listenersRef.current.has(action)) {
          listenersRef.current.get(action)?.forEach((cb) => cb(data));
        }
        // Also trigger generic 'all' listener
        if (listenersRef.current.has('*')) {
          listenersRef.current.get('*')?.forEach((cb) => cb(data));
        }
      } catch (e) {
        console.error('Error parsing WS message:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [token, user]);

  const subscribe = (topic: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'subscribe', topic }));
    }
  };

  const unsubscribe = (topic: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: 'unsubscribe', topic }));
    }
  };

  const sendChannelMessage = (channelId: number, content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: 'channel_message',
          channel_id: channelId,
          content,
        })
      );
    }
  };

  const sendDirectMessage = (conversationId: number, content: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          action: 'dm_message',
          conversation_id: conversationId,
          content,
        })
      );
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        subscribe,
        unsubscribe,
        sendChannelMessage,
        sendDirectMessage,
        addListener,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
