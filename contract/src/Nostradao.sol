// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Market.sol";

/// @title Nostradao - Prediction market factory and registry
/// @notice Creates and tracks prediction markets
contract Nostradao {
    // === State Variables ===
    enum Category { Crypto, Politics, Sports, Election, Others }
   
    struct User {
        address userAddress;
        string name;
    }
   
    struct MarketInfo {
        address marketAddress;
        Category category;
        string title;
        uint256 resolutionDeadline;
        address[] approvedOracles;
    }
   
    struct Oracle {
        address oracleAddress;
        string oracleName;
    }

    address public immutable creator;
    address public immutable feeCollector;
    address public immutable oracle;

    mapping(address => User) public users;
    mapping(address => Oracle[]) public oracleLists; // Mapping from market address to list of oracles
    MarketInfo[] public marketInfos;

    // === Events ===
    event MarketCreated(address indexed market, string title, Category category);
    event UserRegistered(address indexed user, string name);
    event OracleAdded(address indexed market, address indexed oracle, string name);
    event OracleRemoved(address indexed market, address indexed oracle);
   
    constructor(address _oracle, address _feeCollector) {
        require(_oracle != address(0), "Oracle address cannot be zero");
        require(_feeCollector != address(0), "FeeCollector address cannot be zero");

        creator = msg.sender;
        oracle = _oracle;
        feeCollector = _feeCollector;
    }
   
    // === External Functions ===
    function registerUser(string memory name) external {
        require(users[msg.sender].userAddress == address(0), "User already registered");
        users[msg.sender] = User(msg.sender, name);
        emit UserRegistered(msg.sender, name);
    }
   
    function createMarket(
        string memory title,
        string memory description,
        Category category,
        address[] memory oracleList,
        string[] memory outcomes,
        uint256 bettingDeadline,
        uint256 resolutionDeadline,
        address _oracle
    ) external {
        require(bytes(title).length > 0, "Title cannot be empty");
        require(bytes(description).length > 0, "Description cannot be empty");
        require(outcomes.length > 1, "There must be at least two outcomes");
        require(bettingDeadline > block.timestamp, "Betting deadline must be in the future");
        require(resolutionDeadline > bettingDeadline, "Resolution deadline must be after betting deadline");
        require(_oracle != address(0), "Oracle address cannot be zero");

        // Create MarketParameters struct
        Market.MarketParameters memory params = Market.MarketParameters({
            creator: msg.sender,
            description: description,
            outcomes: outcomes,
            bettingDeadline: bettingDeadline,
            resolutionDeadline: resolutionDeadline,
            oracle: _oracle,
            feeCollector: feeCollector
        });

        // Create new market instance with the struct
        Market newMarket = new Market(params);

        // Store all market info
        marketInfos.push(MarketInfo({
            marketAddress: address(newMarket),
            category: category,
            title: title,
            resolutionDeadline: resolutionDeadline,
            approvedOracles: oracleList
        }));

        // Add initial oracle list
        for (uint256 i = 0; i < oracleList.length; i++) {
            require(oracleList[i] != address(0), "Oracle address cannot be zero");
            oracleLists[address(newMarket)].push(Oracle(oracleList[i], "Initial Oracle"));
        }

        emit MarketCreated(address(newMarket), title, category);
    }

    function addOracleToMarket(address market, address oracleAddress, string memory oracleName) external {
        require(msg.sender == creator, "Only creator can add oracles");
        require(oracleAddress != address(0), "Oracle address cannot be zero");
        oracleLists[market].push(Oracle(oracleAddress, oracleName));
        emit OracleAdded(market, oracleAddress, oracleName);
    }

    function removeOracleFromMarket(address market, address oracleAddress) external {
        require(msg.sender == creator, "Only creator can remove oracles");
        Oracle[] storage list = oracleLists[market];
        for (uint256 i = 0; i < list.length; i++) {
            if (list[i].oracleAddress == oracleAddress) {
                list[i] = list[list.length - 1];
                list.pop();
                emit OracleRemoved(market, oracleAddress);
                return;
            }
        }
        revert("Oracle not found");
    }

    // === View Functions ===
    function getMarketsByCategory(Category _category) external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < marketInfos.length; i++) {
            if (marketInfos[i].category == _category) {
                count++;
            }
        }

        address[] memory filtered = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < marketInfos.length; i++) {
            if (marketInfos[i].category == _category) {
                filtered[index++] = marketInfos[i].marketAddress;
            }
        }
        return filtered;
    }

    function getAllMarkets() external view returns (address[] memory) {
        address[] memory allMarkets = new address[](marketInfos.length);
        for (uint256 i = 0; i < marketInfos.length; i++) {
            allMarkets[i] = marketInfos[i].marketAddress;
        }
        return allMarkets;
    }

    function getMarketDetails(address market) external view returns (
        string memory title,
        Category category,
        uint256 resolutionDeadline,
        address[] memory approvedOracles
    ) {
        for (uint256 i = 0; i < marketInfos.length; i++) {
            if (marketInfos[i].marketAddress == market) {
                return (
                    marketInfos[i].title,
                    marketInfos[i].category,
                    marketInfos[i].resolutionDeadline,
                    marketInfos[i].approvedOracles
                );
            }
        }
        revert("Market not found");
    }
}