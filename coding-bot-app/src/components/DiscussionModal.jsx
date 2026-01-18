import React, { useEffect, useRef } from 'react';

const DiscussionModal = ({
  isOpen,
  onEndSession,
  title,
  description,
  examples,
  solutionCode,
  chatMessages,
  chatInput,
  onChatInputChange,
  onSendMessage,
  role,
}) => {
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatMessages, isOpen]);

  if (!isOpen) return null;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSendMessage?.();
    }
  };

  const labelFor = (sender) => {
    if (role === 'A') {
      return sender === 'A' ? 'User A (You)' : 'User B';
    }
    return sender === 'B' ? 'User B (You)' : 'User A';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{description}</p>
          </div>
          <button
            onClick={onEndSession}
            className="rounded-lg border border-red-200 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-800/60 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            End Session
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">Examples</h4>
            <ul className="mt-2 space-y-2 text-sm text-gray-600 dark:text-gray-300">
              {(examples || []).map((example, idx) => (
                <li key={`${example.input}-${idx}`} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <div className="font-semibold text-gray-700 dark:text-gray-200">Input:</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{example.input}</div>
                  <div className="mt-2 font-semibold text-gray-700 dark:text-gray-200">Expected:</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{example.expectedOutput}</div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">User A Solution</h4>
            <pre className="mt-2 max-h-56 overflow-auto rounded-lg bg-gray-900 p-4 text-xs text-white">
              {solutionCode}
            </pre>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-gray-200 p-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">Live Chat</h4>
          <div
            ref={listRef}
            className="mt-3 max-h-56 space-y-3 overflow-y-auto rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-900"
          >
            {chatMessages?.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">Start the conversation.</p>
            )}
            {(chatMessages || []).map((message, index) => (
              <div key={`${message.sender}-${index}`} className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  {labelFor(message.sender)}
                </span>
                <span className="whitespace-pre-wrap rounded-lg bg-white px-3 py-2 text-gray-700 shadow-sm dark:bg-gray-800 dark:text-gray-100">
                  {message.text}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <textarea
              ref={inputRef}
              value={chatInput}
              onChange={(event) => onChatInputChange?.(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message"
              className="flex-1 resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              rows={2}
            />
            <button
              onClick={onSendMessage}
              className="self-end rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscussionModal;
