import { useCallback, useEffect, useRef, useState } from 'react';

const useSignaling = ({
  url,
  onSignal,
  onOpen,
  onClose,
  onError,
} = {}) => {
  const socketRef = useRef(null);
  const onSignalRef = useRef(onSignal);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  const [signalingState, setSignalingState] = useState('idle');

  useEffect(() => {
    onSignalRef.current = onSignal;
  }, [onSignal]);

  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!url) {
      setSignalingState('idle');
      return undefined;
    }

    if (typeof WebSocket === 'undefined') {
      setSignalingState('unsupported');
      return undefined;
    }

    const socket = new WebSocket(url);
    socketRef.current = socket;
    setSignalingState('connecting');

    const handleOpen = () => {
      setSignalingState('connected');
      if (onOpenRef.current) {
        onOpenRef.current();
      }
    };

    const handleClose = (event) => {
      setSignalingState('closed');
      if (onCloseRef.current) {
        onCloseRef.current(event);
      }
    };

    const handleError = (event) => {
      setSignalingState('error');
      if (onErrorRef.current) {
        onErrorRef.current(event);
      }
    };

    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (onSignalRef.current) {
          onSignalRef.current(message);
        }
      } catch (error) {
        if (onErrorRef.current) {
          onErrorRef.current(error);
        }
      }
    };

    socket.addEventListener('open', handleOpen);
    socket.addEventListener('close', handleClose);
    socket.addEventListener('error', handleError);
    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('open', handleOpen);
      socket.removeEventListener('close', handleClose);
      socket.removeEventListener('error', handleError);
      socket.removeEventListener('message', handleMessage);
      socket.close();
      socketRef.current = null;
    };
  }, [url]);

  const sendSignal = useCallback((payload) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      socket.send(JSON.stringify(payload));
      return true;
    } catch (error) {
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
      return false;
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setSignalingState('closed');
    }
  }, []);

  return {
    socketRef,
    signalingState,
    sendSignal,
    disconnect,
  };
};

export default useSignaling;
