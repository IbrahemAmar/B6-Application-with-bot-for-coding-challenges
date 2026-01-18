import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_ICE_SERVERS = [];

const usePeerConnection = ({
  iceServers = DEFAULT_ICE_SERVERS,
  onIceCandidate,
  onConnectionStateChange,
  onIceConnectionStateChange,
  onDataChannel,
  onTrack,
} = {}) => {
  const peerConnectionRef = useRef(null);
  const onIceCandidateRef = useRef(onIceCandidate);
  const onConnectionStateChangeRef = useRef(onConnectionStateChange);
  const onIceConnectionStateChangeRef = useRef(onIceConnectionStateChange);
  const onDataChannelRef = useRef(onDataChannel);
  const onTrackRef = useRef(onTrack);

  const [connectionState, setConnectionState] = useState('new');
  const [iceConnectionState, setIceConnectionState] = useState('new');

  useEffect(() => {
    onIceCandidateRef.current = onIceCandidate;
  }, [onIceCandidate]);

  useEffect(() => {
    onConnectionStateChangeRef.current = onConnectionStateChange;
  }, [onConnectionStateChange]);

  useEffect(() => {
    onIceConnectionStateChangeRef.current = onIceConnectionStateChange;
  }, [onIceConnectionStateChange]);

  useEffect(() => {
    onDataChannelRef.current = onDataChannel;
  }, [onDataChannel]);

  useEffect(() => {
    onTrackRef.current = onTrack;
  }, [onTrack]);

  useEffect(() => {
    if (typeof RTCPeerConnection === 'undefined') {
      setConnectionState('unsupported');
      setIceConnectionState('unsupported');
      return undefined;
    }

    const peerConnection = new RTCPeerConnection({ iceServers });
    peerConnectionRef.current = peerConnection;

    setConnectionState(peerConnection.connectionState);
    setIceConnectionState(peerConnection.iceConnectionState);

    const handleConnectionStateChange = () => {
      setConnectionState(peerConnection.connectionState);
      if (onConnectionStateChangeRef.current) {
        onConnectionStateChangeRef.current(peerConnection.connectionState);
      }
    };

    const handleIceConnectionStateChange = () => {
      setIceConnectionState(peerConnection.iceConnectionState);
      if (onIceConnectionStateChangeRef.current) {
        onIceConnectionStateChangeRef.current(peerConnection.iceConnectionState);
      }
    };

    const handleIceCandidate = (event) => {
      if (event.candidate && onIceCandidateRef.current) {
        onIceCandidateRef.current(event.candidate);
      }
    };

    const handleDataChannel = (event) => {
      if (onDataChannelRef.current) {
        onDataChannelRef.current(event.channel);
      }
    };

    const handleTrack = (event) => {
      if (onTrackRef.current) {
        onTrackRef.current(event);
      }
    };

    peerConnection.addEventListener('connectionstatechange', handleConnectionStateChange);
    peerConnection.addEventListener('iceconnectionstatechange', handleIceConnectionStateChange);
    peerConnection.addEventListener('icecandidate', handleIceCandidate);
    peerConnection.addEventListener('datachannel', handleDataChannel);
    peerConnection.addEventListener('track', handleTrack);

    return () => {
      peerConnection.removeEventListener('connectionstatechange', handleConnectionStateChange);
      peerConnection.removeEventListener('iceconnectionstatechange', handleIceConnectionStateChange);
      peerConnection.removeEventListener('icecandidate', handleIceCandidate);
      peerConnection.removeEventListener('datachannel', handleDataChannel);
      peerConnection.removeEventListener('track', handleTrack);
      peerConnection.close();
      peerConnectionRef.current = null;
      setConnectionState('closed');
      setIceConnectionState('closed');
    };
  }, [iceServers]);

  const createOffer = useCallback(async (options) => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) {
      return null;
    }

    const offer = await peerConnection.createOffer(options);
    await peerConnection.setLocalDescription(offer);
    return offer;
  }, []);

  const createAnswer = useCallback(async (options) => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) {
      return null;
    }

    const answer = await peerConnection.createAnswer(options);
    await peerConnection.setLocalDescription(answer);
    return answer;
  }, []);

  const setRemoteDescription = useCallback(async (description) => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection || !description) {
      return false;
    }

    await peerConnection.setRemoteDescription(description);
    return true;
  }, []);

  const addIceCandidate = useCallback(async (candidate) => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection || !candidate) {
      return false;
    }

    await peerConnection.addIceCandidate(candidate);
    return true;
  }, []);

  const closeConnection = useCallback(() => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection) {
      return;
    }

    peerConnection.close();
    peerConnectionRef.current = null;
    setConnectionState('closed');
    setIceConnectionState('closed');
  }, []);

  return {
    peerConnectionRef,
    connectionState,
    iceConnectionState,
    createOffer,
    createAnswer,
    setRemoteDescription,
    addIceCandidate,
    closeConnection,
  };
};

export default usePeerConnection;
