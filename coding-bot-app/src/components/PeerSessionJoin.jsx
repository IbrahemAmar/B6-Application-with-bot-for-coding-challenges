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

const PeerSessionJoin = ({ isOpen, onClose }) => {
  const [roomId, setRoomId] = useState('');
  const [joinStatus, setJoinStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showRequest, setShowRequest] = useState(false);
  const [discussionData, setDiscussionData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [endNotice, setEndNotice] = useState('');

  const peerConnectionRef = useRef(null);
  const dataChannelRef = useRef(null);
  const signalingRef = useRef(null);
  const endNoticeTimeoutRef = useRef(null);

  const resetSessionState = () => {
    setJoinStatus('idle');
    setStatusMessage('');
    setShowRequest(false);
    setDiscussionData(null);
    setChatMessages([]);
    setChatInput('');
    setEndNotice('');
  };

  const cleanupConnection = () => {
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (signalingRef.current) {
      signalingRef.current.close();
      signalingRef.current = null;
    }
  };

  useEffect(() => () => cleanupConnection(), []);

  useEffect(() => {
    return () => {
      if (endNoticeTimeoutRef.current) {
        clearTimeout(endNoticeTimeoutRef.current);
      }
    };
  }, []);

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

  const updateDiscussionData = (updates) => {
    setDiscussionData(prev => ({ ...(prev || {}), ...updates }));
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
    setDiscussionData(null);
    setChatMessages([]);
    setChatInput('');
    setShowRequest(false);
    setJoinStatus('idle');
    setStatusMessage('');
    cleanupConnection();
  };

  const createPeerConnection = () => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ type: 'candidate', roomId, payload: event.candidate });
      }
    };

    peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      dataChannelRef.current = channel;

      channel.onopen = () => {
        setJoinStatus('connected');
        setStatusMessage('Connected. Waiting for request...');
      };

      channel.onmessage = (msgEvent) => {
        let message;
        try {
          message = JSON.parse(msgEvent.data);
        } catch {
          return;
        }

        const type = normalizeType(message.type);

        if (type === MESSAGE_TYPES.SESSION_REQUEST) {
          setShowRequest(true);
          setStatusMessage('User A wants to discuss a solution.');
          onClose();
        }

        if (type === MESSAGE_TYPES.SESSION_DATA) {
          updateDiscussionData(message.payload);
          setShowRequest(false);
          setStatusMessage('');
        }

        if (type === MESSAGE_TYPES.CHALLENGE_DATA) {
          updateDiscussionData({ challenge: message.payload });
          setShowRequest(false);
          setStatusMessage('');
        }

        if (type === MESSAGE_TYPES.SOLUTION_CODE) {
          updateDiscussionData({ solutionCode: message.payload });
          setShowRequest(false);
          setStatusMessage('');
        }

        if (type === MESSAGE_TYPES.CHAT_MESSAGE) {
          setChatMessages(prev => [...prev, message.payload]);
        }

        if (type === MESSAGE_TYPES.END_SESSION) {
          closeSession({ fromPeer: true });
        }

        if (message.type === 'session-ended') {
          setStatusMessage('Session ended.');
          setDiscussionData(null);
        }
      };
    };

    return peerConnection;
  };

  const handleJoin = () => {
    if (!roomId.trim()) {
      setStatusMessage('Enter a room ID to join.');
      return;
    }

    cleanupConnection();
    resetSessionState();
    setJoinStatus('connecting');
    setStatusMessage('Connecting to session...');

    const signaling = new WebSocket(SIGNALING_URL);
    signalingRef.current = signaling;

    signaling.onopen = () => {
      sendSignal({ type: 'join', roomId: roomId.trim() });
      setJoinStatus('waiting');
      setStatusMessage('Waiting for User A to initiate...');
    };

    signaling.onmessage = async (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      const { type, payload } = message;
      if (!type) return;

      if (type === 'offer') {
        if (!peerConnectionRef.current) {
          peerConnectionRef.current = createPeerConnection();
        }

        try {
          await peerConnectionRef.current.setRemoteDescription(payload);
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          sendSignal({ type: 'answer', roomId: roomId.trim(), payload: answer });
        } catch (err) {
          console.error('Offer handling failed:', err);
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
        setStatusMessage('User A left the session.');
        setDiscussionData(null);
      }
    };

    signaling.onclose = () => {
      if (joinStatus !== 'idle') {
        setStatusMessage('Signaling disconnected.');
      }
    };
  };

  const handleAccept = () => {
    sendData({ type: MESSAGE_TYPES.ACCEPT });
    setShowRequest(false);
    setStatusMessage('Accepted. Waiting for challenge data...');
  };

  const handleDecline = () => {
    sendData({ type: MESSAGE_TYPES.DECLINE });
    setShowRequest(false);
    setStatusMessage('Declined session.');
    cleanupConnection();
  };

  const handleSendMessage = () => {
    const trimmed = chatInput.trim();
    if (!trimmed) return;
    const payload = { sender: 'B', text: trimmed };
    setChatMessages(prev => [...prev, payload]);
    sendData({ type: MESSAGE_TYPES.CHAT_MESSAGE, payload });
    setChatInput('');
  };

  const handleEndSession = () => {
    sendData({ type: MESSAGE_TYPES.END_SESSION });
    closeSession();
  };

  const isDiscussionOpen = Boolean(discussionData?.challenge && discussionData?.solutionCode);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Join a Session</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
              Enter the room ID provided by User A.
            </p>
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Room ID"
              className="mt-4 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
            {statusMessage && (
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{statusMessage}</p>
            )}
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleJoin}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Join
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              User A wants to discuss a solution
            </h3>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Accept
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

      <DiscussionModal
        isOpen={isDiscussionOpen}
        onEndSession={handleEndSession}
        title={discussionData?.challenge?.title}
        description={discussionData?.challenge?.description}
        examples={discussionData?.challenge?.testCases}
        solutionCode={discussionData?.solutionCode}
        chatMessages={chatMessages}
        chatInput={chatInput}
        onChatInputChange={setChatInput}
        onSendMessage={handleSendMessage}
        role="B"
      />

      {endNotice && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {endNotice}
        </div>
      )}
    </>
  );
};

export default PeerSessionJoin;
