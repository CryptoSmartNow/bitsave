import React from 'react';
import bit from '../styles/bitdash.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSackDollar, faPlus } from '@fortawesome/free-solid-svg-icons';

const SavingsPlanCard = ({ plan }) => {
  return (
    <div className={bit.bit_card}>
      <div className={bit.row}>
        <div className={bit.car_icon}>
          <div className={bit.square_div} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FontAwesomeIcon icon={faSackDollar} style={{ color: '#687a7f', fontSize: '24px' }} />
          </div>
        </div>
        <div className={bit.description}>
          <span className={bit.description_bold}>{plan.name}</span><br />
          <span style={{ color: '#B4BCBF', fontSize: '10px' }}>Created {plan.createdDate}</span>
        </div>
        <div className={bit.top_up_section}>
          <button className={bit.top_up_button}>
            <FontAwesomeIcon icon={faPlus} style={{ color: '#687a7f', marginRight: '5px' }} />
            Top Up
          </button>
        </div>
      </div>
      <hr className={bit.separator} />
      <div className={bit.additional_info}>
        <span className={bit.saved_amount}>{plan.savedAmount}</span>
        <div className={bit.vertical_separator}></div>
        <span className={bit.reward}>Your set penalty is {plan.penalty}</span>
      </div>
      <div className={bit.progress_bar}>
        <div className={bit.progress} style={{ width: `${plan.progress}%`, backgroundColor: '#81D7B4' }}></div>
      </div>
      <div className={bit.progress_text}>
        {plan.progress}%<span className={bit.progress_info} style={{ color: '#C0C0C0', fontSize: '12px' }}>{plan.remainingTime}</span>
      </div>
    </div>
  );
};

export default SavingsPlanCard;
