import React, { useEffect, useRef, useState } from 'react';
import DiscussionModal from './DiscussionModal';

const SIGNALING_URL = 'wss://b6-application-with-bot-for-coding.onrender.com';
const MESSAGE_TYPES = {
  ACCEPT: 'ACCEPT',
  DECLINE: 'DECLINE',
  CHALLENGE_DATA: 'CHALLENGE_DATA',
  SOLUTION_CODE: 'SOLUTION_CODE',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  END_SESSION: 'END_SESSION',
  SESSION_REQUEST: 'SESSION_REQUEST',
  SESSION_DATA: 'SESSION_DATA',
};

const normalizeType = (type) => {
  switch (type) {
    case 'session-accept':
      return MESSAGE_TYPES.ACCEPT;
    case 'session-decline':
      return MESSAGE_TYPES.DECLINE;
    case 'session-data':
      return MESSAGE_TYPES.SESSION_DATA;
    case 'session-request':
      return MESSAGE_TYPES.SESSION_REQUEST;
    case 'chat-message':
      return MESSAGE_TYPES.CHAT_MESSAGE;
    case 'end-session':
      return MESSAGE_TYPES.END_SESSION;
    default:
      return type;
  }
};

const PeerSessionHost = ({ isOpen, onClose, challenge, solutionCode }) => {
  const [roomId, setRoomId] = useState('');
  const [statusMessage, setStatusMessage] = useState('Waiting for User B to join...');
  const [copyMessage, setCopyMessage] = useState('');
  const [sessionAccepted, setSessionAccepted] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [endNotice, setEndNotice] = useState('');

  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const signalingRef = useRef(null);
  const roomIdRef = useRef('');
  const sessionStartedRef = useRef(false);
  const declinedRef = useRef(false);
  const endNoticeTimeoutRef = useRef(null);

  const cleanupConnection = () => {
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close();
      } catch {
        // no-op
      }
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch {
        // no-op
      }
      peerConnectionRef.current = null;
    }
    if (signalingRef.current) {
      signalingRef.current.close();
      signalingRef.current = null;
    }
  };

  const sendSignal = (message) => {
    if (signalingRef.current?.readyState === WebSocket.OPEN) {
      signalingRef.current.send(JSON.stringify(message));
    }
  };

  const sendData = (message) => {
    if (dataChannelRef.current?.readyState === 'open') {
      // P2P only: challenge data, solution, chat, accept/decline/end.
      dataChannelRef.current.send(JSON.stringify(message));
    }
  };

  const showEndNotice = () => {
    setEndNotice('Session ended by peer');
    if (endNoticeTimeoutRef.current) {
      clearTimeout(endNoticeTimeoutRef.current);
    }
    endNoticeTimeoutRef.current = setTimeout(() => {
      setEndNotice('');
    }, 4000);
  };

  const closeSession = ({ fromPeer } = {}) => {
    if (fromPeer) {
      showEndNotice();
    }
    setSessionAccepted(false);
    setChatMessages([]);
    setChatInput('');
    cleanupConnection();
    onClose();
  };

  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ type: 'candidate', roomId: roomIdRef.current, payload: event.candidate });
      }
    };

    const channel = peerConnection.createDataChannel('session');
    dataChannelRef.current = channel;

    channel.onopen = () => {
      setStatusMessage('User B connected. Waiting for acceptance...');
      sendData({ type: 'session-request' });
    };

    channel.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      const type = normalizeType(message.type);

      if (type === MESSAGE_TYPES.ACCEPT) {
        setStatusMessage('User B accepted. Sending challenge...');
        setSessionAccepted(true);
        // P2P only: send challenge + solution via DataChannel (NOT signaling).
        sendData({ type: MESSAGE_TYPES.CHALLENGE_DATA, payload: challenge });
        sendData({ type: MESSAGE_TYPES.SOLUTION_CODE, payload: solutionCode });
      }

      if (type === MESSAGE_TYPES.DECLINE) {
        setStatusMessage('User B declined the session.');
        declinedRef.current = true;
      }

      if (type === MESSAGE_TYPES.CHAT_MESSAGE) {
        setChatMessages(prev => [...prev, message.payload]);
      }

      if (type === MESSAGE_TYPES.END_SESSION) {
        closeSession({ fromPeer: true });
      }
    };

    return peerConnection;
  };

  const startSession = () => {
    const newRoomId = `room-${Math.random().toString(36).slice(2, 8)}`;
    setRoomId(newRoomId);
    roomIdRef.current = newRoomId;
    setStatusMessage('Waiting for User B to join...');
    setCopyMessage('');
    setEndNotice('');

    const signaling = new WebSocket(SIGNALING_URL);
    signalingRef.current = signaling;

    signaling.onopen = () => {
      sendSignal({ type: 'join', roomId: newRoomId });
    };

    signaling.onmessage = async (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      const { type, payload } = message || {};
      if (!type) return;

      if (type === 'peer-joined') {
        if (!peerConnectionRef.current) {
          peerConnectionRef.current = createPeerConnection();
        }

        try {
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          // Signaling channel only: SDP/ICE exchange, no content.
          sendSignal({ type: 'offer', roomId: newRoomId, payload: offer });
        } catch (err) {
          console.error('Offer failed:', err);
          setStatusMessage('Failed to create offer.');
        }
      }

      if (type === 'answer' && payload) {
        try {
          await peerConnectionRef.current?.setRemoteDescription(payload);
        } catch (err) {
          console.error('Answer failed:', err);
        }
      }

      if (type === 'candidate' && payload) {
        try {
          await peerConnectionRef.current?.addIceCandidate(payload);
        } catch (err) {
          console.error('ICE candidate error:', err);
        }
      }

      if (type === 'peer-left') {
        if (!declinedRef.current) {
          setStatusMessage('User B left the session.');
        }
      }
    };

    signaling.onclose = () => {
      setStatusMessage('Signaling disconnected.');
    };
  };

  useEffect(() => {
    if (!isOpen) {
      cleanupConnection();
      sessionStartedRef.current = false;
      declinedRef.current = false;
      setSessionAccepted(false);
      setChatMessages([]);
      setChatInput('');
      return;
    }
    if (!challenge || !solutionCode) {
      setStatusMessage('Missing challenge data for sharing.');
      return;
    }
    if (!sessionStartedRef.current) {
      sessionStartedRef.current = true;
      startSession();
    }
    return () => cleanupConnection();
  }, [isOpen, challenge, solutionCode]);

  useEffect(() => {
    return () => {
      if (endNoticeTimeoutRef.current) {
        clearTimeout(endNoticeTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!roomId) return;
    try {
      await navigator.clipboard.writeText(roomId);
      setCopyMessage('Copied!');
    } catch {
      setCopyMessage('Copy failed.');
    }
  };

  const handleClose = () => {
    sendData({ type: 'session-ended' });
    cleanupConnection();
    onClose();
  };

  const handleSendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const payload = { sender: 'A', text: trimmed };
    setChatMessages(prev => [...prev, payload]);
    sendData({ type: MESSAGE_TYPES.CHAT_MESSAGE, payload });
    setChatInput('');
  };

  const handleEndSession = () => {
    sendData({ type: MESSAGE_TYPES.END_SESSION });
    closeSession();
  };

  return (
    <>
      {isOpen && !sessionAccepted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Share Session</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Give this room ID to User B.
            </p>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
              <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{roomId}</span>
              <button
                onClick={handleCopy}
                className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
            {copyMessage && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{copyMessage}</p>}
            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
              {statusMessage}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={handleClose}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <DiscussionModal
        isOpen={Boolean(isOpen && sessionAccepted && challenge && solutionCode)}
        onEndSession={handleEndSession}
        title={challenge?.title}
        description={challenge?.description}
        examples={challenge?.testCases}
        solutionCode={solutionCode}
        chatMessages={chatMessages}
        chatInput={chatInput}
        onChatInputChange={setChatInput}
        onSendMessage={handleSendMessage}
        role="A"
      />

      {endNotice && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {endNotice}
        </div>
      )}
    </>
  );
};

export default PeerSessionHost;
