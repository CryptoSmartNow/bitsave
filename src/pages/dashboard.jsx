import { useState, useEffect } from 'react';
import bit from '../styles/bitdash.module.css';
import { Modal, Button, Input, Select, Steps, message } from 'antd/lib';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "react-modern-calendar-datepicker/lib/DatePicker.css";
import { Calendar, utils } from '@hassanmojab/react-modern-calendar-datepicker';
import { CheckCircleOutlined } from '@ant-design/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWallet, faSpinner, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import CONTRACT_ABI from '../contractABI';
import CHILD_CONTRACT_ABI from '../childContractABI';
import SavingsPlanCard from '../components/savingsPlanCards';
import axios from 'axios';

const { Option } = Select;
const { Step } = Steps;

const CONTRACT_ADDRESS = '0x01f0443DaEC78fbaBb2D0927fEdFf5C20a4A39b5';

export default function Dashboard() {
  const [selectedDayRange, setSelectedDayRange] = useState({ from: null, to: null });
  const [selectedPenalty, setSelectedPenalty] = useState(1);
  const [savingsName, setSavingsName] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ethereum');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [savingsData, setSavingsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalSavedAmountUSD, setTotalSavedAmountUSD] = useState(0);

  const { address, isConnected } = useAccount();

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
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      return response.data.ethereum.usd;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
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
  
        console.log('savingsNamesObj:', savingsNamesObj); // Log the object to inspect its structure
  
        // Access the first element to get the array of savings names
        const savingsNamesArray = savingsNamesObj[0];
  
        if (Array.isArray(savingsNamesArray)) {
          // Fetch the ETH price in USD
          const ethPriceInUSD = await fetchEthPrice();
  
          if (ethPriceInUSD) {
            // Create a shallow copy of the array and reverse it
            const reversedSavingsNamesArray = [...savingsNamesArray].reverse();
  
            // Initialize totalSavedAmount in ETH
            let totalSavedAmountETH = ethers.BigNumber.from(0);
  
            const savingsListPromises = reversedSavingsNamesArray.map(async (savingName) => {
              const savingData = await childContract.getSaving(savingName);
              const amountInETH = ethers.utils.formatEther(savingData.amount); // Convert BigNumber to string in ETH
              totalSavedAmountETH = totalSavedAmountETH.add(savingData.amount);
  
              return {
                name: savingName,
                createdDate: new Date(savingData.startTime.toNumber() * 1000).toLocaleDateString(),
                savedAmount: `${amountInETH} ETH`,
                penalty: `${savingData.penaltyPercentage}%`,
                startTime: new Date(savingData.startTime.toNumber() * 1000).toLocaleString(),
                // reward: "+1500 BTS", // Replace with actual data if available
                progress: 35, // Replace with actual data if available
                remainingTime: "3 Months and 23 Days Remaining" // Replace with actual data if available
              };
            });
  
            const savingsList = await Promise.all(savingsListPromises);
  
            // Convert totalSavedAmount in ETH to USD
            const totalSavedAmountInUSD = parseFloat(ethers.utils.formatEther(totalSavedAmountETH)) * ethPriceInUSD;
            setTotalSavedAmountUSD(totalSavedAmountInUSD);
  
            setSavingsData(savingsList);
          } else {
            console.error('Failed to fetch ETH price.');
          }
        } else {
          console.error('savingsNamesArray is not an array:', savingsNamesArray);
        }
      } else {
        console.log('User has not joined Bitsave yet.');
      }
    } catch (error) {
      console.error('Error fetching savings data:', error);
    }
  };
  
  
  


  const handleCreateSavings = async () => {
    if (!isConnected) {
      message.error('Please connect your wallet.');
      return;
    }
    setLoading(true); 
    try {
      // Create an Ethereum provider
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  
      // Check if user has joined Bitsave
      const userChildContractAddress = await contract.getUserChildContractAddress();
      if (userChildContractAddress === ethers.constants.AddressZero) {
        // User has not joined, so join Bitsave
        const joinTx = await contract.joinBitsave({ value: ethers.utils.parseEther('0.0001') });
        await joinTx.wait();
      }
  
      console.log(userChildContractAddress);
  
      const maturityTime = selectedDayRange.to
        ? Math.floor(new Date(selectedDayRange.to.year, selectedDayRange.to.month - 1, selectedDayRange.to.day).getTime() / 1000)
        : 0;
      const safeMode = false;
      const tokenToSave = '0x0000000000000000000000000000000000000000';
  
      // Ensure amount is a valid string and convert to BigNumber in wei
      const parsedAmount = ethers.utils.parseUnits(amount, 18); // Convert amount from ether to wei
  
      console.log('Parameters:', { savingsName, maturityTime, selectedPenalty, safeMode, tokenToSave, parsedAmount });
  
      // Set manual gas limit and ensure to pass the correct tx options
      const txOptions = {
        gasLimit: 1000000, // Adjust as needed
        value: parsedAmount // Pass the amount in wei if contract needs ETH
      };
  
      // Create savings plan
      const tx = await contract.createSaving(
        savingsName, 
        maturityTime, 
        selectedPenalty, 
        safeMode, 
        tokenToSave, 
        parsedAmount, 
        txOptions 
      );
  
      await tx.wait();
  
      message.success('Savings plan created successfully!');
      setIsModalOpen(false);
  
      // Fetch the updated savings data
      fetchSavingsData();
  
    } catch (error) {
      console.error('Error creating savings plan:', error);
      message.error('Failed to create savings plan.');
    } finally {
      setLoading(false); // Set loading state to false
    }
  };
  
  
  
  
  

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: 'Step 1',
      content: (
        <div>
          <Input
            placeholder="Name your savings plan"
            value={savingsName}
            onChange={(e) => setSavingsName(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <Input
              placeholder="000,000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ flex: 1 }}
            />
            <Select
              value={currency}
              onChange={(value) => setCurrency(value)}
              style={{ width: '150px' }}
            >
              <Option value="ethereum">ETH</Option>
              <Option value="bitcoin">Algo</Option>
              <Option value="usdt">USDT</Option>
              <Option value="galgo">gAlgo</Option>
            </Select>
          </div>
        </div>
      ),
    },
    {
      title: 'Step 2',
      content: (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Calendar
            value={selectedDayRange}
            onChange={handleDateRangeChange}
            minimumDate={utils().getToday()}
            shouldHighlightWeekends
            calendarClassName="responsive_calendar"
            colorPrimary="#9ADFC3"
            colorPrimaryLight="#e6f7f2"
            renderFooter={() => (
              <div style={{ textAlign: 'center' }}>
                <Button type="link" onClick={() => setSelectedDayRange({ from: null, to: null })}>
                  Clear
                </Button>
              </div>
            )}
          />
        </div>
      ),
    },
    {
      title: 'Step 3',
      content: (
        <div>
          <div>Select a penalty percentage:</div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {[1, 2, 3, 4, 5].map((penalty) => (
              <Button
                key={penalty}
                type={selectedPenalty === penalty ? 'primary' : 'ghost'}
                style={{ backgroundColor: selectedPenalty === penalty ? '#81D7B4' : 'transparent', borderColor: '#81D7B4', color: selectedPenalty === penalty ? '#fff' : '#81D7B4' }}
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
      title: 'Preview',
      content: (
        <div style={{ border: '1px solid #81D7B4', padding: '10px', borderRadius: '5px', fontFamily: 'Space Grotesk' }}>
          <p><strong>Savings Name:</strong> {savingsName}</p>
          <p><strong>Amount:</strong> {amount}</p>
          <p><strong>Currency:</strong> {currency}</p>
          <p>
            <strong>Date Range:</strong> {selectedDayRange && selectedDayRange.from && selectedDayRange.to
              ? `${selectedDayRange.from.day}/${selectedDayRange.from.month}/${selectedDayRange.from.year} - ${selectedDayRange.to.day}/${selectedDayRange.to.month}/${selectedDayRange.to.year}`
              : 'Not selected'}
          </p>
          <p style={{ color: '#81D7B4' }}><strong>Note:</strong> If you default, a penalty of {selectedPenalty}% will apply.</p>
        </div>
      ),
    },
  ];

  return (
    <section className={bit.containerMain}>
      <div className={bit.container} id="app">
        <div className={bit.bit_holder}>
          <div className={bit.bit_header}>
            <div className={bit.item}>
              <span className={bit.text}>
                <ConnectButton />
                <br /><span className={bit.username}></span>
              </span>
            </div>
            <div className={bit.item}>
              <div className={bit.hamburger_menu}>&#9776;</div>
            </div>
          </div>
          <div className={bit.inner_div}>
            <div className={bit.bit_glassy}>
              <div className={bit.glass_div}>
                <span className={bit.glass_text}>
                  <FontAwesomeIcon icon={faWallet} style={{ margin: '5px', color: '#9ADFC3' }} />
                  Total Locked Value
                </span>
              </div>
              <div className={bit.amount}>
                $ {totalSavedAmountUSD}
              </div>
            </div>
            <Button
              type="ghost"
              icon={<FontAwesomeIcon icon={faPlus} style={{ color: '#fff', margin: '5px' }} />}
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
                style={{ marginBottom: '10px' }}
              />
              <Button className={bit.search_button} icon={<FontAwesomeIcon icon={faSearch} />} />
            </div>
          </div>
        </div>
        <div className={bit.tab_nav}>
          <div className={`${bit.tab_item} ${bit.active}`} style={{ marginRight: '10px', color: '#81D7B4' }}>
            Current
            <div className={`${bit.tab_indicator} ${bit.active}`} style={{ backgroundColor: '#81D7B4' }}></div>
          </div>
          <div className={bit.tab_item} style={{ color: '#81D7B4' }}>
            Completed
            <div className={bit.tab_indicator} style={{ backgroundColor: '#81D7B4' }}></div>
          </div>
        </div>
        {/* <SavingsPlanCard hasSavingsPlan={savingsData.length > 0} savingsData={savingsData} /> */}
        {savingsData.length > 0 ? (
            savingsData.map((saving, index) => (
              <SavingsPlanCard key={index} plan={saving} />
            ))
          ) : (
          <div className={bit.no_plan_card} style={{ marginBottom: '100px' }}>
            <div className={bit.row}>
              <div className={bit.spinner_icon}>
                <i className="fas fa-spinner fa-spin" style={{ textAlign: 'center' }}></i>
              </div>
            </div>
            <div className={bit.custom_description}>
              Oops! No more saving plan to show.
            </div>
          </div>
        )}
     
      </div>
      <Modal
        title="Create Savings Plan"
        visible={isModalOpen}
        onCancel={handleModalClose}
        footer={[
          <Button 
            key="back" 
            onClick={prev} 
            disabled={currentStep === 0} 
            style={{ 
              borderColor: '#81D7B4', 
              color: '#81D7B4', 
              backgroundColor: 'white', 
              borderWidth: '2px' 
            }}
          >
            Back
          </Button>,
          <Button 
            key="next" 
            type="primary" 
            onClick={currentStep === steps.length - 1 ? handleCreateSavings : next} 
            style={{ 
              backgroundColor: '#81D7B4', 
              borderColor: '#81D7B4', 
              color: '#fff', 
              fontFamily: 'Space Grotesk' 
            }}
          >
            {currentStep === steps.length - 1 ? 'Create' : 'Next'}
          </Button>,
        ]}
      >
        <Steps current={currentStep} style={{ marginBottom: '20px' }}>
          {steps.map((item, index) => (
            <Step
              key={item.title}
              title={item.title}
              status={
                currentStep > index
                  ? 'finish'
                  : currentStep === index
                  ? 'process'
                  : 'wait'
              }
              icon={
                currentStep > index ? (
                  <CheckCircleOutlined style={{ color: '#81D7B4' }} />
                ) : null
              }
              style={{ color: currentStep >= index ? '#81D7B4' : '#81D7B4' }}
            />
          ))}
        </Steps>
        <div>{steps[currentStep].content}</div>
      </Modal>
    </section>
  );
}
