import type React from "react";

import ReactDOM from "react-dom";

import { RiCloseFill } from "@remixicon/react";

interface Props {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;

  header?: React.ReactNode;
  headerBorderBottom?: boolean;

  footer?: React.ReactNode;
  footerBorderTop?: boolean;
}

export default function Modal({
  children,
  isOpen,
  onClose,
  header,
  footer,
  headerBorderBottom = true,
  footerBorderTop = true,
}: Props) {
  const modalRoot = document.getElementById("modal-root");

  if (modalRoot === null || !isOpen) return null;

  return ReactDOM.createPortal(
    <div
      tabIndex={-1}
      className="fixed top-0 right-0 left-0 w-full h-full inset-0 z-50 flex justify-center items-center"
    >
      {/* Fondo negro semi-transparente */}
      <div
        className="fixed top-0 left-0 w-full h-full bg-black opacity-75"
        onClick={onClose}
        data-testid="overlay-background"
      />

      {/* Card blanca */}
      <div
        className="relative w-full max-w-2xl max-h-full z-40 overflow-y-auto"
        onClick={(e) => {
          e.stopPropagation();
        }}
        data-testid="modal-card"
      >
        <div className="relative bg-white rounded-lg shadow-sm">
          <div
            className={`flex items-center justify-between rounded-t ${headerBorderBottom ? "border-b border-gray-200" : ""}`}
          >
            {header}
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center mr-5"
              onClick={onClose}
            >
              <RiCloseFill />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="space-y-4">{children}</div>
          {footer !== null && (
            <div
              className={`flex items-center rounded-b ${footerBorderTop ? "border-t border-gray-200" : ""}`}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    modalRoot,
  );
}
