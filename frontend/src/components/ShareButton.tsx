import { useState } from "react";
import { FaShare } from "react-icons/fa";

const ShareButton = () => {
    const [showToast, setShowToast] = useState(false);

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } catch (err) {
            console.error("Failed to copy URL:", err);
        }
    };

    return (
        <div className="relative">
            <FaShare
                onClick={handleShare}
                className="text-white text-lg ml-auto transition-all duration-300 cursor-pointer 
          hover:text-gray-300 active:scale-95 active:text-green-300"
            />

            {showToast && (
                <div
                    className="absolute top-8 right-0 bg-[#0c2712] text-white px-4 py-2 rounded-md shadow-lg 
          text-sm animate-fade-in"
                >
                    URL copied to clipboard!
                </div>
            )}
        </div>
    );
};

export default ShareButton;
