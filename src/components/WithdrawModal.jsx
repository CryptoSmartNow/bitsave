import React, { useState } from "react";
import { Modal, Button } from "antd/lib";

const WithdrawModal = ({ isVisible, onClose, onWithdraw, savingName, penaltyPercentage }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWithdraw = async () => {
    setIsSubmitting(true);
    try {
      // Call the onWithdraw function with the savings name
      await onWithdraw(savingName);
      onClose(); // Close the modal after successful withdrawal
    } catch (error) {
      console.error("Withdrawal error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Withdraw Savings"
      open={isVisible}
      onCancel={onClose}
      footer={null}
    >
      <p>
        Do you want to withdraw your savings for <strong>{savingName}</strong>?
      </p>

      {/* Warning message about the penalty */}
      <p style={{ color: "#ff4d4f", fontWeight: "bold" }}>
        Warning: If you proceed, you will lose {penaltyPercentage}% of your savings as a penalty.
      </p>

      <div style={{ textAlign: "right" }}>
        <Button
          onClick={onClose}
          style={{ marginRight: "10px" }}
        >
          Cancel
        </Button>
        <Button
          type="primary"
          onClick={handleWithdraw}
          loading={isSubmitting}
          style={{
            backgroundColor: "#81D7B4",
            borderColor: "#81D7B4",
            color: "#fff",
            fontFamily: "Space Grotesk",
          }}
        >
          Withdraw
        </Button>
      </div>
    </Modal>
  );
};

export default WithdrawModal;