'use client';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  DARK_PURPLE: string;
  MEDIUM_PURPLE: string;
  LIGHTEST: string;
};

export const LogoutConfirmDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  DARK_PURPLE,
  MEDIUM_PURPLE,
  LIGHTEST,
}) => {
  if (!open) return null;

  return (
    <div
      className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40'
      onClick={onClose}
    >
      <div
        className='p-8 rounded-xl shadow-2xl w-full max-w-md mx-4'
        style={{
          backgroundColor: LIGHTEST,
          border: `2px solid ${MEDIUM_PURPLE}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className='text-2xl font-bold mb-4'
          style={{ color: DARK_PURPLE }}
        >
          Confirm Logout
        </h3>
        <p className='text-md text-gray-700 mb-6'>
          Are you sure you want to log out of your session?
        </p>
        <div className='flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-5 py-2 text-md font-semibold rounded-lg transition-colors border border-gray-300'
            style={{ color: DARK_PURPLE, backgroundColor: 'white' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='px-5 py-2 text-md font-semibold rounded-lg text-white transition-colors'
            style={{ backgroundColor: '#dc3545' }}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};
