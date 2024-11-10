import './blinkingDot.css';
import React, { useState, useEffect } from 'react';
import { getPeople } from '../apiService';
import { Table, DatePicker, Badge, Tooltip, Input, Select } from 'antd';
import moment from 'moment';
import PersonHistory from './PersonHistory';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;

const Dashboard = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [dateRange, setDateRange] = useState([moment().startOf('day'), moment().endOf('day')]); // Initialize dateRange with today's date
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [showPersonHistory, setShowPersonHistory] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All'); // State for selected dropdown value

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPeople();
        setEmployees(data);
        setFilteredEmployees(data); // Initialize filteredEmployees with all employees
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const filteredData = employees.filter((employee) =>
      employee.name.toLowerCase().includes(searchText.toLowerCase()) ||
      employee.eid.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredEmployees(filteredData);
  }, [searchText, employees]);

  const handleDropdownChange = (value) => {
    setSelectedFilter(value);
  };

  const calculateStayDuration = (timeEntries) => {
    let totalDuration = 0;
    const today = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
    const todayEnd = moment().endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

    timeEntries.forEach((entry) => {
      const entryTime = entry.entry_time;
      const exitTime = entry.exit_time || moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

      if (
        (!dateRange ||
          (entryTime >= dateRange[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z' &&
            entryTime <= dateRange[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z')) &&
        (!dateRange ||
          (exitTime >= dateRange[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z' &&
            exitTime <= dateRange[1].endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z'))
      ) {
        const duration = moment(exitTime).diff(moment(entryTime));
        totalDuration += duration;

      }
    });
    return totalDuration;
  };
  

  const isEmployeeActive = (timeEntries) => {
    const latestEntry = timeEntries.slice(-1)[0];
    if (latestEntry && !latestEntry.exit_time) {
      return true; // Employee is currently in the office
    }
    return false; // Employee is not in the office
  };

  const getUserStatus = (timeEntries) => {
    const todayEntries = timeEntries.filter((entry) => {
      const entryTime = moment(entry.entry_time, 'YYYY-MM-DD HH:mm:ss');
      const exitTime = moment(entry.exit_time, 'YYYY-MM-DD HH:mm:ss');
      return entryTime.isValid() && entryTime.isSame(moment(), 'day');
    });

    if (todayEntries.length === 0) {
      const lastEntry = timeEntries.slice(-1)[0];
      const lastExitTime = lastEntry ? moment(lastEntry.exit_time, 'YYYY-MM-DD HH:mm:ss') : null;
      return {
        status: 'Offline',
        color: 'red',
        lastEntryTime: '',
        lastExitTime: lastExitTime ? lastExitTime.format('YYYY-MM-DD HH:mm:ss') : '',
      };
    }

    const openEntry = todayEntries.find((entry) => !entry.exit_time);

    if (openEntry) {
      const entryTime = moment(openEntry.entry_time, 'YYYY-MM-DD HH:mm:ss');
      return {
        status: 'Online',
        color: 'green',
        blinking: true, // Add this line  
        lastEntryTime: entryTime.format('YYYY-MM-DD HH:mm:ss'),
        lastExitTime: '',
      };
    } else {
      const latestEntry = todayEntries.reduce((prev, curr) => {
        const prevTime = moment(prev.entry_time, 'YYYY-MM-DD HH:mm:ss');
        const currTime = moment(curr.entry_time, 'YYYY-MM-DD HH:mm:ss');
        return prevTime.isAfter(currTime) ? prev : curr;
      }, { entry_time: '1970-01-01 00:00:00' });

      const latestEntryTime = moment(latestEntry.entry_time, 'YYYY-MM-DD HH:mm:ss');
      const latestExitTime = moment(latestEntry.exit_time, 'YYYY-MM-DD HH:mm:ss');

      return {
        status: 'Offline',
        color: 'red',
        lastEntryTime: latestEntryTime.format('YYYY-MM-DD HH:mm:ss'),
        lastExitTime: latestExitTime.format('YYYY-MM-DD HH:mm:ss'),
      };
    }
  };

  const handlePersonClick = (person) => {
    setSelectedPerson(person);
    setShowPersonHistory(true);
  };

  const handlePersonHistoryCancel = () => {
    setSelectedPerson(null);
    setShowPersonHistory(false);
  };

  const getEntryExitTimes = (timeEntries) => {
    const entryTimes = [];
    const exitTimes = [];

    if (dateRange && dateRange.length === 2) {
      const startDate = dateRange[0].startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
      const endDate = dateRange[0].endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';

      timeEntries.forEach((entry) => {
        const entryTime = entry.entry_time;
        const exitTime = entry.exit_time;

        if (
          entryTime >= startDate &&
          entryTime <= endDate &&
          (!exitTime || (exitTime >= startDate && exitTime <= endDate))
        ) {
          entryTimes.push(moment.utc(entryTime).format('HH:mm'));
          exitTimes.push(exitTime ? moment.utc(exitTime).format('HH:mm') : '-');
        }
      });
    }

    return { entryTimes, exitTimes };
  };

  let columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '30%',
      render: (text, record) => (
        <a onClick={() => handlePersonClick(record)} style={{ color: 'black' }}>{text}</a>
      ),
    },
    {
      title: 'EID',
      width: '15%',
      dataIndex: 'eid',
      key: 'eid',
    },
    {
      title: 'Status',
      dataIndex: 'time_entries',
      key: 'status',
      width: '15%',
      render: (timeEntries) => {
        const { status, color, blinking, lastEntryTime, lastExitTime } = getUserStatus(timeEntries);
        return (
          <Tooltip
            title={
              status === 'Online'
                ? `Last Entry: ${lastEntryTime}`
                : status === 'Offline'
                  ? `Last Exit: ${lastExitTime}`
                  : ''
            }
            color="#0000ff"
            overlayInnerStyle={{ backgroundColor: '#c8e6c9' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                className={blinking ? 'blinking-dot' : ''}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  marginRight: '8px',
                }}
              />
              {status}
            </div>
          </Tooltip>
        );
      },
    },
  ];

  // Customize columns based on selectedFilter
  if (selectedFilter === 'All') {
    columns = [
      ...columns,
      {
        title: 'IN',
        dataIndex: 'time_entries',
        key: 'in',
        render: (timeEntries) => {
          const { entryTimes } = getEntryExitTimes(timeEntries);
          return entryTimes.join(', ');
        },
      },
      {
        title: 'OUT',
        dataIndex: 'time_entries',
        key: 'out',
        render: (timeEntries) => {
          const { exitTimes } = getEntryExitTimes(timeEntries);
          return exitTimes.join(', ');
        },
      },
      {
        title: 'Productive Time',
        dataIndex: 'stayDuration',
        key: 'stayDuration',
        render: (_, record) => {
          const durationInMilliseconds = calculateStayDuration(record.time_entries);
          const durationInHours = Math.floor(durationInMilliseconds / (1000 * 60 * 60));
          const durationInMinutes = Math.floor((durationInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

          if (durationInHours === 0 && durationInMinutes === 0) {
            return ''; // Return an empty string for 0 hours and 0 minutes
          }

          return `${durationInHours} hours ${durationInMinutes} minutes`;
        },
      },
    ];
  } else if (selectedFilter === 'Entry') {
    columns = [
      ...columns,
      {
        title: 'IN',
        dataIndex: 'time_entries',
        key: 'in',
        render: (timeEntries) => {
          const { entryTimes } = getEntryExitTimes(timeEntries);
          return entryTimes.join(', ');
        },
      },
    ];
  } else if (selectedFilter === 'Exit') {
    columns = [
      ...columns,
      {
        title: 'OUT',
        dataIndex: 'time_entries',
        key: 'out',
        render: (timeEntries) => {
          const { exitTimes } = getEntryExitTimes(timeEntries);
          return exitTimes.join(', ');
        },
      },
    ];
  } else if (selectedFilter === 'Entry_Exit') {
    columns = [
      ...columns,
      {
        title: 'IN',
        dataIndex: 'time_entries',
        key: 'in',
        render: (timeEntries) => {
          const { entryTimes } = getEntryExitTimes(timeEntries);
          return entryTimes.join(', ');
        },
      },
      {
        title: 'OUT',
        dataIndex: 'time_entries',
        key: 'out',
        render: (timeEntries) => {
          const { exitTimes } = getEntryExitTimes(timeEntries);
          return exitTimes.join(', ');
        },
      },
    ];
  }

  const handleDateChange = (dates, dateStrings) => {
    const [startDate, endDate] = dateStrings;
    const formattedStartDate = moment(startDate, 'YYYY-MM-DD HH:mm');
    const formattedEndDate = moment(endDate, 'YYYY-MM-DD HH:mm');
    setDateRange([formattedStartDate, formattedEndDate]);
  };
  

  // Reset dateRange when user clicks on RangePicker
  const handleRangePickerClick = () => {
    setDateRange(null); // Reset dateRange to null when RangePicker is clicked
  };

  return (
    <div>
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
        <RangePicker
  style={{ width: 300 }}
  onChange={handleDateChange}
  value={dateRange}
  onOpenChange={handleRangePickerClick}
  showTime={{ format: 'HH:mm' }} // Add this line to show time picker
  format="YYYY-MM-DD HH:mm" // Add this line to set the desired format
/>

          <Select
            defaultValue="All"
            style={{ width: 120 }}
            onChange={handleDropdownChange}
          >
            <Option value="All">All</Option>
            <Option value="Entry">Entry</Option>
            <Option value="Exit">Exit</Option>
            <Option value="Entry_Exit">Entry_Exit</Option>
          </Select>
        </div>
        <Search
          placeholder="Search by Name or EID"
          enterButton="Search"
          onSearch={(value) => setSearchText(value)}
          style={{ width: 250 }}
        />
      </div>

      <Table dataSource={filteredEmployees} columns={columns} rowKey="_id" />

      <PersonHistory
        visible={showPersonHistory}
        person={selectedPerson}
        onCancel={handlePersonHistoryCancel}
      />
    </div>
  );
};

export default Dashboard;