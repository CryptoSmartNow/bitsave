import React, { useState, useEffect } from 'react';
import bit from '../styles/bitdash.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSackDollar, faPlus, faArrowDown, faCheck } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import WithdrawModal from './WithdrawModal';

// Base network configuration
const NETWORK_CONFIG = {
  BASE: {
    symbol: 'USDC', // USDC is the token used on Base
    logo: '/base-logo.png', // Update with the correct logo path
    decimals: 6, // USDC uses 6 decimals
  },
};

const SavingsPlanCard = ({ plan, onTopUp, onWithdraw }) => {
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine if this is a Base saving (default)
  const tokenType = 'BASE'; // Since we're only using Base now

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

  const NetworkButton = () => {
    if (!tokenType || !NETWORK_CONFIG[tokenType]) {
      return null; // Return nothing if tokenType is undefined or invalid
    }
    return (
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
  };

  // const formatAmount = () => {
  //   try {
  //     const savedAmountString = plan.savedAmount.toString();
  //     const savedAmount = parseFloat(savedAmountString);
  
  //     if (isNaN(savedAmount)) {
  //       console.error("Invalid saved amount:", plan.savedAmount);
  //       return "Invalid amount";
  //     }
  
  //     // Convert the amount correctly (USDC has 6 decimals)
  //     const usdcAmount = savedAmount * Math.pow(10, 6); 
  
  //     // Format to remove scientific notation
  //     const formattedAmount = usdcAmount % 1 === 0 ? usdcAmount.toFixed(0) : usdcAmount.toFixed(2);
  
  //     return `${formattedAmount} USDC`;
  //   } catch (error) {
  //     console.error("Error formatting amount:", error);
  //     return `${plan.savedAmount} USDC`;
  //   }
  // };

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
        <span className={bit.saved_amount}>{plan.savedAmount} {NETWORK_CONFIG[tokenType].symbol} </span>
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
    </div>
  );
};

export default SavingsPlanCard;