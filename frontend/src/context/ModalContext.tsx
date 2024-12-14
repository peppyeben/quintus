// src/context/ModalContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

type ModalContextType = {
    isOpen: boolean;
    content: ReactNode | null;
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<ReactNode | null>(null);

    const openModal = (content: ReactNode) => {
        setContent(content);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setContent(null);
    };

    return (
        <ModalContext.Provider
            value={{ isOpen, content, openModal, closeModal }}
        >
            {children}
        </ModalContext.Provider>
    );
}

export const useModal = () => {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};
