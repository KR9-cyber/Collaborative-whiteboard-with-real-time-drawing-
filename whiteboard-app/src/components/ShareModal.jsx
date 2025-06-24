import { Dialog } from '@headlessui/react';
import { useState } from 'react';

const ShareModal = ({ roomId, isOpen, onClose }) => {
  const origin = window.location.origin;
  const editLink = `${origin}/${roomId}?permission=edit`;
  const viewLink = `${origin}/${roomId}?permission=view`;

  const [copied, setCopied] = useState('');

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold mb-4">Share Room</Dialog.Title>

          <div className="space-y-4">
            <div>
              <label className="font-medium">Edit Link:</label>
              <div className="flex items-center gap-2">
                <input
                  value={editLink}
                  readOnly
                  className="border px-2 py-1 w-full rounded"
                />
                <button
                  onClick={() => handleCopy(editLink, 'edit')}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Copy
                </button>
              </div>
              {copied === 'edit' && <p className="text-green-600 text-sm mt-1">Copied edit link!</p>}
            </div>

            <div>
              <label className="font-medium">View-Only Link:</label>
              <div className="flex items-center gap-2">
                <input
                  value={viewLink}
                  readOnly
                  className="border px-2 py-1 w-full rounded"
                />
                <button
                  onClick={() => handleCopy(viewLink, 'view')}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Copy
                </button>
              </div>
              {copied === 'view' && <p className="text-green-600 text-sm mt-1">Copied view-only link!</p>}
            </div>
          </div>

          <div className="mt-6 text-right">
            <button onClick={onClose} className="text-gray-500 hover:underline">
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ShareModal;
