import React from "react";
import { motion } from "framer-motion";
import { FaHome, FaUser, FaCog, FaChartBar, FaTimes } from "react-icons/fa";

// Define the type for menu items
type MenuItem = {
    icon: React.ReactNode;
    label: string;
    path: string;
};

// Define the props type for Sidebar
type SidebarProps = {
    isOpen: boolean;
    onClose: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const menuItems: MenuItem[] = [
        { icon: <FaHome />, label: "Home", path: "/" },
        { icon: <FaUser />, label: "Profile", path: "/profile" },
        { icon: <FaChartBar />, label: "Dashboard", path: "/dashboard" },
        { icon: <FaCog />, label: "Settings", path: "/settings" },
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 z-40"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <motion.div
                className={`
          fixed top-0 left-0 h-full w-64 bg-white 
          shadow-lg z-50 transform transition-transform duration-300
          md:translate-x-0 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
                initial={{ x: "-100%" }}
                animate={{ x: isOpen ? 0 : "-100%" }}
                transition={{ type: "tween" }}
            >
                <div className="p-4 border-b flex justify-between items-center">
                    <button className="" onClick={onClose}>
                        <FaTimes className="text-2xl" />
                    </button>
                </div>

                <nav className="p-4">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.label}>
                                <a
                                    href={item.path}
                                    className="flex items-center p-2 hover:bg-gray-100 rounded transition"
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </motion.div>
        </>
    );
};

export default Sidebar;
