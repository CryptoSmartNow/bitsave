import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, message } from 'antd/lib';

const TopUpModal = ({ isVisible, onClose, onTopUp, savingName }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lskToEthRate, setLskToEthRate] = useState(null);

  useEffect(() => {
    fetchLskToEthRate();
  }, []);

  const fetchLskToEthRate = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=lisk&vs_currencies=eth"
      );
      const data = await response.json();
      setLskToEthRate(data.lisk.eth);
    } catch (error) {
      console.error("Error fetching LSK/ETH rate:", error);
      message.error("Could not fetch conversion rate. Please try again later.");
    }
  };

  const onFinish = async (values) => {
    try {
      setIsSubmitting(true);
      const { amount } = values;
      
      if (!lskToEthRate) {
        throw new Error("Conversion rate not available");
      }

      // Convert LSK amount to ETH with proper decimal handling
      const lskAmount = parseFloat(amount);
      const ethAmount = (lskAmount * lskToEthRate).toString();
      
      console.log(`Converting ${lskAmount} LSK to ${ethAmount} ETH`);
      
      await onTopUp(savingName, ethAmount);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Top-up error:', error);
      message.error(error.message || 'Error processing top-up.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Top Up Savings"
      open={isVisible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        {savingName && (
          <p style={{ marginBottom: '16px' }}>
            Enter the amount you want to top up for <strong>{savingName}</strong>
          </p>
        )}

        <Form.Item
          name="amount"
          rules={[{ required: true, message: 'Please enter the amount.' }]}
        >
          <Input 
            type="number" 
            step="any" 
            placeholder="Enter LSK amount" 
            prefix="LSK"
            autoFocus
            disabled={isSubmitting}
          />
        </Form.Item>

        {lskToEthRate && (
          <p style={{ fontSize: '12px', color: '#666' }}>
            1 LSK = {lskToEthRate} ETH
          </p>
        )}

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isSubmitting}
            disabled={isSubmitting || !lskToEthRate}
            style={{
              backgroundColor: "#81D7B4",
              borderColor: "#81D7B4",
              color: "#fff",
              fontFamily: "Space Grotesk",
              marginRight: "10px",
            }}
          >
            {isSubmitting ? "Please wait..." : "Top Up"}
          </Button>
          <Button 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TopUpModal;
