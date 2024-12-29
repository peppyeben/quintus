import React, { useState } from "react";
import { motion } from "framer-motion";
import QuintusMeta from "@/components/QuintusMeta";

// Documentation sections with more structured content
const DOCS_SECTIONS = [
    {
        id: "introduction",
        title: "Introduction",
        content: () => (
            <div>
                <h2 className="text-xl font-bold mb-4">What is Quintus?</h2>
                <p className="mb-4">
                    A decentralized peer-to-peer prediction market built on BNB
                    Chain.
                </p>

                <ul className="list-disc pl-5 mb-4">
                    <li>No BSC token required; users use BNB</li>
                    <li>Events resolved transparently using a custom oracle</li>
                </ul>

                <h3 className="text-lg font-semibold mb-2">Core Features</h3>
                <div className="space-y-2">
                    <motion.button
                        className="w-full  p-3 rounded text-left hover:[#181818]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Permissionless market creation
                    </motion.button>
                    <motion.button
                        className="w-full  p-3 rounded text-left hover:[#181818]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Trustless payouts via smart contracts
                    </motion.button>
                </div>
            </div>
        ),
    },
    {
        id: "how-it-works",
        title: "How Quintus Works",
        content: () => (
            <div className="space-y-6">
                <div className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Step 1: Market Creation
                    </h2>
                    <p className="mb-2">Users define event details:</p>
                    <ul className="list-disc pl-5">
                        <li>
                            Title (e.g., "Will Team A win the championship?")
                        </li>
                        <li>Possible outcomes (e.g., Yes/No)</li>
                        <li>Market end time (resolution time)</li>
                    </ul>
                </div>

                <div className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Step 2: Participation
                    </h2>
                    <p>Users predict outcomes by locking BNB into the market</p>
                </div>

                <div className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Step 3: Outcome Verification
                    </h2>
                    <p>
                        Custom-built oracle ensures fair and tamper-proof
                        resolution
                    </p>
                </div>

                <div className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Step 4: Payouts</h2>
                    <p>
                        Winners automatically receive rewards via smart
                        contracts
                    </p>
                </div>
            </div>
        ),
    },
    {
        id: "architecture",
        title: "Architecture Overview",
        content: () => (
            <div className="space-y-6">
                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Blockchain</h2>
                    <p>BNB Chain for low fees and high speed.</p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Smart Contracts</h2>
                    <ul className="list-disc pl-5">
                        <li>Written in Solidity</li>
                        <li>
                            Handles market creation, outcome resolution, and
                            payouts
                        </li>
                    </ul>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Custom Oracle</h2>
                    <ul className="list-disc pl-5">
                        <li>Developed in Solidity</li>
                        <li>
                            Ensures reliable and trustless verification of
                            outcomes
                        </li>
                    </ul>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Architecture Flow
                    </h2>
                    <div className="flex justify-center items-center bg-gray-900 p-4 rounded">
                        <div className="flex items-center space-x-4">
                            <div className="text-center">
                                <div className="bg-blue-600 p-2 rounded mb-2">
                                    User
                                </div>
                                <div className="h-16 w-1 bg-white mx-auto"></div>
                                <div className="text-xs mt-2">Initiates</div>
                            </div>
                            <div className="text-center">
                                <div className="bg-green-600 p-2 rounded mb-2">
                                    Smart Contracts
                                </div>
                                <div className="h-16 w-1 bg-white mx-auto"></div>
                                <div className="text-xs mt-2">Manages</div>
                            </div>
                            <div className="text-center">
                                <div className="bg-purple-600 p-2 rounded mb-2">
                                    Oracle
                                </div>
                                <div className="h-16 w-1 bg-white mx-auto"></div>
                                <div className="text-xs mt-2">Verifies</div>
                            </div>
                            <div className="text-center">
                                <div className="bg-yellow-600 p-2 rounded mb-2">
                                    Outcome
                                </div>
                                <div className="h-16 w-1 bg-white mx-auto"></div>
                                <div className="text-xs mt-2">Determines</div>
                            </div>
                            <div className="text-center">
                                <div className="bg-red-600 p-2 rounded mb-2">
                                    Payout
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        ),
    },
    {
        id: "tools-framework",
        title: "Tools & Framework",
        content: () => (
            <div className="space-y-6">
                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Blockchain</h2>
                    <p className="mb-4">
                        The Ethereum Virtual Machine (EVM) is a decentralized
                        computation engine that acts as the runtime environment
                        for executing smart contracts on Ethereum and
                        Ethereum-compatible blockchains (often called EVM
                        chains).
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            Ensuring all nodes in the network execute code in a
                            consistent and trustless manner
                        </li>
                        <li>
                            Providing a sandboxed environment for smart contract
                            execution
                        </li>
                        <li>
                            Facilitating state changes on the blockchain based
                            on the outcomes of smart contracts
                        </li>
                    </ul>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Backend</h2>
                    <p className="mb-4">
                        Solidity is a high-level programming language designed
                        for writing smart contracts on Ethereum and other
                        EVM-compatible blockchains.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            Enables the creation of decentralized applications
                            (dApps) with defined rules and logic executed on the
                            blockchain
                        </li>
                        <li>
                            Supports inheritance, reusable modifiers, and
                            structured design for scalable and maintainable
                            contracts
                        </li>
                        <li>
                            Optimized for performance, with features like events
                            for logging and explicit data types for precision
                        </li>
                    </ul>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Frontend</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>React + Vite</li>
                        <li>Deployed on Vercel</li>
                    </ul>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Wallets Supported
                    </h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>MetaMask</li>
                        <li>Trust Wallet</li>
                        <li>And more...</li>
                    </ul>
                </section>
            </div>
        ),
    },
    {
        id: "how-to-use",
        title: "How to Use Quintus",
        content: () => (
            <div className="space-y-6">
                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Creating a Market
                    </h2>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Connect your wallet</li>
                        <li>Click "Create Market" and define parameters</li>
                        <li>Confirm the transaction using BNB</li>
                    </ol>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">Joining a Market</h2>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Browse active markets</li>
                        <li>Select an outcome and stake BNB</li>
                        <li>Confirm the transaction</li>
                    </ol>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Receiving Payouts
                    </h2>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Wait for market resolution</li>
                        <li>Funds are automatically distributed to winners</li>
                    </ol>
                </section>
            </div>
        ),
    },
    {
        id: "market-creation",
        title: "Creating Markets",
        content: () => (
            <div>
                <h2 className="text-xl font-bold mb-4">
                    Market Creation Process
                </h2>
                <ol className="list-decimal pl-5 space-y-2">
                    <li>Connect your wallet</li>
                    <li>Define market parameters</li>
                    <li>Launch market</li>
                </ol>
            </div>
        ),
    },
    {
        id: "betting",
        title: "Placing Bets",
        content: () => (
            <div>
                <h2 className="text-xl font-bold mb-4">How to Place a Bet</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Browse available markets</li>
                    <li>Select your prediction</li>
                    <li>Enter bet amount</li>
                    <li>Confirm transaction</li>
                </ul>
            </div>
        ),
    },
    {
        id: "faq",
        title: "Frequently Asked Questions",
        content: () => (
            <div className="space-y-6">
                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">What is Quintus?</h2>
                    <p>
                        Quintus is a decentralized peer-to-peer prediction
                        market where users can create or participate in markets
                        on events and outcomes. Built on the BNB Chain, it
                        ensures fairness, transparency, and efficient payouts
                        using smart contracts.
                    </p>

                    <h3 className="text-lg font-semibold mt-4 mb-2">
                        Quintus operates as users can:
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Create:</strong> Users can set up prediction
                            markets by defining events and possible outcomes
                        </li>
                        <li>
                            <strong>Participate:</strong> Other users predict
                            outcomes by locking BNB into the market
                        </li>
                        <li>
                            <strong>Resolve:</strong> Outcomes are verified
                            using Quintus' custom-built oracle
                        </li>
                        <li>
                            <strong>Payout:</strong> Winners are automatically
                            rewarded based on the results
                        </li>
                    </ul>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Do I need a Quintus token to participate?
                    </h2>
                    <p>
                        No. Quintus uses BNB for all transactions and rewards.
                        You do not need a native token to create or join
                        markets.
                    </p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        How are market outcomes resolved?
                    </h2>
                    <p>
                        Quintus uses a custom-built oracle to determine the
                        outcome of events. This oracle is designed for
                        reliability, fairness, and transparency, ensuring
                        trustless resolution.
                    </p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        What happens if the oracle fails or disputes arise?
                    </h2>
                    <p>
                        In rare cases where the oracle cannot resolve an
                        outcome, markets will either:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            Enter a dispute resolution phase (if implemented in
                            the future)
                        </li>
                        <li>Refund the BNB staked back to participants</li>
                    </ul>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Is Quintus secure?
                    </h2>
                    <p>
                        Yes. Quintus operates using audited smart contracts on
                        the EVM. All funds are securely managed on-chain,
                        ensuring transparency and safety.
                    </p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        What fees are charged on Quintus?
                    </h2>
                    <p>
                        Quintus currently charges minimal fees to cover
                        transaction costs and platform sustainability. These
                        fees are clearly displayed before participating in any
                        market.
                    </p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        What types of events can I create markets for?
                    </h2>
                    <p>
                        You can create prediction markets for a variety of
                        events, including:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Sports (e.g., match outcomes)</li>
                        <li>
                            Financial markets (e.g., stock or crypto price
                            predictions)
                        </li>
                        <li>
                            General events (e.g., elections, entertainment, or
                            custom predictions)
                        </li>
                    </ul>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Which wallets can I use with Quintus?
                    </h2>
                    <p>
                        Quintus supports popular wallets like MetaMask, Trust
                        Wallet, and other wallets compatible with the BNB Chain.
                    </p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        How do payouts work?
                    </h2>
                    <p>
                        After the event is resolved, the winning participants
                        automatically receive their share of the total BNB pool.
                        All payouts are handled by smart contracts, ensuring
                        fairness and transparency.
                    </p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Can I cancel a market after creating it?
                    </h2>
                    <p>
                        No. Once a market is created and BNB is locked, it
                        cannot be canceled to maintain fairness for
                        participants.
                    </p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        What blockchain does Quintus use?
                    </h2>
                    <p>
                        Quintus is built on the BNB Chain for its low fees,
                        speed, and reliability.
                    </p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Is Quintus open source?
                    </h2>
                    <p>
                        Parts of the platform, including smart contracts, may be
                        open-sourced in the future to enhance transparency and
                        encourage developer contributions.
                    </p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        How do I start using Quintus?
                    </h2>
                    <p>Through these steps:</p>
                    <ol className="list-decimal pl-5 space-y-2">
                        <li>Connect your wallet (e.g., MetaMask)</li>
                        <li>Browse or create a market</li>
                        <li>Predict outcomes by staking BNB</li>
                        <li>
                            Wait for resolution and claim rewards if you win!
                        </li>
                    </ol>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Where can I learn more about the Quintus roadmap?
                    </h2>
                    <p>
                        Visit our Roadmap section in the documentation for
                        details on upcoming features, upgrades, and
                        improvements.
                    </p>
                </section>
            </div>
        ),
    },
    {
        id: "security",
        title: "Security",
        content: () => (
            <div className="space-y-6">
                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Platform Security
                    </h2>
                    <p>
                        Comprehensive security checks to ensure platform
                        integrity
                    </p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Smart Contract Audits
                    </h2>
                    <p>
                        Rigorous security evaluations to protect user funds and
                        platform functionality
                    </p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Custom Oracle Reliability
                    </h2>
                    <p>
                        Transparent and trustless outcome verification process
                    </p>
                </section>

                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        Custom Oracle Details
                    </h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Developed in Solidity</li>
                        <li>
                            Ensures reliable and trustless verification of
                            outcomes
                        </li>
                    </ul>
                </section>
            </div>
        ),
    },
    {
        id: "roadmap",
        title: "Future Roadmap",
        content: () => (
            <div className="space-y-6">
                <section className=" p-4 rounded">
                    <h2 className="text-xl font-bold mb-4">
                        What to Look Out For
                    </h2>
                    <div className="space-y-4">
                        <motion.div
                            className="[#181818] p-3 rounded"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <h3 className="font-semibold mb-2">
                                Multi-chain Support
                            </h3>
                            <p>
                                Expanding Quintus beyond the current blockchain
                                infrastructure
                            </p>
                        </motion.div>

                        <motion.div
                            className="[#181818] p-3 rounded"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <h3 className="font-semibold mb-2">
                                Governance Features
                            </h3>
                            <p>
                                Introducing community-driven governance
                                mechanisms
                            </p>
                        </motion.div>

                        <motion.div
                            className="[#181818] p-3 rounded"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <h3 className="font-semibold mb-2">Improved UX</h3>
                            <p>
                                Enhancing user experience and platform usability
                            </p>
                        </motion.div>
                    </div>
                </section>
            </div>
        ),
    },
];

export const DocsPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState(DOCS_SECTIONS[0].id);

    const renderContent = () => {
        const section = DOCS_SECTIONS.find((sec) => sec.id === activeSection);
        return section ? section.content() : "Select a section";
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex w-full h-screen text-white bg-black text-left text-sm"
        >
            <QuintusMeta
                title={`Docs | Quintus Markets`}
                description={`All you need to know about Quintus`}
            />
            {/* Navigation Column */}
            <div className="w-1/4 border-r border-gray-800 p-4 space-y-2 overflow-y-auto">
                {DOCS_SECTIONS.map((section) => (
                    <motion.div
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`
    cursor-pointer p-2 rounded 
    ${activeSection === section.id ? "bg-[#1f1f1f]" : "hover:bg-[#181818]"}
`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {section.title}
                    </motion.div>
                ))}
            </div>

            {/* Content Column */}
            <div className="w-3/4 p-8 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">
                    {
                        DOCS_SECTIONS.find((sec) => sec.id === activeSection)
                            ?.title
                    }
                </h1>
                <div>{renderContent()}</div>
            </div>
        </motion.div>
    );
};

export default DocsPage;
