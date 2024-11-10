import React, { useRef, useState, useEffect } from 'react';
import { getPeople, updatePerson, createPerson } from "../apiService";
import { SearchOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, Popconfirm, Modal, Form, Input as AntInput } from 'antd';
import { notification } from 'antd';
import Highlighter from 'react-highlight-words';
import axios from 'axios';

const AdminPanel = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();
  const searchInput = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const people = await getPeople();
      console.log('Fetched data:', people);
      setData(people);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleEdit = async (record) => {
    console.log('Editing record:', record);
    setEditingRecord(record);
    setIsAddMode(false);
    setIsModalOpen(true);
    form.setFieldsValue({
      old_name: record.name, // Include the old name
      name: record.name, // Set the initial value for the name field
      eid: record.eid,
      email: record.email,
    });
  };
  
  

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const handleDelete = async (record) => {
    try {
      const response = await axios.delete(`http://localhost:5003/api/people/${record.name}`);
      const responsee = await axios.delete(`http://localhost:5000/api/people/${record.name}`);
      if (response.status === 200) {
        const updatedData = data.filter((item) => item.name !== record.name);
        setData(updatedData);
        console.log('Record deleted successfully');
        notification.success({
          message: 'Success',
          description: 'Record deleted successfully',
        });
      } else {
        console.error('Failed to delete record');
        notification.error({
          message: 'Error',
          description: 'Failed to delete record',
        });
      }
      if (responsee.status === 200) {
        const updatedData = data.filter((item) => item.name !== record.name);
        setData(updatedData);
        console.log('Record deleted successfully in chroma');
        notification.success({
          message: 'Success',
          description: 'Record deleted successfully in chroma',
        });
      } else {
        console.error('Failed to delete record in chroma');
        notification.error({
          message: 'Error',
          description: 'Failed to delete record in chroma',
        });
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      notification.error({
        message: 'Error',
        description: `Error deleting record: ${error.message}`,
      });
    }
  };

  const handleAddNew = () => {
    setIsAddMode(true);
    setEditingRecord(null);
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
  
      if (isAddMode) {
        const newPerson = {
          name: values.name,
          eid: values.eid,
          email: values.email,
          time_entries: [],
        };
        await createPerson(newPerson);
        fetchData();
      } else {
        const response = await axios.post(`http://localhost:5000/api/people/edit`, {
          old_name: editingRecord.name,
          name: values.name,
          eid: values.eid,
          email: values.email,
        });
        const updatedData = [...data];
        const personIndex = updatedData.findIndex(
          (person) => person._id === editingRecord._id
        );
  
        if (personIndex !== -1) {
          const updatedPerson = {
            name: values.name || editingRecord.name,
            eid: values.eid,
            email: values.email,
            time_entries: editingRecord.time_entries,
          };
  
          const response = await updatePerson(editingRecord._id, updatedPerson);
          updatedData[personIndex] = response.data;
          setData(updatedData);
          console.log('Record updated successfully');
        } else {
          console.error('Person not found');
        }
      }
  
      setIsModalOpen(false);
      setIsAddMode(false);
      setEditingRecord(null);
      form.resetFields();
    } catch (error) {
      console.error('Error updating/creating record:', error);
    }
  };
  

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button type="link" size="small" onClick={() => close()}>
            Close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }} searchWords={[searchText]} autoEscape textToHighlight={text ? text.toString() : ''} />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      ...getColumnSearchProps('name'),
    },
    {
      title: 'E.id',
      dataIndex: 'eid',
      key: 'eid',
      width: '15%',
      ...getColumnSearchProps('eid'),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: '30%',
      ...getColumnSearchProps('email'),
    },
    {
      title: 'Action',
      key: 'action',
      width: '30%',
      render: (text, record) => (
      
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)} icon={<EditOutlined />}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to remove this person?"
            onConfirm={() => handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>

        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', height: '6%', width: '94%' }}>
        <div style={{ flexGrow: 1 }} />
        <Button type="primary" onClick={handleAddNew} icon={<PlusOutlined />}>
          Add Face
        </Button>
      </Space>
      <Table columns={columns} dataSource={data} rowKey="_id" />
      <Modal
        title={isAddMode ? 'Add New Person' : 'Edit Record'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={isAddMode ? 'Add' : 'Save'}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter a name' }]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item
            name="eid"
            label="E.id"
            rules={[{ required: false, message: 'Please enter an E.id' }]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: 'Please enter an email' }]}
          >
            <AntInput />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AdminPanel;