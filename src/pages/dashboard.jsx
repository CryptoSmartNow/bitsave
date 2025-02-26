import { useState, useEffect } from "react";
import bit from "../styles/bitdash.module.css";
import { Modal, Button, Input, Select, Steps, message } from "antd/lib";
import { Drawer, Menu } from "antd/lib";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import { Calendar, utils } from "@hassanmojab/react-modern-calendar-datepicker";
import { CheckCircleOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faPlus,
  faSearch,
  faTrophy,
  faCog,
  faLifeRing,
  faQuestionCircle,
  faTachometerAlt
} from "@fortawesome/free-solid-svg-icons";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import CONTRACT_ABI from "../contractABI";
import CHILD_CONTRACT_ABI from "../childContractABI";
import SavingsPlanCard from "../components/savingsPlanCards";
import axios from "axios";
import erc20Data from '../erc20ABI.json';
import WalletConnect from "../components/walletconnect";
import Head from 'next/head';
import TopUpModal from "../components/TopupModal";
import LeaderboardModal from '../components/LeaderboardModal';
const erc20ABI = erc20Data.abi;

import WithdrawModal from "../components/WithdrawModal";

const { Option } = Select;
const { Step } = Steps;

// const CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";
const CONTRACT_ADDRESS = "0x0C4A310695702ed713BCe816786Fcc31C11fe932";
const BASE_CONTRACT_ADDRESS = "0x0C4A310695702ed713BCe816786Fcc31C11fe932";


