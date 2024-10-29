import { useState, useEffect } from "react";
import bit from "../styles/bitdash.module.css";
import { Modal, Button, Input, Select, Steps, message } from "antd/lib";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import { Calendar, utils } from "@hassanmojab/react-modern-calendar-datepicker";
import { CheckCircleOutlined } from "@ant-design/icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faPlus,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import CONTRACT_ABI from "../contractABI";
import CHILD_CONTRACT_ABI from "../childContractABI";
import SavingsPlanCard from "../components/savingsPlanCards";
import axios from "axios";
import erc20Data from '../erc20ABI.json';
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
  const [activeTab, setActiveTab] = useState("current");

  const { isConnected } = useAccount();

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

  const fetchSavingsData = async () => {
    if (!isConnected) return;

    try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

        const userChildContractAddress = await contract.getUserChildContractAddress();
        if (userChildContractAddress !== ethers.constants.AddressZero) {
            const childContract = new ethers.Contract(userChildContractAddress, CHILD_CONTRACT_ABI, signer);
            const savingsNamesObj = await childContract.getSavingsNames();

            console.log("savingsNamesObj:", savingsNamesObj); 

            const savingsNamesArray = savingsNamesObj[0];

            if (Array.isArray(savingsNamesArray)) {
                const ethPriceInUSD = await fetchEthPrice();

                if (ethPriceInUSD) {
                    const reversedSavingsNamesArray = [...savingsNamesArray].reverse();

                    // Initialize totalSavedAmount in ETH
                    let totalSavedAmountETH = ethers.BigNumber.from(0);

                    const savingsListPromises = reversedSavingsNamesArray.map(async (savingName) => {
                        const savingData = await childContract.getSaving(savingName);

                        if (!savingData.isValid) {
                            // Skip invalid savings
                            return null;
                        }

                        const amountInETH = ethers.utils.formatEther(savingData.amount); // Convert BigNumber to string in ETH
                        totalSavedAmountETH = totalSavedAmountETH.add(savingData.amount);

                        // Calculate the remaining time
                        const currentDate = new Date();
                        const startDate = new Date(savingData.startTime.toNumber() * 1000);
                        const maturityDate = new Date(savingData.maturityTime.toNumber() * 1000);

                        // Calculate total duration and elapsed time
                        const totalDuration = maturityDate - startDate;
                        const elapsedTime = currentDate - startDate;

                        // Calculate progress percentage
                        let progress = 0;
                        if (elapsedTime > 0) {
                            progress = Math.min(Math.floor((elapsedTime / totalDuration) * 100), 100);
                        }

                        // Convert the time difference into months and days
                        const timeDifference = maturityDate - currentDate;
                        const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));
                        const months = Math.floor(daysDifference / 30);
                        const days = daysDifference % 30;

                        return {
                            name: savingName,
                            createdDate: new Date(savingData.startTime.toNumber() * 1000).toLocaleDateString(),
                            savedAmount: `${amountInETH} ETH`,
                            penalty: `${savingData.penaltyPercentage}%`,
                            startTime: new Date(savingData.startTime.toNumber() * 1000).toLocaleString(),
                            progress: `${progress}`, // Display progress percentage
                            remainingTime: `${months} Months and ${days} Days Remaining`, // Display remaining time
                        };
                    });

                    const savingsList = (await Promise.all(savingsListPromises)).filter(Boolean);

                    // Convert totalSavedAmount in ETH to USD
                    const totalSavedAmountInUSD = parseFloat(ethers.utils.formatEther(totalSavedAmountETH)) * ethPriceInUSD;

                    // Format the amount to have a minimum of 3 decimal places
                    const formattedAmountUSD = totalSavedAmountInUSD.toFixed(3);

                    setTotalSavedAmountUSD(parseFloat(formattedAmountUSD));
                    setSavingsData(savingsList);
                } else {
                    console.error("Failed to fetch ETH price.");
                }
            } else {
                console.error("savingsNamesArray is not an array:", savingsNamesArray);
            }
        } else {
            console.log("User has not joined Bitsave yet.");
        }
    } catch (error) {
        console.error("Error fetching savings data:", error);
    }
};


const COINGECKO_API_URL = "https://api.coingecko.com/api/v3/simple/price?ids=lisk,ethereum&vs_currencies=eth";

const getLiskToEthRate = async () => {
  try {
    const response = await fetch(COINGECKO_API_URL);
    const data = await response.json();
    return data.lisk.eth; // Extract the Lisk to ETH conversion rate
  } catch (error) {
    console.error("Error fetching Lisk to ETH rate:", error);
    throw new Error("Failed to retrieve Lisk to ETH conversion rate");
  }
};

const approveERC20 = async (tokenAddress, amount, signer) => {
  const erc20Contract = new ethers.Contract(tokenAddress, erc20ABI, signer);

  // Approve token transfer
  const tx = await erc20Contract.approve(CONTRACT_ADDRESS, amount);
  await tx.wait();
  console.log("Approval Transaction Hash:", tx.hash);
};

