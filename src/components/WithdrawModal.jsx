import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd/lib';

const WithdrawModal = ({ isVisible, onClose, onWithdraw }) => {
  const [form] = Form.useForm();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [savingsName, setSavingsName] = useState('');

  const handleContinue = (values) => {
    setSavingsName(values.nameOfSavings);
    setShowConfirmation(true);
  };

  const handleWithdraw = () => {
    onWithdraw(savingsName);
    setShowConfirmation(false);
    form.resetFields();
    onClose();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  return (
    <Modal
      title="Withdraw Savings"
      open={isVisible}
      onCancel={onClose}
      footer={null}
    >
      {!showConfirmation ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleContinue}
        >
          <Form.Item
            name="nameOfSavings"
            label="Enter Name of Savings"
            rules={[{ required: true, message: 'Please enter the name of savings.' }]}
          >
            <Input placeholder="Enter savings name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{
              backgroundColor: "#81D7B4",
              borderColor: "#81D7B4",
              color: "#fff",
              fontFamily: "Space Grotesk",
              marginRight: "10px",
            }}>
              Continue
            </Button>
            <Button onClick={onClose}>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <div>
          <p>Withdrawing your savings before the maturity date will cause you to lose money based on the penalty set. Do you want to continue?</p>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" onClick={handleWithdraw} style={{
              backgroundColor: "#81D7B4",
              borderColor: "#81D7B4",
              color: "#fff",
              fontFamily: "Space Grotesk",
              marginRight: "10px",}}>
              Yes, Continue
            </Button>
            <Button onClick={handleCancelConfirmation}>
              Cancel Withdrawal
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default WithdrawModal;