export default function Dashboard() {
  const [selectedDayRange, setSelectedDayRange] = useState({
    from: null,
    to: null,
  });
  const [selectedPenalty, setSelectedPenalty] = useState(1);
  const [savingsName, setSavingsName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("ETH");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [savingsData, setSavingsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSavedAmountUSD, setTotalSavedAmountUSD] = useState(0);
  const [activeTab, setActiveTab] = useState('current');
  const [isLoadingSavings, setIsLoadingSavings] = useState(true);

  const { isConnected } = useAccount();
  const [selectedKey, setSelectedKey] = useState("1");

  const handleMenuClick = (e) => {
    setSelectedKey(e.key);
    if (e.key === 'leaderboard') {
      fetchLeaderboardData();
      setIsLeaderboardVisible(true);
    }
  };
  const [visible, setVisible] = useState(false);

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (isConnected) {
      fetchSavingsData();
    } else {
      setSavingsData([]);
    }
  }, [isConnected]);

  const handleDateRangeChange = (dates) => {
    setSelectedDayRange(dates);
  };

  const handlePenaltyClick = (penalty) => {
    setSelectedPenalty(penalty);
  };

  const fetchEthPrice = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      );
      return response.data.ethereum.usd;
    } catch (error) {
      console.error("Error fetching ETH price:", error);
      return null;
    }
  };

  const [currentSavings, setCurrentSavings] = useState([]);
  const [completedSavings, setCompletedSavings] = useState([]);


  
  const fetchSavingsData = async () => {
    if (!isConnected) return;
  
    try {
      setIsLoadingSavings(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      const fetchSavingsFromContract = async (contractAddress, abi, decimals) => {
        const contract = new ethers.Contract(contractAddress, abi, signer);
        const userChildContractAddress = await contract.getUserChildContractAddress();
  
        if (userChildContractAddress !== ethers.constants.AddressZero) {
          const childContract = new ethers.Contract(
            userChildContractAddress,
            CHILD_CONTRACT_ABI,
            signer
          );
  
          const savingsNamesObj = await childContract.getSavingsNames();
          const savingsNamesArray = savingsNamesObj[0];
  
          if (Array.isArray(savingsNamesArray)) {
            let totalSavedAmount = ethers.BigNumber.from(0);
  
            const savingsListPromises = savingsNamesArray.map(async (savingName) => {
              const savingData = await childContract.getSaving(savingName);
              if (!savingData.isValid) return null;
  
              totalSavedAmount = totalSavedAmount.add(savingData.amount);
  
              const currentDate = new Date();
              const startTimestamp = savingData.startTime.toNumber();
              const maturityTimestamp = savingData.maturityTime.toNumber();
              const startDate = new Date(startTimestamp * 1000);
              const maturityDate = new Date(maturityTimestamp * 1000);
  
              const totalDuration = maturityDate - startDate;
              const elapsedTime = currentDate - startDate;
              const progress = Math.min(
                Math.floor((elapsedTime / totalDuration) * 100),
                100
              );
  
              const timeDifference = maturityDate - currentDate;
              const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
              const months = Math.floor(daysDifference / 30);
              const days = daysDifference % 30;
  
              // ✅ Convert amount properly based on token decimals (e.g., USDC: 6, ETH: 18)
              const formattedAmount = parseFloat(
                ethers.utils.formatUnits(savingData.amount, decimals)
              ).toFixed(2);
  
              return {
                name: savingName,
                createdDate: startDate.toLocaleDateString(),
                savedAmount: formattedAmount, // ✅ Shows 1.00 instead of 0.0000001
                tokenId: savingData.tokenId,
                penalty: `${savingData.penaltyPercentage}%`,
                startTime: startDate.toLocaleString(),
                startTimestamp: startTimestamp * 1000,
                progress: `${progress}`,
                remainingTime: `${months} Months and ${days} Days Remaining`,
                isCompleted: currentDate >= maturityDate,
              };
            });
  
            const allSavings = (await Promise.all(savingsListPromises)).filter(Boolean);
            return { allSavings, totalSavedAmount };
          }
        }
  
        return { allSavings: [], totalSavedAmount: ethers.BigNumber.from(0) };
      };
  
      // Fetch savings from the contract
      const { allSavings, totalSavedAmount } = await fetchSavingsFromContract(
        CONTRACT_ADDRESS, // Use the main contract address
        CONTRACT_ABI,
        6 // ✅ Change decimals based on token (6 for USDC, 18 for ETH)
      );
  
      console.log("Fetched Savings Data:", allSavings); // Log the fetched savings data
  
      const currentSavings = allSavings.filter((saving) => !saving.isCompleted);
      const completedSavings = allSavings.filter((saving) => saving.isCompleted);
  
      setCurrentSavings(currentSavings);
      setCompletedSavings(completedSavings);
  
      console.log("Current Savings:", currentSavings); // Log current savings
      console.log("Completed Savings:", completedSavings); // Log completed savings
  
      // ✅ Format total savings correctly
      const totalSavingsInUSD = parseFloat(
        ethers.utils.formatUnits(totalSavedAmount, 6) // ✅ Adjust decimals if needed
      ).toFixed(2);
  
      setTotalSavedAmountUSD(totalSavingsInUSD);
  
      console.log("Total Savings in USD:", totalSavingsInUSD); // Log total savings in USD
    } catch (error) {
      console.error("Error fetching savings data:", error);
      message.error("Failed to fetch savings data. Please try again.");
    } finally {
      setIsLoadingSavings(false);
    }
  };




  const getLiskToEthRate = async () => {
    const FALLBACK_LISK_ETH_RATE = 0.00028;
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: 'lisk',
          vs_currencies: 'eth'
        },
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        timeout: 5000
      });

      if (response.data && response.data.lisk && response.data.lisk.eth) {
        return response.data.lisk.eth;
      }

      // Use fallback rate if API response is invalid
      console.warn('Invalid API response, using fallback rate');
      return FALLBACK_LISK_ETH_RATE;
    } catch (error) {
      console.warn('API call failed, using fallback rate:', error.message);
      return FALLBACK_LISK_ETH_RATE;
    }
  };

  const approveERC20 = async (tokenAddress, amount, signer) => {
    const erc20Contract = new ethers.Contract(tokenAddress, erc20ABI, signer);

    // Approve token transfer
    const tx = await erc20Contract.approve(CONTRACT_ADDRESS, amount);
    await tx.wait();
    console.log("Approval Transaction Hash:", tx.hash);
  };

  const handleLskSavingsCreate = async () => {
    if (!isConnected) {
      message.error("Please connect your wallet.");
      return;
    }
    setLoading(true);

    try {
      // Get conversion rate with retry mechanism
      let liskToEthRate;
      for (let i = 0; i < 3; i++) { // Try 3 times
        try {
          liskToEthRate = await getLiskToEthRate();
          break;
        } catch (error) {
          if (i === 2) throw error; // If all retries failed
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        }
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Step 1: Check if the contract exists at the specified address
      const code = await provider.getCode(CONTRACT_ADDRESS);
      if (code === "0x") {
        throw new Error("Contract not found on this network. Check the contract address and network.");
      }

      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Check user’s child contract address
      const userChildContractAddress = await contract.getUserChildContractAddress();
      if (userChildContractAddress === ethers.constants.AddressZero) {
        const joinTx = await contract.joinBitsave({
          value: ethers.utils.parseEther("0.0001"),
        });
        await joinTx.wait();
      }

      console.log("User child contract address:", userChildContractAddress);

      const maturityTime = selectedDayRange.to
        ? Math.floor(
          new Date(
            selectedDayRange.to.year,
            selectedDayRange.to.month - 1,
            selectedDayRange.to.day
          ).getTime() / 1000
        )
        : 0;
      const safeMode = false;
      const tokenToSave = "0xac485391EB2d7D88253a7F1eF18C37f4242D1A24";

      // Step 2: Convert user-entered LSK amount to ETH dynamically
      const userEnteredLiskAmount = parseFloat(amount);
      const ethEquivalentAmount = ethers.utils.parseEther((userEnteredLiskAmount * liskToEthRate).toString());

      // Add the initial join amount (0.0001 ETH) to the ETH equivalent amount
      const totalAmount = ethEquivalentAmount.add(ethers.utils.parseEther("0.0001"));

      console.log("Parameters:", {
        savingsName,
        maturityTime,
        selectedPenalty,
        safeMode,
        tokenToSave,
        userEnteredLiskAmount,
        liskToEthRate,
        ethEquivalentAmount,
        totalAmount,
      });

      // Approve token transfer for the total amount in ETH
      await approveERC20(tokenToSave, totalAmount, signer);

      // Transaction options including gas limit and total ETH value
      const txOptions = {
        gasLimit: 1200000,
        value: totalAmount, // Total amount in ETH for transaction
      };

      // Step 3: Attempt to create a savings plan
      const tx = await contract.createSaving(
        savingsName,
        maturityTime,
        selectedPenalty,
        safeMode,
        tokenToSave,
        ethEquivalentAmount, // Pass only ETH equivalent amount to the contract
        txOptions
      );

      await tx.wait();

      message.success("Savings plan created successfully!");
      handleModalClose();

      fetchSavingsData();
    } catch (error) {
      console.error("Error creating savings plan:", error);
      message.error("Failed to create savings plan.");
    } finally {
      setLoading(false);
    }
  };


  const handleBaseSavingsCreate = async () => {
    if (!isConnected) {
      message.error("Please connect your wallet.");
      return;
    }
    setLoading(true);
  
    try {
      if (!window.ethereum) {
        throw new Error("No Ethereum wallet detected. Please install MetaMask.");
      }
  
      console.log("User Input - Amount:", amount);
      console.log("User Input - Savings Name:", savingsName);
      console.log("User Input - Selected Day Range:", selectedDayRange);
      console.log("User Input - Selected Penalty:", selectedPenalty);
  
      // Validate the user-entered amount
      const userEnteredUsdcAmount = parseFloat(amount);
      if (isNaN(userEnteredUsdcAmount) || userEnteredUsdcAmount <= 0) {
        throw new Error("Invalid amount. Please enter an amount greater than zero.");
      }
  
      // ✅ FIX: Ensure proper conversion to USDC (6 decimals)
      const usdcEquivalentAmount = ethers.utils.parseUnits(userEnteredUsdcAmount.toFixed(6), 6);
      console.log("USDC Equivalent Amount (After Fix):", usdcEquivalentAmount.toString());
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
  
      const BASE_CHAIN_ID = 8453; // Base network chain ID
      const BASE_CONTRACT_ADDRESS = "0x0C4A310695702ed713BCe816786Fcc31C11fe932";
  
      const network = await provider.getNetwork();
      console.log("User's Current Network:", network);
  
      if (network.chainId !== BASE_CHAIN_ID) {
        throw new Error("Please switch your wallet to the Base network.");
      }
  
      const contract = new ethers.Contract(BASE_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  
      // Get user child contract address or join Bitsave if not already registered
      let userChildContractAddress = await contract.getUserChildContractAddress();
      console.log("User's Child Contract Address (Before Join):", userChildContractAddress);
  
      if (userChildContractAddress === ethers.constants.AddressZero) {
        const joinTx = await contract.joinBitsave({
          value: ethers.utils.parseEther("0.0001"), // Ensure correct joining fee
        });
        await joinTx.wait();
  
        userChildContractAddress = await contract.getUserChildContractAddress();
        console.log("User's Child Contract Address (After Join):", userChildContractAddress);
      }
  
      // Convert maturity time to UNIX timestamp
      const maturityTime = selectedDayRange.to
        ? Math.floor(
            new Date(
              selectedDayRange.to.year,
              selectedDayRange.to.month - 1,
              selectedDayRange.to.day
            ).getTime() / 1000
          )
        : 0;
  
      const safeMode = false;
      const tokenToSave = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  
      // Approve the contract to spend the stablecoin
      const approveBASEERC20 = async (tokenAddress, amount, signer) => {
        const erc20Contract = new ethers.Contract(tokenAddress, erc20ABI, signer);
  
        // Approve token transfer
        const tx = await erc20Contract.approve(BASE_CONTRACT_ADDRESS, amount);
        await tx.wait();
        console.log("Approval Transaction Hash:", tx.hash);
      };
  
      const totalAmount = usdcEquivalentAmount.add(ethers.utils.parseEther("0.0001"));
  
      await approveBASEERC20(tokenToSave, usdcEquivalentAmount, signer);
      const txOptions = {
        gasLimit: 1200000,
        value: totalAmount, // Total amount in ETH for transaction
      };
  
      // Create the saving plan on the Bitsave contract
      const tx = await contract.createSaving(
        savingsName,
        maturityTime,
        selectedPenalty,
        safeMode,
        tokenToSave,
        usdcEquivalentAmount,
        txOptions
      );
  
      await tx.wait();
  
      message.success("Savings plan created successfully!");
      handleModalClose();
      fetchSavingsData(); // Refresh the savings data after successful creation
    } catch (error) {
      console.error("Error creating savings plan:", error);
  
      if (error.code === "CALL_EXCEPTION") {
        message.error("Transaction reverted. Please check the contract and inputs.");
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        message.error("Insufficient funds to cover the transaction.");
      } else {
        message.error(error.message || "Failed to create savings plan.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBaseSavingsTopUp = async (amount, savingsPlanName) => {
    if (!isConnected) {
      message.error("Please connect your wallet.");
      return;
    }
  
    setLoading(true);
  
    try {
      // Ensure `amount` is sanitized
      console.log("Raw amount value:", amount);
      const sanitizedAmount = amount.trim();
      const userEnteredAmount = parseFloat(sanitizedAmount);
  
      // Validate the sanitized amount
      if (!sanitizedAmount || isNaN(userEnteredAmount) || userEnteredAmount <= 0) {
        throw new Error("Invalid amount entered.");
      }
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
  
      // Check if the contract exists at the specified address
      const code = await provider.getCode(BASE_CONTRACT_ADDRESS);
      if (code === "0x") {
        throw new Error("Contract not found on this network. Check the contract address and network.");
      }
  
      const contract = new ethers.Contract(BASE_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  
      // Check if the user has a child contract
      const userChildContractAddress = await contract.getUserChildContractAddress();
      if (userChildContractAddress === ethers.constants.AddressZero) {
        throw new Error("You must join Bitsave before topping up.");
      }
  
      // Convert the user-entered amount to the appropriate units (e.g., USDC uses 6 decimals)
      const usdcEquivalentAmount = ethers.utils.parseUnits(userEnteredAmount.toString(), 6);
  
      console.log("Data being sent to incrementSaving:");
      console.log("Savings Name:", savingsPlanName);
      console.log("Token Address:", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"); // USDC on Base
      console.log("USDC Equivalent Amount:", usdcEquivalentAmount.toString());
  
      // Approve the contract to spend the USDC tokens
      const approveBASEERC20 = async (tokenAddress, amount, signer) => {
        const erc20Contract = new ethers.Contract(tokenAddress, erc20ABI, signer);
        const tx = await erc20Contract.approve(BASE_CONTRACT_ADDRESS, amount);
        await tx.wait();
        console.log("Approval Transaction Hash:", tx.hash);
      };
  
      await approveBASEERC20("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", usdcEquivalentAmount, signer);
  
      // Call the incrementSaving function on the contract
      const tx = await contract.incrementSaving(
        savingsPlanName, // Pass the savings plan name
        "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC token address
        usdcEquivalentAmount, // Amount in USDC
        {
          gasLimit: 800000, // Adjust gas limit as needed
        }
      );
  
      await tx.wait();
  
      message.success("Savings plan topped up successfully!");
      fetchSavingsData(); // Refresh the savings data after topping up
    } catch (error) {
      console.error("Error topping up savings plan:", error);
      message.error(`Failed to top up savings plan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  async function handleBaseWithdraw(nameOfSavings) {
    try {
      // Ensure Ethereum provider is available (e.g., MetaMask)
      if (!window.ethereum) {
        throw new Error("Ethereum provider not found. Please install MetaMask.");
      }
  
      // Create a new provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      // Create a contract instance
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  
      // Simulate the transaction using callStatic
      try {
        await contract.callStatic.withdrawSaving(nameOfSavings);
      } catch (staticError) {
        console.error("Static call failed, likely cause:", staticError.message || staticError);
        throw new Error(
          "Transaction simulation failed. Check the contract state or input parameters."
        );
      }
  
      // Estimate gas for the transaction
      let gasEstimate;
      try {
        gasEstimate = await contract.estimateGas.withdrawSaving(nameOfSavings);
        console.log("Gas estimate:", gasEstimate.toString());
      } catch (gasError) {
        console.warn("Gas estimation failed, using fallback gas limit:", gasError.message || gasError);
        gasEstimate = 100000; // Fallback gas limit
      }
  
      // Call the withdraw function
      const tx = await contract.withdrawSaving(nameOfSavings, {
        gasLimit: gasEstimate,
      });
  
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
  
      if (receipt.status === 1) {
        message.success("Withdrawal successful!");
        fetchSavingsData();
        console.log("Withdrawal successful!", receipt);
      } else {
        console.error("Transaction failed! Receipt:", receipt);
      }
    } catch (error) {
      console.error("Error during withdrawal:", error.message || error);
    }
  }

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetFormFields(); // Reset form fields when modal is closed
  };

  const resetFormFields = () => {
    setSavingsName("");
    setAmount("");
    setCurrency("");
    setSelectedDayRange({ from: null, to: null });
    setSelectedPenalty(1);
    setCurrentStep(0);
  };

  useEffect(() => {
    const currentDate = new Date();
    setSelectedDayRange((prev) => ({
      ...prev,
      from: {
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        day: currentDate.getDate(),
      },
    }));
  }, []);

  const next = () => {
    if (currentStep === 1) {
      if (!selectedDayRange.to) {
        message.error("Please select a valid end date.");
        return;
      }

      const currentDate = new Date();
      const fromDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const toDate = new Date(
        selectedDayRange.to.year,
        selectedDayRange.to.month - 1,
        selectedDayRange.to.day
      );

      // Check if the fromDate is the current date
      const userFromDate = new Date(
        selectedDayRange.from.year,
        selectedDayRange.from.month - 1,
        selectedDayRange.from.day
      );

      if (userFromDate.getTime() !== fromDate.getTime()) {
        message.error("Savings must start at the current date.");
        return;
      }

      console.log("From Date:", fromDate);
      console.log("To Date:", toDate);

      // Calculate days difference and add 1 to include both the start and end dates
      const timeDifference = toDate.getTime() - fromDate.getTime();
      const daysDifference = timeDifference / (1000 * 3600 * 24) + 1;

      console.log("Days Difference:", daysDifference);

      if (daysDifference < 30) {
        message.error("The date range must be at least 30 days.");
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: "Step 1",
      content: (
        <div>
          <Input
            placeholder="Name your savings plan"
            value={savingsName}
            onChange={(e) => setSavingsName(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          <div style={{ display: "flex", gap: "10px" }}>
            <Input
              placeholder="000,000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              value={currency}
              onChange={(value) => setCurrency(value)}
              style={{ width: "150px" }}
            >
              <Option value="ethereum">ETH</Option>
              <Option value="usdc">USDC</Option>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: "Step 2",
      content: (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Calendar
            value={selectedDayRange}
            onChange={handleDateRangeChange}
            minimumDate={utils().getToday()}
            shouldHighlightWeekends
            calendarClassName="responsive_calendar"
            colorPrimary="#9ADFC3"
            colorPrimaryLight="#e6f7f2"
            renderFooter={() => (
              <div style={{ textAlign: "center" }}>
                <Button
                  type="link"
                  onClick={() => setSelectedDayRange({ from: null, to: null })}
                >
                  Clear
                </Button>
              </div>
            )}
          />
        </div>
      ),
    },
    {
      title: "Step 3",
      content: (
        <div>
          <div>Select a penalty percentage:</div>
          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            {[1, 2, 3, 4, 5].map((penalty) => (
              <Button
                key={penalty}
                type={selectedPenalty === penalty ? "primary" : "ghost"}
                style={{
                  backgroundColor:
                    selectedPenalty === penalty ? "#81D7B4" : "transparent",
                  borderColor: "#81D7B4",
                  color: selectedPenalty === penalty ? "#fff" : "#81D7B4",
                }}
                onClick={() => handlePenaltyClick(penalty)}
              >
                {penalty}%
              </Button>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Preview",
      content: (
        <div
          style={{
            border: "1px solid #81D7B4",
            padding: "10px",
            borderRadius: "5px",
            fontFamily: "Space Grotesk",
          }}
        >
          <p>
            <strong>Savings Name:</strong> {savingsName}
          </p>
          <p>
            <strong>Amount:</strong> {amount}
          </p>
          <p>
            <strong>Currency:</strong> {currency}
          </p>
          <p>
            <strong>Date Range:</strong>{" "}
            {selectedDayRange && selectedDayRange.from && selectedDayRange.to
              ? `${selectedDayRange.from.day}/${selectedDayRange.from.month}/${selectedDayRange.from.year} - ${selectedDayRange.to.day}/${selectedDayRange.to.month}/${selectedDayRange.to.year}`
              : "Not selected"}
          </p>
          <p style={{ color: "#81D7B4" }}>
            <strong>Note:</strong> If you default, a penalty of{" "}
            {selectedPenalty}% will apply.
          </p>
        </div>
      ),
    },
  ];

  // Add new LSK-specific functions
  const handleCreateSavings = async () => {
    if (currency === "lsk") {
      await handleLskSavingsCreate();
    } else if (currency === "usdc" || "ethereum") {
      await handleBaseSavingsCreate();
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const [isTopUpModalVisible, setIsTopUpModalVisible] = useState(false);
  const [isHandleWithdrawModalVisible, setIsHandleWithdrawModalVisible] = useState(false);
  const [selectedSavingName, setSelectedSavingName] = useState('');

  const handleTopUpClick = (savingName) => {
    if (!savingName) {
      message.error('Invalid savings plan');
      return;
    }
    setSelectedSavingName(savingName);
    setIsTopUpModalVisible(true);
  };

  const handleWithdrawClick = (savingName) => {
    if (!savingName) {
      message.error('Invalid savings plan');
      return;
    }
    setSelectedSavingName(savingName);
    setIsHandleWithdrawModalVisible(true);
  };


  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);

  const fetchLeaderboardData = async () => {
    // Fetch your leaderboard data from an API or state
    const data = [
      { rank: 1, user: 'User1', amount: '1000 LSK' },
      { rank: 2, user: 'User2', amount: '800 LSK' },
      { rank: 3, user: 'User3', amount: '600 LSK' },
      // Add more data as needed
    ];
    setLeaderboardData(data);
  };

  return (
    <>
      <Head>
        <title>Dashboard | Bitsave</title>
        <meta name="description" content="Bitsave dashboard - Manage your savings plans" />
      </Head>
      <section className={bit.containerMain}>
        <div className={bit.container}>
          <div className={bit.bit_holder}>
            <div className={bit.bit_header}>
              <div className={bit.item}>
                <WalletConnect />
              </div>
              <div className={bit.item}>
                <div
                  className={bit.hamburger_menu}
                  onClick={showDrawer}
                >
                  &#9776;
                </div>

                <Drawer
                  title={<span style={{ fontFamily: 'Space Grotesk', fontSize: '24px' }}>Bitsave Menu</span>}
                  placement="left"
                  onClose={onClose}
                  open={visible}
                  width={400}
                >
                  <Menu
                    mode="vertical"
                    selectedKeys={[selectedKey]}  // This will highlight the selected menu item
                    onClick={handleMenuClick}  // Update the selected key on item click
                    style={{
                      borderRight: 'none',  // Optional: removes the default border
                    }}
                  >
                    <Menu.Item
                      key="1"
                      icon={<FontAwesomeIcon icon={faTachometerAlt} />}
                      style={{
                        backgroundColor: selectedKey === '1' ? '#81D7B4' : '#ffffff',  // Active state
                        color: selectedKey === '1' ? 'white' : 'black',  // Active state
                        fontWeight: 'bold',
                      }}
                    >
                      Dashboard
                    </Menu.Item>
                    <Menu.Item
                      key="2"
                      icon={<FontAwesomeIcon icon={faTrophy} />}
                      style={{
                        backgroundColor: selectedKey === '2' ? '#81D7B4' : '#ffffff',
                        color: selectedKey === '2' ? 'white' : 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      Leaderboard
                    </Menu.Item>
                    <Menu.Item
                      key="3"
                      icon={<FontAwesomeIcon icon={faCog} />}
                      style={{
                        backgroundColor: selectedKey === '3' ? '#81D7B4' : '#ffffff',
                        color: selectedKey === '3' ? 'white' : 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      Settings
                    </Menu.Item>
                    <Menu.Item
                      key="4"
                      icon={<FontAwesomeIcon icon={faLifeRing} />}
                      style={{
                        backgroundColor: selectedKey === '4' ? '#81D7B4' : '#ffffff',
                        color: selectedKey === '4' ? 'white' : 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      Support
                    </Menu.Item>
                    <Menu.Item
                      key="5"
                      icon={<FontAwesomeIcon icon={faQuestionCircle} />}
                      style={{
                        backgroundColor: selectedKey === '5' ? '#81D7B4' : '#ffffff',
                        color: selectedKey === '5' ? 'white' : 'black',
                        fontWeight: 'bold',
                      }}
                    >
                      FAQs
                    </Menu.Item>
                  </Menu>
                </Drawer>
              </div>
            </div>
            <div className={bit.inner_div}>
              <div className={bit.bit_glassy}>
                <div className={bit.glass_div}>
                  <span className={bit.glass_text}>
                    <FontAwesomeIcon
                      icon={faWallet}
                      style={{
                        marginTop: "10px",
                        marginRight: "10px",
                        color: "#9ADFC3",
                      }}
                    />
                    Total Locked Value
                  </span>
                </div>
                <div className={bit.amount}>$ {totalSavedAmountUSD}</div>
              </div>
              <Button
                type="ghost"
                icon={
                  <FontAwesomeIcon
                    icon={faPlus}
                    style={{
                      color: "#fff",
                      marginTop: "10px",
                      marginRight: "10px",
                    }}
                  />
                }
                onClick={showModal}
                className={bit.create_button}
              >
                Create Savings Plan
              </Button>

            </div>
            <div className={bit.bit_savings}>
              <div className={bit.header_description}>
                <h3>My Savings 💰</h3>
              </div>
              <div className={bit.search_box}>
                <Input
                  placeholder="Search savings here..."
                  className={bit.search_input}
                  style={{ marginBottom: "10px" }}
                />
                <Button
                  className={bit.search_button}
                  icon={<FontAwesomeIcon icon={faSearch} />}
                />
              </div>
            </div>
          </div>
          <div className={bit.tab_nav}>
            <div
              className={`${bit.tab_item} ${activeTab === 'current' ? bit.active : ''}`}
              style={{
                color: activeTab === 'current' ? "#81D7B4" : "#666",
                cursor: "pointer"
              }}
              onClick={() => handleTabChange('current')}
            >
              Current
              <div
                className={`${bit.tab_indicator} ${activeTab === 'current' ? bit.active : ''}`}
                style={{ backgroundColor: "#81D7B4" }}
              ></div>
            </div>
            <div
              className={`${bit.tab_item} ${activeTab === 'completed' ? bit.active : ''}`}
              style={{
                color: activeTab === 'completed' ? "#81D7B4" : "#666",
                cursor: "pointer"
              }}
              onClick={() => handleTabChange('completed')}
            >
              Completed
              <div
                className={`${bit.tab_indicator} ${activeTab === 'completed' ? bit.active : ''}`}
                style={{ backgroundColor: "#81D7B4" }}
              ></div>
            </div>
          </div>
          {activeTab === 'current' ? (
            isLoadingSavings ? (
              <div className={bit.no_plan_card}>
                <div className={bit.row}>
                  <div className={bit.spinner_icon}>
                    <i className="fas fa-spinner fa-spin" style={{ textAlign: "center" }}></i>
                  </div>
                </div>
                <div className={bit.custom_description}>
                  Loading your savings plans...
                </div>
              </div>
            ) : currentSavings.length > 0 ? (
              currentSavings.map((saving, index) => (
                <SavingsPlanCard
                  key={index}
                  plan={saving}
                  onTopUp={handleTopUpClick}
                  onWithdraw={handleWithdrawClick}
                />
              ))
            ) : (
              <div className={bit.no_plan_card}>
                <div className={bit.custom_description}>
                  Oops! You do not have any current savings plans.
                </div>
              </div>
            )
          ) : (
            isLoadingSavings ? (
              <div className={bit.no_plan_card}>
                <div className={bit.row}>
                  <div className={bit.spinner_icon}>
                    <i className="fas fa-spinner fa-spin" style={{ textAlign: "center" }}></i>
                  </div>
                </div>
                <div className={bit.custom_description}>
                  Loading completed savings...
                </div>
              </div>
            ) : completedSavings.length > 0 ? (
              completedSavings.map((saving, index) => (
                <SavingsPlanCard
                  key={index}
                  plan={saving}
                  onTopUp={handleTopUpClick}
                  onWithdraw={handleLskWithdraw}
                />
              ))
            ) : (
              <div className={bit.no_plan_card}>
                <div className={bit.custom_description}>
                  No completed savings plans yet.
                </div>
              </div>
            )
          )}
        </div>
        <Modal
          title="Create Savings Plan"
          open={isModalOpen}
          onCancel={handleModalClose}
          footer={[
            <Button
              key="back"
              onClick={prev}
              disabled={currentStep === 0}
              style={{
                borderColor: "#81D7B4",
                color: "#81D7B4",
                backgroundColor: "white",
                borderWidth: "2px",
              }}
            >
              Back
            </Button>,
            <Button
              key="next"
              type="primary"
              onClick={
                currentStep === steps.length - 1
                  ? handleCreateSavings
                  : next
              }
              loading={loading}
              disabled={loading}
              style={{
                backgroundColor: "#81D7B4",
                borderColor: "#81D7B4",
                color: "#fff",
                fontFamily: "Space Grotesk",
              }}
            >
              {loading ? "Please wait..." : currentStep === steps.length - 1 ? "Create" : "Next"}
            </Button>,
          ]}
        >
          <Steps current={currentStep} style={{ marginBottom: "20px" }}>
            {steps.map((item, index) => (
              <Step
                key={item.title}
                title={item.title}
                status={
                  currentStep > index
                    ? "finish"
                    : currentStep === index
                      ? "process"
                      : "wait"
                }
                icon={
                  currentStep > index ? (
                    <CheckCircleOutlined style={{ color: "#81D7B4" }} />
                  ) : null
                }
                style={{ color: currentStep >= index ? "#81D7B4" : "#81D7B4" }}
              />
            ))}
          </Steps>
          <div>{steps[currentStep].content}</div>
        </Modal>
        <TopUpModal
          isVisible={isTopUpModalVisible}
          onClose={() => setIsTopUpModalVisible(false)}

          onTopUp={handleBaseSavingsTopUp}
          savingName={selectedSavingName}
        />

<WithdrawModal
  isVisible={isHandleWithdrawModalVisible}
  onClose={() => setIsHandleWithdrawModalVisible(false)}
  onWithdraw={handleBaseWithdraw}
  savingName={selectedSavingName}
  penaltyPercentage={selectedPenalty} // Pass the penalty percentage here
/>
        <LeaderboardModal
          isVisible={isLeaderboardVisible}
          onClose={() => setIsLeaderboardVisible(false)}
          data={leaderboardData}
        />
      </section>
    </>
  );
}
