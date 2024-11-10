import React, { useState } from 'react';
import { Modal, Table, DatePicker, Empty } from 'antd';
import moment from 'moment';

const { RangePicker } = DatePicker;

const PersonHistory = ({ visible, person, onCancel }) => {
  const [dateRange, setDateRange] = useState(null);

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const filterTimeEntries = (timeEntries) => {
    if (!dateRange) {
      return timeEntries;
    }
  
    const [startDate, endDate] = dateRange.map(date => new Date(date));
    const endDateTime = new Date(endDate.getTime());
    endDateTime.setHours(23, 59, 59, 999); // Set the end time to 23:59:59.999
  
    return timeEntries.filter((entry) => {
      const entryTime = new Date(entry.entry_time);
      const exitTime = new Date(entry.exit_time);
      return (
        (entryTime >= startDate && entryTime <= endDateTime) ||
        (exitTime >= startDate && exitTime <= endDateTime) ||
        (entryTime < startDate && exitTime > endDateTime)
      );
    });
  };
  

  const columns = [
    {
      title: 'Entry Time',
      dataIndex: 'entry_time',
      key: 'entry_time',
      render: (entryTime) => moment(entryTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Exit Time',
      dataIndex: 'exit_time',
      key: 'exit_time',
      render: (exitTime) => moment(exitTime, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  // Check if the person prop is not null or undefined
  if (!person) {
    return null; // Return null to prevent rendering the component
  }

  // Check if the time_entries array is empty or undefined
  if (!person.time_entries || person.time_entries.length === 0) {
    return (
      <Modal
        open={visible}
        title={`Activity Logs of ${person.name || ''}`}
        onCancel={onCancel}
        footer={null}
        width={1200}
        height={800}
        style={{ top: 20 }}
      >
        <Empty description="No time entries found" />
      </Modal>
    );
  }

  const filteredTimeEntries = filterTimeEntries(person.time_entries);

  return (
    <Modal
      open={visible}
      title={`Activity Logs of ${person.name || ''}`}
      onCancel={onCancel}
      footer={null}
      width={1200}
      height={800}
      style={{ top: 20 }}
    >
      <RangePicker
        onChange={handleDateRangeChange}
        style={{ marginBottom: 16 }}
      />
      <Table
        columns={columns}
        dataSource={filteredTimeEntries}
        rowKey={(record, index) => `${record.id || index}`}
        pagination={{ pageSize: 15 }}
        scroll={{ y: 600 }}
      />
    </Modal>
  );
};

export default PersonHistory;