# Quintus Protocol

A decentralized prediction market platform enabling users to create, participate in, and resolve prediction markets across multiple categories.

## Deployed Contracts (BSC Testnet)

### QuintusMarket
- Contract Address: `0x9d11a9F694068a4446ca02Bb4Cf5Ea4475f93E05.`
- Deployer Address: `0xc2fFBcCbF35ff5603c69eC44c5e2e638B30f731c`
- Transaction Hash: `0x3246fc6f950e651707fba711a775061c8449e6026e40a224c8da76e68c6daf4e`

### QuintusOracles  
- Contract Address: `0x90E3A4CE542601887fCD1f2286f6F4Cf33C04cFF`
- Deployer Address: `0xc2fFBcCbF35ff5603c69eC44c5e2e638B30f731c`
- Transaction Hash: `0xc7120f00df5c02374cd10f207dd4c47310a2590dc119d14ca71d418fd36e222b`

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
