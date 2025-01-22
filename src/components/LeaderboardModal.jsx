import React from 'react';
import { Modal, Table } from 'antd/lib';

const LeaderboardModal = ({ isVisible, onClose, data }) => {
  const columns = [
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Savings Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
  ];

  return (
    <Modal
      title="Leaderboard"
      visible={isVisible}
      onCancel={onClose}
      footer={null}
      centered
      width={600}
    >
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="rank"
      />
    </Modal>
  );
};

export default LeaderboardModal; 