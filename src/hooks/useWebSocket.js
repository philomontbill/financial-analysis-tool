import { useEffect, useRef, useState, useCallback } from 'react';

const useWebSocket = (url, options = {}) => {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
    reconnectInterval = 5000,
    reconnectAttempts = 5,
  } = options;

  const ws = useRef(null);
  const reconnectCount = useRef(0);
  const reconnectTimeout = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = (event) => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectCount.current = 0;
        
        if (onOpen) {
          onOpen(event);
        }
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        
        if (onMessage) {
          onMessage(data);
        }
      };

      ws.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        
        if (onError) {
          onError(event);
        }
      };

      ws.current.onclose = (event) => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        if (onClose) {
          onClose(event);
        }

        // Attempt to reconnect
        if (reconnect && reconnectCount.current < reconnectAttempts) {
          reconnectCount.current++;
          console.log(`Reconnecting... Attempt ${reconnectCount.current}`);
          
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, reconnectInterval * reconnectCount.current);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [url, onMessage, onOpen, onClose, onError, reconnect, reconnectInterval, reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect: connect
  };
};

export default useWebSocket;
