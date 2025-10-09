import ReactDOM from "react-dom";
import type React from "react";
import { RiCloseFill } from "@remixicon/react";

interface Props {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;

  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({
  children,
  isOpen,
  onClose,
  header,
  footer,
}: Props) {
  const modalRoot = document.getElementById("modal-root");

  if (modalRoot === null) throw new Error("No se pudo utilizar el modal");

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      tabIndex={-1}
      className={`${isOpen ? "" : "hidden"} overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] min-h-full`}
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full bg-black bg-opacity-75">
        <div
          className="relative bg-white rounded-lg shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
            {header}
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={onClose}
            >
              <RiCloseFill />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div className="p-4 md:p-5 space-y-4">{children}</div>
          {footer !== null && (
            <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    modalRoot, // The target DOM node
  );
}
