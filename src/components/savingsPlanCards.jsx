import React, { useState, useEffect } from 'react';
import bit from '../styles/bitdash.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSackDollar, faPlus, faArrowDown, faCheck } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import WithdrawModal from './WithdrawModal';
import axios from 'axios';

const LISK_TOKEN_ADDRESS = '0xac485391EB2d7D88253a7F1eF18C37f4242D1A24';

// Add fallback conversion rate
const FALLBACK_LISK_ETH_RATE = 0.00001234; // Update this with a reasonable fallback rate

const NETWORK_CONFIG = {
  LISK: {
    symbol: 'LSK',
    logo: '/lisk-logo.svg',
    coingeckoId: 'lisk'
  },
  ETH: {
    symbol: 'ETH',
    logo: '/eth-logo.svg',
    coingeckoId: 'ethereum'
  }
};

const SavingsPlanCard = ({ plan, onTopUp, onWithdraw }) => {
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [tokenType, setTokenType] = useState('ETH');

  // Determine if this is a LISK saving
  useEffect(() => {
    if (plan.tokenId && plan.tokenId.toLowerCase() === LISK_TOKEN_ADDRESS.toLowerCase()) {
      setTokenType('LISK');
    } else {
      setTokenType('ETH');
    }
  }, [plan.tokenId]);

  // Fetch conversion rate and convert amount
  useEffect(() => {
    const fetchConversionRate = async () => {
      try {
        const ethAmount = parseFloat(plan.savedAmount);
        
        if (tokenType === 'LISK') {
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
              timeout: 5000 // Reduce timeout to 5 seconds
            });

            if (response.data && response.data.lisk && response.data.lisk.eth) {
              const liskEthRate = response.data.lisk.eth;
              const liskAmount = ethAmount / liskEthRate;
              setConvertedAmount(liskAmount);
            } else {
              // Use fallback rate if API response is invalid
              const liskAmount = ethAmount / FALLBACK_LISK_ETH_RATE;
              setConvertedAmount(liskAmount);
              console.warn('Using fallback conversion rate');
            }
          } catch (error) {
            // Use fallback rate if API call fails
            const liskAmount = ethAmount / FALLBACK_LISK_ETH_RATE;
            setConvertedAmount(liskAmount);
            console.warn('API call failed, using fallback conversion rate:', error.message);
          }
        } else {
          setConvertedAmount(ethAmount);
        }
      } catch (error) {
        console.error('Error in conversion:', error);
        setConvertedAmount(parseFloat(plan.savedAmount));
      }
    };

    fetchConversionRate();
  }, [plan.savedAmount, tokenType]);

  const handleTopUpClick = async () => {
    setIsLoading(true);
    try {
      await onTopUp(plan.name);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawClick = async () => {
    setIsLoading(true);
    try {
      await onWithdraw(plan.name);
    } finally {
      setIsLoading(false);
    }
  };

  const showWithdrawModal = () => {
    setIsWithdrawModalVisible(true);
  };

  const handleWithdrawClose = () => {
    setIsWithdrawModalVisible(false);
  };

  const formatTimeAgo = (startTimestamp) => {
    try {
      const startDate = new Date(parseInt(startTimestamp));
      const now = new Date();
      
      // Ensure valid dates
      if (isNaN(startDate.getTime()) || isNaN(now.getTime())) {
        return 'Date not available';
      }

      // For debugging
      console.log('Start date:', startDate.toISOString());
      console.log('Now:', now.toISOString());

      // If the savings was created in the future
      if (startDate > now) {
        return `Created ${startDate.toLocaleDateString()}`;
      }

      // Calculate the exact difference
      const diffTime = Math.abs(now - startDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Calculate months and remaining days more precisely
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();
      const startDay = startDate.getDate();
      
      const nowYear = now.getFullYear();
      const nowMonth = now.getMonth();
      const nowDay = now.getDate();

      let months = (nowYear - startYear) * 12 + (nowMonth - startMonth);
      let days = nowDay - startDay;

      // Adjust for negative days
      if (days < 0) {
        months--;
        // Get the last day of the previous month
        const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        days = lastDayOfLastMonth + days;
      }

      // Format the output
      if (months === 0) {
        return days === 1 ? '1 day ago' : `${days} days ago`;
      } else if (months === 1) {
        return days === 0 
          ? '1 month ago'
          : `1 month and ${days} ${days === 1 ? 'day' : 'days'} ago`;
      } else {
        return days === 0
          ? `${months} months ago`
          : `${months} months and ${days} ${days === 1 ? 'day' : 'days'} ago`;
      }

    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date not available';
    }
  };

  const NetworkButton = () => (
    <div className={bit.network_badge}>
      <Image
        src={NETWORK_CONFIG[tokenType].logo}
        alt={`${tokenType} Logo`}
        width={24}
        height={24}
      />
      <span>{tokenType}</span>
    </div>
  );

  const formatAmount = () => {
    if (convertedAmount === null) return 'Loading...';
    
    try {
      const config = NETWORK_CONFIG[tokenType];
      const decimals = convertedAmount < 1 ? 6 : 4;
      const formattedAmount = convertedAmount.toFixed(decimals);
      return `${formattedAmount} ${config.symbol}`;
    } catch (error) {
      console.error('Error formatting amount:', error);
      return `${plan.savedAmount} ETH`;
    }
  };

  return (
    <div className={bit.bit_card}>
      <div className={bit.network_container}>
        <NetworkButton />
      </div>
      <div className={`${bit.row} ${bit.compact_row}`}>
        <div className={bit.car_icon}>
          <div className={bit.square_div} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faSackDollar} style={{ color: '#687a7f', fontSize: '20px' }} />
          </div>
        </div>
        <div className={bit.description}>
          <span className={bit.description_bold}>{plan.name}</span><br />
          <span style={{ color: '#B4BCBF', fontSize: '10px' }}>Created {plan.createdDate}</span>
        </div>
        <div className={bit.top_up_section}>
          {plan.isCompleted ? (
            <button 
              className={bit.completed_button}
              disabled
            >
              <FontAwesomeIcon icon={faCheck} style={{ color: '#81D7B4', marginRight: '5px' }} />
              Done
            </button>
          ) : (
            <button 
              className={bit.top_up_button} 
              onClick={handleTopUpClick}
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faPlus} style={{ color: '#687a7f', marginRight: '5px' }} />
              {isLoading ? "Please wait..." : "Top Up"}
            </button>
          )}
        </div>
      </div>
      <hr className={bit.separator} />
      <div className={`${bit.additional_info} ${bit.compact_info}`}>
        <span className={bit.saved_amount}>{formatAmount()}</span>
        <span className={bit.reward}>Your set penalty is {plan.penalty}</span>
      </div>
      <div className={bit.progress_bar}>
        <div className={bit.progress} style={{ width: `${plan.progress}%`, backgroundColor: '#81D7B4' }}></div>
      </div>
      <div className={`${bit.progress_text} ${bit.compact_progress}`}>
        {plan.progress}%
        <span className={bit.progress_info} style={{ color: '#C0C0C0', fontSize: '12px' }}>
          {plan.isCompleted ? formatTimeAgo(plan.startTimestamp) : plan.remainingTime}
        </span>
      </div>
      <div className={bit.withdraw_container}>
        <button className={bit.top_up_button2} onClick={handleWithdrawClick}>
          <FontAwesomeIcon icon={faArrowDown} style={{ color: '#687a7f', marginRight: '5px' }} />
          Withdraw
        </button>
      </div>

      {/* <WithdrawModal 
        isVisible={isWithdrawModalVisible} 
        onClose={handleWithdrawClose} 
        onWithdraw={onWithdraw}
        savingName={plan.name}
      /> */}
    </div>
  );
};

export default SavingsPlanCard;
