import React from "react";
import { motion } from "framer-motion";

export const CustomLoader: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                    scale: 1,
                    opacity: 1,
                    rotate: [0, 360], // Continuous rotation
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                }}
                className="w-16 h-16 border-4 border-t-white border-r-neutral-700 border-b-neutral-700 border-l-neutral-700 rounded-full"
            />
        </motion.div>
    );
};

// Optional: Add custom CSS for additional loader effects
const loaderStyles = `
.loader {
    width: 48px;
    height: 48px;
    border: 4px solid #fff;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = loaderStyles;
document.head.appendChild(styleSheet);
