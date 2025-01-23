import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd/lib";

const TopUpModal = ({ isVisible, onClose, onTopUp, savingName, network }) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onFinish = async (values) => {
    try {
      const { amount } = values;
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        throw new Error("Invalid amount entered.");
      }

      setIsSubmitting(true);

      // Pass amount, savings plan name, and network type to the handler
      await onTopUp(amount, savingName, network);
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
            Top up for <strong>{savingName}</strong> on{" "}
            <strong>{network === "lisk" ? "Lisk" : "Base"}</strong> network.
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
                return Promise.reject(
                  new Error("Amount must be a positive number.")
                );
              },
            },
          ]}
        >
          <Input
            type="number"
            step="any"
            placeholder={`Enter amount (${network === "lisk" ? "LSK" : "USDC"})`}
            prefix={network === "lisk" ? "LSK" : "USDC"}
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