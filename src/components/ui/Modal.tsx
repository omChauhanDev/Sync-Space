import { useState, useRef, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  trigger: ReactNode;
  content: ReactNode;
  className?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
}

const Modal = ({
  trigger,
  content,
  className = "",
  contentClassName = "",
  showCloseButton = true,
}: ModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.showModal();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    const dialogDimensions = dialogRef.current?.getBoundingClientRect();
    if (dialogDimensions) {
      const isClickedOutside =
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom;

      if (isClickedOutside) {
        setIsOpen(false);
      }
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className='cursor-pointer'>
        {trigger}
      </div>

      <dialog
        ref={dialogRef}
        className={`modal ${className}`}
        onClose={() => setIsOpen(false)}
        onClick={handleBackdropClick}
      >
        <div
          className={`modal-box relative ${contentClassName}`}
          onClick={(e) => e.stopPropagation()}
        >
          {showCloseButton && (
            <Button
              className='text-xl absolute right-2 top-2 bg-background hover:bg-background ring-0 '
              onClick={() => setIsOpen(false)}
              variant='ghost'
            >
              ✕
            </Button>
          )}
          {content}
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button onClick={() => setIsOpen(false)}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default Modal;
