import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd/lib";

const TopUpModal = ({ isVisible, onClose, onTopUp, savingName }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFinish = async (values) => {
    try {
      const { amount } = values;
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        throw new Error("Invalid amount entered.");
      }

      setIsSubmitting(true);

      // Pass amount and savings plan name to the handler
      await onTopUp(amount, savingName);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Top-up error:", error);
      message.error(error.message || "Error processing top-up.");
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
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {savingName && (
          <p style={{ marginBottom: "16px" }}>
            Enter the amount you want to top up for <strong>{savingName}</strong>
          </p>
        )}

        <Form.Item
          name="amount"
          rules={[
            { required: true, message: "Please enter the amount." },
            {
              validator: (_, value) => {
                if (!value || parseFloat(value) > 0) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Amount must be a positive number."));
              },
            },
          ]}
        >
          <Input
            type="number"
            step="any"
            placeholder="Enter LSK amount"
            prefix="LSK"
            autoFocus
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{
              backgroundColor: "#81D7B4",
              borderColor: "#81D7B4",
              color: "#fff",
              fontFamily: "Space Grotesk",
              marginRight: "10px",
            }}
            loading={isSubmitting}
          >
            Top Up
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TopUpModal;