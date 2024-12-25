# Quintus Protocol

A decentralized prediction market platform enabling users to create, participate in, and resolve prediction markets across multiple categories.

## Deployed Contracts (BSC Testnet)

### QuintusMarket
- Contract Address: `0x81b45D2833847886AEbfb9733B025f08b49cD20A.`
- Deployer Address: `0xc2fFBcCbF35ff5603c69eC44c5e2e638B30f731c`
- Transaction Hash: `0xfbd33892b0e7d54495734fb3f13afd280195fb51ba0a9d54468e963d7a208eb8`

### QuintusOracles  
- Contract Address: `0xD1ff7Da449568758a53e65284e7A8e2bD0fdfeE5`
- Deployer Address: `0xc2fFBcCbF35ff5603c69eC44c5e2e638B30f731c`
- Transaction Hash: `0xcea90f0c4c48106f191c28a0dc90d78d701dd7df0c8ff8f448abe470c5763df3`

## Core Components

### QuintusMarket
The main contract handling market creation, betting mechanics, and reward distribution.

- Create prediction markets across different categories
- Place bets on market outcomes
- Claim winnings after market resolution
- Built-in fee system for platform sustainability
- Comprehensive market tracking and reporting

### QuintusOracles
Decentralized oracle system managing market resolutions and outcome verification.

- Multi-signature outcome verification
- Authorized wallet management
- Secure market resolution mechanism
- Event tracking and outcome storage

## Features

- **Multiple Market Categories**
  - Sports
  - Crypto
  - Politics
  - Elections
  - Others

- **Fee Structure**
  - Platform Fee: 2.5%
  - Creator Fee: 1%
  - Market Creation Fee: 0.01 BNB

- **Security Measures**
  - Reentrancy protection
  - Access control
  - Deadline enforcement
  - Oracle verification

## Technical Implementation

### Market Creation
```solidity
function createMarket(
    string memory _betTitle,
    string memory _description,
    uint256 _betDeadline,
    uint256 _resolutionDeadline,
    string[] memory _outcomes,
    MarketCategory _category
) external payable
```
## Betting Mechanism
```solidity
function placeBet(
    uint256 _marketId,
    uint256 _outcomeIndex
) external payable
```

## Market Resolution
```solidity
function resolveMarket(
    uint256 _marketId
    ) external nonReentrant
```

## Oracle Bet Resolution
```solidity
function reolveBet(
    uint256 _marketId,
    uint256 memory _outcome
    ) external nonReentrant
```

## Testing Framework
-  Comprehensive test suite covering:
      Integration tests
      Unit tests
      Oracle functionality
      Market mechanics
      Edge cases
      Fee calculations

## Development Setup

1. Clone the repository
2. Install dependencies:
 ```solidity
forge install
```
3. Run tests:
 ```solidity
forge test
```
4. Deploy contracts:
 ```solidity
 forge create --rpc-url <your_rpc_url> --private-key <your_private_key> --constructor-args <constructor_args>
```
5. Interact with contracts:

```solidity
cast <contract_address> <function_name> <function_args>
```
## Architecture
Quintus Protocol
├── QuintusMarket (Main Contract)
│   ├── Market Creation
│   ├── Betting System
│   └── Reward Distribution
└── QuintusOracles
    ├── Resolution Mechanism
    ├── Authorization System
    └── Outcome Verification

## License
This project is licensed under the MIT License.

## Contributing

 1.   Fork the repository
 2.   Create feature branch
 3.   Commit changes
 4.   Push to branch
 5.   Create Pull Request
