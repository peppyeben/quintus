import React from "react";
import { FaBars, FaPlus, FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { WalletWrapper } from "./Wallet";
import QuintusImage from "../assets/quintus.png";

// Define the props type for Navbar
type NavbarProps = {
    onMobileMenuToggle: () => void;
};

const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
    const navigate = useNavigate();

    return (
        <nav className="bg-black w-full shadow-md py-4 px-6 flex justify-between items-center space-x-4">
            <FaBars
                onClick={onMobileMenuToggle}
                className="text-2xl cursor-pointer text-white"
            />
            <div className="flex justify-between items-center space-x-4 w-full">
                <div className="flex space-x-2 justify-center items-center">
                    <img src={QuintusImage} alt="Quintus" className="w-8 h-8" />
                    <Link
                        to={"/"}
                        className="text-white font-black text-lg"
                        style={{
                            fontFamily: "Orbitron",
                        }}
                    >
                        Quintus
                    </Link>
                </div>
                <section className="flex items-center space-x-3">
                    <p className="relative">
                        <input
                            type="text"
                            className="rounded-full outline-none border-none appearance-none px-4 py-2 bg-[#0d0d0d] text-white"
                            placeholder="Search Markets"
                        />
                        <span className="absolute right-3 top-[25%] rounded-xl bg-[#1f1f1f] cursor-pointer">
                            <FaSearch className="text-gray-200 text-lg" />
                        </span>
                    </p>
                    <button
                        onClick={() => {
                            navigate("/create");
                        }}
                        className="bg-transparent flex items-center space-x-3 rounded-full outline-none appearance-none border border-white text-white py-1 px-6"
                    >
                        <span className="bg-white">
                            <FaPlus className="text-gray-950 text-sm" />
                        </span>
                        <span className="text-white">Create</span>
                    </button>

                    <WalletWrapper
                        text="Sign In"
                        className="bg-white rounded-full px-6 py-1 text-black transition-all duration-300 hover:bg-gray-200"
                        withWalletAggregator={true}
                    ></WalletWrapper>
                </section>
            </div>
        </nav>
    );
};

export default Navbar;
