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
const erc20ABI = erc20Data.abi;

// import handleWithdraw from '../components/handleWithdraw';  

const { Option } = Select;
const { Step } = Steps;

const CONTRACT_ADDRESS = "0x7d839923Eb2DAc3A0d1cABb270102E481A208F33";

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
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const userChildContractAddress = await contract.getUserChildContractAddress();
      if (userChildContractAddress !== ethers.constants.AddressZero) {
        const childContract = new ethers.Contract(userChildContractAddress, CHILD_CONTRACT_ABI, signer);
        const savingsNamesObj = await childContract.getSavingsNames();
        const savingsNamesArray = savingsNamesObj[0];

        if (Array.isArray(savingsNamesArray)) {
          const ethPriceInUSD = await fetchEthPrice();
          if (ethPriceInUSD) {
            const reversedSavingsNamesArray = [...savingsNamesArray].reverse();
            let totalSavedAmountETH = ethers.BigNumber.from(0);

            const savingsListPromises = reversedSavingsNamesArray.map(async (savingName) => {
              const savingData = await childContract.getSaving(savingName);
              if (!savingData.isValid) return null;

              const amountInETH = ethers.utils.formatEther(savingData.amount);
              totalSavedAmountETH = totalSavedAmountETH.add(savingData.amount);

              const currentDate = new Date();
              const startTimestamp = savingData.startTime.toNumber();
              const maturityTimestamp = savingData.maturityTime.toNumber();
              const startDate = new Date(startTimestamp * 1000);
              const maturityDate = new Date(maturityTimestamp * 1000);

              console.log('Saving data from contract:', savingData);

              const totalDuration = maturityDate - startDate;
              const elapsedTime = currentDate - startDate;
              const progress = Math.min(Math.floor((elapsedTime / totalDuration) * 100), 100);

              const timeDifference = maturityDate - currentDate;
              const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
              const months = Math.floor(daysDifference / 30);
              const days = daysDifference % 30;

              return {
                name: savingName,
                createdDate: startDate.toLocaleDateString(),
                savedAmount: amountInETH,
                tokenId: savingData.tokenId,
                penalty: `${savingData.penaltyPercentage}%`,
                startTime: startDate.toLocaleString(),
                startTimestamp: startTimestamp * 1000,
                progress: `${progress}`,
                remainingTime: `${months} Months and ${days} Days Remaining`,
                isCompleted: currentDate >= maturityDate
              };
            });

            const allSavings = (await Promise.all(savingsListPromises)).filter(Boolean);
            
            // Separate savings into current and completed
            const current = allSavings.filter(saving => !saving.isCompleted);
            const completed = allSavings.filter(saving => saving.isCompleted);

            setCurrentSavings(current);
            setCompletedSavings(completed);

            const totalSavedAmountInUSD = parseFloat(ethers.utils.formatEther(totalSavedAmountETH)) * ethPriceInUSD;
            const formattedAmountUSD = totalSavedAmountInUSD.toFixed(3);
            setTotalSavedAmountUSD(parseFloat(formattedAmountUSD));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching savings data:", error);
    } finally {
      setIsLoadingSavings(false);
    }
  };

  const getLiskToEthRate = async () => {
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

  const handleLskSavingsTopUp = async (savingName, amount) => {
    try {
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }

      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // First get the child contract
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const userChildContractAddress = await contract.getUserChildContractAddress();
      
      // Verify contract exists
      const childContractCode = await provider.getCode(userChildContractAddress);
      if (childContractCode === "0x") {
        throw new Error("Child contract not found. Please create a savings plan first.");
      }

      const childContract = new ethers.Contract(userChildContractAddress, CHILD_CONTRACT_ABI, signer);

      // Get conversion rate
      let liskToEthRate;
      try {
        liskToEthRate = await getLiskToEthRate();
      } catch (error) {
        console.warn('Using fallback rate due to API error');
        liskToEthRate = FALLBACK_LISK_ETH_RATE;
      }

      // Convert LSK amount to ETH with proper decimal handling
      const liskAmount = parseFloat(amount);
      const ethAmountFloat = liskAmount * liskToEthRate;
      const ethAmountString = ethAmountFloat.toFixed(18);
      const ethAmount = ethers.utils.parseEther(ethAmountString);

      // Get the LISK token contract
      const tokenAddress = "0xac485391EB2d7D88253a7F1eF18C37f4242D1A24";
      const erc20Contract = new ethers.Contract(tokenAddress, erc20ABI, signer);

      // Check LISK balance
      const userAddress = await signer.getAddress();
      const balance = await erc20Contract.balanceOf(userAddress);
      if (balance.lt(ethAmount)) {
        throw new Error('Insufficient LISK balance');
      }

      // Check current allowance
      const currentAllowance = await erc20Contract.allowance(userAddress, userChildContractAddress);
      if (currentAllowance.lt(ethAmount)) {
        console.log('Approving tokens...');
        const approveTx = await erc20Contract.approve(userChildContractAddress, ethAmount);
        await approveTx.wait();
        console.log('Token approval successful');
      }

      // Verify the saving exists and is valid
      const saving = await childContract.getSaving(savingName);
      if (!saving.isValid) {
        throw new Error('Invalid saving plan');
      }

      console.log('Performing increment...', {
        savingName,
        amount: ethAmount.toString(),
        childContract: userChildContractAddress
      });

      // Call incrementSaving with proper parameters and error handling
      const incrementTx = await childContract.incrementSaving(
        savingName,
        ethAmount,
        {
          gasLimit: 1000000,
          gasPrice: await provider.getGasPrice()
        }
      );

      console.log('Transaction sent:', incrementTx.hash);
      const receipt = await incrementTx.wait();
      
      if (receipt.status === 0) {
        throw new Error('Transaction failed during execution');
      }

      message.success('Top-up successful!');
      await fetchSavingsData();
    } catch (error) {
      console.error('Top-up error:', error);
      if (error.code === 'CALL_EXCEPTION') {
        message.error('Transaction reverted: Please check your balance and try again');
      } else if (error.message.includes('insufficient')) {
        message.error('Insufficient balance to complete the transaction');
      } else {
        message.error(error.message || 'Transaction failed - please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLskWithdraw = async (nameOfSavings) => {
    if (currency !== "lsk") {
      message.error("Token selected not yet active, please select another");
      return;
    }
    await handleLskSavingsWithdraw(nameOfSavings);
  };

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
    setCurrency("ethereum");
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
              <Option value="lsk">LSK</Option>
              <Option value="usdt">USDT</Option>
              <Option value="arb">ARB</Option>
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
  const handleLskCreateSavings = async () => {
    if (currency !== "lsk") {
      message.error("Token selected not yet active, please select another");
      return;
    }
    await handleLskSavingsCreate();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const [isTopUpModalVisible, setIsTopUpModalVisible] = useState(false);
  const [selectedSavingName, setSelectedSavingName] = useState('');

  const handleTopUpClick = (savingName) => {
    if (!savingName) {
      message.error('Invalid savings plan');
      return;
    }
    setSelectedSavingName(savingName);
    setIsTopUpModalVisible(true);
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
                  <WalletConnect   />
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
                  onWithdraw={handleLskWithdraw} 
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
                  ? handleLskCreateSavings 
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

          onTopUp={handleLskSavingsTopUp}
          savingName={selectedSavingName}
        />
      </section>
    </>
  );
}
