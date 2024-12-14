import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import { HomePage } from "./pages/HomePage";
import { AnimatePresence } from "framer-motion";
import Sidebar from "./components/SideBar";
import Navbar from "./components/NavBar";
import { MarketsPage } from "./pages/MarketsPage";
import { MyBetsPage } from "./pages/MyBetsPage";
import { CreatePage } from "./pages/CreatePage";
import { ModalProvider } from "./context/ModalContext";
import { Modal } from "./components/ui/Modal";
import { LoaderProvider } from "./context/LoaderContext";
import { LoaderModal } from "./components/ui/LoaderModal";
import { MarketDetailsPage } from "./pages/MarketDetailsPage";

function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

    const toggleMobileMenu = (): void => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="w-[100vw] bg-black">
            <LoaderProvider>
                <ModalProvider>
                    <AnimatePresence>
                        <Sidebar
                            isOpen={isSidebarOpen}
                            onClose={() => setIsSidebarOpen(false)}
                        />
                    </AnimatePresence>
                    <Navbar onMobileMenuToggle={toggleMobileMenu} />
                    <LoaderModal />
                    <Modal /> {/* Add this line */}
                    <div className="min-h-screen flex flex-col">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/markets" element={<MarketsPage />} />
                            <Route
                                path="/markets/:id"
                                element={<MarketDetailsPage />}
                            />

                            <Route path="/bets" element={<MyBetsPage />} />
                            <Route path="/create" element={<CreatePage />} />
                        </Routes>
                    </div>
                </ModalProvider>
            </LoaderProvider>
        </div>
    );
}

export default App;
