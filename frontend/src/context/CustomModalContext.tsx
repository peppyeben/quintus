import React, {
    useState,
    useEffect,
    createContext,
    useContext,
    ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Modal Props Interface
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    type?: "success" | "error" | "warning" | "info";
}

// Custom Modal Component
export const CustomModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = "info",
}) => {
    const [isVisible, setIsVisible] = useState(isOpen);

    useEffect(() => {
        setIsVisible(isOpen);
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        onClose();
    };

    // Color and icon based on type
    const getTypeStyles = () => {
        switch (type) {
            case "success":
                return {
                    bgColor: "bg-green-900/80",
                    textColor: "text-green-400",
                    borderColor: "border-green-700",
                };
            case "error":
                return {
                    bgColor: "bg-red-900/80",
                    textColor: "text-red-400",
                    borderColor: "border-red-700",
                };
            case "warning":
                return {
                    bgColor: "bg-yellow-900/80",
                    textColor: "text-yellow-400",
                    borderColor: "border-yellow-700",
                };
            default:
                return {
                    bgColor: "bg-neutral-900/80",
                    textColor: "text-white",
                    borderColor: "border-neutral-700",
                };
        }
    };

    const typeStyles = getTypeStyles();

    return (
        <AnimatePresence>
            {isVisible && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className={`relative w-full max-w-md mx-4 p-6 rounded-xl max-h-[20rem] overflow-y-auto scrollbar-thin scrollbar-track-[#c9c9c9] scrollbar-thumb-[#898989] hover:scrollbar-thumb-[#444444]
                            ${typeStyles.bgColor} 
                            ${typeStyles.borderColor} 
                            border`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Title */}
                        {title && (
                            <h2
                                className={`text-xl font-bold mb-3 ${typeStyles.textColor}`}
                            >
                                {title}
                            </h2>
                        )}

                        {/* Message */}
                        <p className="text-neutral-300 text-sm break-words py-4">
                            {message}
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Modal Context Type
interface ModalContextType {
    openModal: (options: {
        message: string;
        title?: string;
        type?: "success" | "error" | "warning" | "info";
    }) => void;
    closeModal: () => void;
}

// Create Modal Context
const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Modal Provider Component
export const CustomModalProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        message: string;
        title?: string;
        type?: "success" | "error" | "warning" | "info";
    }>({
        isOpen: false,
        message: "",
        type: "info",
    });

    const openModal = (options: {
        message: string;
        title?: string;
        type?: "success" | "error" | "warning" | "info";
    }) => {
        setModalState({
            isOpen: true,
            ...options,
        });
    };

    const closeModal = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
    };

    return (
        <ModalContext.Provider value={{ openModal, closeModal }}>
            {children}
            <CustomModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                message={modalState.message}
                title={modalState.title}
                type={modalState.type}
            />
        </ModalContext.Provider>
    );
};

// Hook to use modal
export const useCustomModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error(
            "useCustomModal must be used within a CustomModalProvider"
        );
    }
    return context;
};
