import { createContext, useState, ReactNode, useContext } from "react";

type ModalMap = Record<string, boolean>;

interface ModalContextValue {
  modals: ModalMap;
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
}

export const ModalContext = createContext<ModalContextValue>({
  modals: {},
  openModal: () => { },
  closeModal: () => { },
});


export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modals, setModals] = useState<ModalMap>({});

  const openModal = (id: string) => setModals((m) => ({ ...m, [id]: true }));
  const closeModal = (id: string) => setModals((m) => ({ ...m, [id]: false }));

  return (
    <ModalContext.Provider value={{ modals, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalState = (modalId: string) => {
  const { modals, openModal, closeModal } = useContext(ModalContext);
  const isOpen = !!modals[modalId];

  return {
    isOpen,
    open: () => openModal(modalId),
    close: () => closeModal(modalId),
  };
}