import { useCallback, useEffect, useRef, useState } from 'react';

const useDataChannel = ({
  peerConnectionRef,
  channelLabel = 'p2p',
  channelOptions = {},
  isInitiator = false,
  onMessage,
  onOpen,
  onClose,
  onError,
} = {}) => {
  const channelRef = useRef(null);
  const channelOptionsRef = useRef(channelOptions);
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);

  const [channelState, setChannelState] = useState('closed');

  useEffect(() => {
    channelOptionsRef.current = channelOptions;
  }, [channelOptions]);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

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
    const peerConnection = peerConnectionRef?.current;
    if (!peerConnection) {
      return undefined;
    }

    const handleOpen = () => {
      setChannelState('open');
      if (onOpenRef.current) {
        onOpenRef.current();
      }
    };

    const handleClose = () => {
      setChannelState('closed');
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    };

    const handleError = (event) => {
      setChannelState('error');
      if (onErrorRef.current) {
        onErrorRef.current(event);
      }
    };

    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (onMessageRef.current) {
          onMessageRef.current(message);
        }
      } catch (error) {
        if (onErrorRef.current) {
          onErrorRef.current(error);
        }
      }
    };

    const attachChannel = (channel) => {
      if (!channel) {
        return;
      }

      channelRef.current = channel;
      setChannelState(channel.readyState);

      channel.addEventListener('open', handleOpen);
      channel.addEventListener('close', handleClose);
      channel.addEventListener('error', handleError);
      channel.addEventListener('message', handleMessage);
    };

    const detachChannel = () => {
      const channel = channelRef.current;
      if (!channel) {
        return;
      }

      channel.removeEventListener('open', handleOpen);
      channel.removeEventListener('close', handleClose);
      channel.removeEventListener('error', handleError);
      channel.removeEventListener('message', handleMessage);
      if (channel.readyState !== 'closed') {
        channel.close();
      }
      channelRef.current = null;
      setChannelState('closed');
    };

    const handleDataChannel = (event) => {
      attachChannel(event.channel);
    };

    peerConnection.addEventListener('datachannel', handleDataChannel);

    if (isInitiator && !channelRef.current) {
      const channel = peerConnection.createDataChannel(
        channelLabel,
        channelOptionsRef.current,
      );
      attachChannel(channel);
    }

    return () => {
      peerConnection.removeEventListener('datachannel', handleDataChannel);
      detachChannel();
    };
  }, [peerConnectionRef, channelLabel, isInitiator]);

  const sendJson = useCallback((payload) => {
    const channel = channelRef.current;
    if (!channel || channel.readyState !== 'open') {
      return false;
    }

    try {
      channel.send(JSON.stringify(payload));
      return true;
    } catch (error) {
      if (onErrorRef.current) {
        onErrorRef.current(error);
      }
      return false;
    }
  }, []);

  return {
    channelRef,
    channelState,
    sendJson,
  };
};

export default useDataChannel;
