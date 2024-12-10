import React from "react";
import { motion } from "framer-motion";
import {
    FaHome,
    FaChartBar,
    FaTimes,
    FaPlus,
    FaMedal,
    FaQuestionCircle,
    FaInfoCircle,
} from "react-icons/fa";
import { FaTableCells } from "react-icons/fa6";

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
        { icon: <FaHome />, label: "Dashboard", path: "/" },
        { icon: <FaTableCells />, label: "Markets", path: "/markets" },
        { icon: <FaChartBar />, label: "My Bets", path: "/bets" },
        { icon: <FaPlus />, label: "Create", path: "/create" },
    ];
    
    const menuItems2: MenuItem[] = [
        { icon: <FaQuestionCircle />, label: "FAQs", path: "/" },
        { icon: <FaInfoCircle />, label: "Support", path: "/" },
        { icon: <FaMedal />, label: "Rewards", path: "/" },
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
          fixed top-0 left-0 h-full w-72 bg-[#0d0d0d] text-white
          shadow-lg z-50 transform transition-transform duration-300
          md:translate-x-0 
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
                initial={{ x: "-100%" }}
                animate={{ x: isOpen ? 0 : "-100%" }}
                transition={{ type: "tween" }}
            >
                <div className="px-4 py-6 flex justify-between items-center">
                    <FaTimes
                        className="text-2xl text-white cursor-pointer transition-all duration-300 hover:text-gray-300"
                        onClick={onClose}
                    />
                </div>

                <nav className="px-4 py-6 flex flex-col space-y-10">
                    <ul className="space-y-2">
                        {menuItems.map((item) => (
                            <li key={item.label}>
                                <a
                                    href={item.path}
                                    className="flex items-center p-2 hover:bg-gray-100 hover:text-gray-900 rounded transition"
                                >
                                    <span className="mr-5">{item.icon}</span>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                    <ul className="space-y-2">
                        {menuItems2.map((item) => (
                            <li key={item.label}>
                                <a
                                    href={item.path}
                                    className="flex items-center p-2 hover:bg-gray-100 hover:text-gray-900 rounded transition"
                                >
                                    <span className="mr-5">{item.icon}</span>
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