const handleCreateSavings = async () => {
  if (!isConnected) {
    message.error("Please connect your wallet.");
    return;
  }
  setLoading(true);

  try {
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
        value: ethers.utils.parseEther("0.0001"), // Initial join value
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
    const liskToEthRate = await getLiskToEthRate();
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





  const handleTopUp = async (nameOfSavings, amount) => {
    try {
      // Initialize provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      // Initialize contract instance
      const contract = new ethers.Contract(
        '0x01f0443DaEC78fbaBb2D0927fEdFf5C20a4A39b5', 
        CONTRACT_ABI,
        signer
      );

      const amountInUnits = ethers.utils.parseUnits(amount, 18); 

      // Log the parameters for debugging
      console.log("Calling contract with parameters:", {
        nameOfSavings,
        amountInUnits: amountInUnits
      });

      // Hardcode token address
      const tokenToRetrieve = '0xac485391EB2d7D88253a7F1eF18C37f4242D1A24';

      // Call the incrementSaving function
      const tx = await contract.incrementSaving(nameOfSavings, tokenToRetrieve, amountInUnits, {
        gasLimit: 1000000, 
        value: amountInUnits 
      });

      await tx.wait();

      message.success('Top-up successful!');
      fetchSavingsData();  // Refresh savings data after top-up
    } catch (error) {
      console.error('Error during top-up:', error);

      // Handle different types of errors
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        message.error('Cannot estimate gas limit. The transaction may fail or require manual gas limit.');
      } else if (error.message.includes('Invalid saving increment value sent')) {
        message.error('Invalid saving increment value. Please check the values you provided.');
      } else {
        message.error(`Top-up failed: ${error.message}`);
      }
    }
  };


  const handleWithdraw = async (nameOfSavings) => {
    try {
      // Initialize provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
  
      // Initialize contract instance
      const contract = new ethers.Contract(
        '0x01f0443DaEC78fbaBb2D0927fEdFf5C20a4A39b5', 
        CONTRACT_ABI,
        signer
      );
  
      const userChildContractAddress = await contract.getUserChildContractAddress();
      // Initialize child contract instance
      const childContract = new ethers.Contract(
        userChildContractAddress,
        CHILD_CONTRACT_ABI,
        signer
      );
  
      // Check if the savings name exists and get its value
      const savingData = await childContract.getSaving(nameOfSavings);
      if (!savingData.isValid) {
        message.error('Savings plan does not exist. Please try again.');
        return;
      }
  
      // Call the withdrawSaving function without passing the value
      const tx = await contract.withdrawSaving(nameOfSavings, {
        gasLimit: 1000000,
      });
  
      // Wait for transaction to be mined
      await tx.wait();
   
      message.success('Withdrawal successful!');
      fetchSavingsData();
    } catch (error) {
      console.error('Error during withdrawal:', error);
  
      // Handle different types of errors
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        message.error('Cannot estimate gas limit. The transaction may fail or require manual gas limit.');
      } else {
        message.error(`Withdrawal failed: ${error.message}`);
      }
    }
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

  return (
    <section className={bit.containerMain}>
      <div className={bit.container}>
        <div className={bit.bit_holder}>
          <div className={bit.bit_header}>
            <div className={bit.item}>
              <span className={bit.text}>
                <ConnectButton />
                <br />
                <span className={bit.username}></span>
              </span>
            </div>
            <div className={bit.item}>
              <div
                className={bit.hamburger_menu}
                style={{ fontSize: "30px", marginTop: "20px" }}
              >
                &#9776;
              </div>
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
            className={`${bit.tab_item} ${bit.active}`}
            style={{ marginRight: "10px", color: "#81D7B4" }}
          >
            Current
            <div
              className={`${bit.tab_indicator} ${bit.active}`}
              style={{ backgroundColor: "#81D7B4" }}
            ></div>
          </div>
          <div className={bit.tab_item}>
            Completed
            {/* <div className={bit.tab_indicator} style={{ backgroundColor: '#81D7B4' }}></div> */}
          </div>
        </div>
        {/* <SavingsPlanCard hasSavingsPlan={savingsData.length > 0} savingsData={savingsData} /> */}
        {savingsData.length > 0 ? (
          savingsData.map((saving, index) => (
            <SavingsPlanCard key={index} plan={saving} onTopUp={handleTopUp} onWithdraw={handleWithdraw} />
          ))
        ) : (
          <div className={bit.no_plan_card}>
            <div className={bit.row}>
              <div className={bit.spinner_icon}>
                <i
                  className="fas fa-spinner fa-spin"
                  style={{ textAlign: "center" }}
                ></i>
              </div>
            </div>
            <div className={bit.custom_description}>
              Oops! You do not have any savings plan yet.
            </div>
          </div>
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
              currentStep === steps.length - 1 ? handleCreateSavings : next
            }
            style={{
              backgroundColor: "#81D7B4",
              borderColor: "#81D7B4",
              color: "#fff",
              fontFamily: "Space Grotesk",
            }}
          >
            {currentStep === steps.length - 1 ? "Create" : "Next"}
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
    </section>
  );
}
