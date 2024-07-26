import React from 'react';
import { Modal, Form, Input, Button, message } from 'antd/lib';

const TopUpModal = ({ isVisible, onClose, onTopUp }) => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      // Convert amount to string for handleTopUp
      const { nameOfSavings, amount } = values;
      const amountInString = amount.toString(); // Convert to string if necessary

      // Call handleTopUp with form values
      await onTopUp(nameOfSavings, amountInString);
      form.resetFields(); // Clear form fields after successful top-up
      onClose(); // Close the modal
    } catch (error) {
      message.error('Error processing top-up.');
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
        <Form.Item
          name="nameOfSavings"
          label="Name of Savings"
          rules={[{ required: true, message: 'Please enter the name of savings.' }]}
        >
          <Input placeholder="Enter savings name" />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          rules={[{ required: true, message: 'Please enter the amount.' }]}
        >
          <Input type="number" step="any" placeholder="Enter amount" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" style={{
              backgroundColor: "#81D7B4",
              borderColor: "#81D7B4",
              color: "#fff",
              fontFamily: "Space Grotesk",
              marginRight: "10px", }}>
            Top Up
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TopUpModal;
