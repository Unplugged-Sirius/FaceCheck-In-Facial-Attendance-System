import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPerson } from '../apiService';
import { Form, Input, Button, Alert, Space, Switch } from 'antd';

const AddPerson = () => {
  const [visible, setVisible] = useState(true); 
  const handleClose = () => {
    setVisible(false);
  };

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const newPerson = {
        name: values.name,
        eid: values.eid,
        email: values.email,
      };
      await createPerson(newPerson);
      navigate('/admin-panel', { state: { message: 'success' } });

    } catch (error) {
      console.error('Error creating person:', error);
    }
  };

  return (
    <div>
      <Space
        direction="vertical"
        style={{
          width: '100%',
        }}
      >
        {visible && (
          <Alert message="Alert Message Text" type="success" closable afterClose={handleClose} />
        )}
        <p>Click the close button to see the effect</p>
        <Switch onChange={setVisible} checked={visible} disabled={visible} />
      </Space>
      <h2>Add New Person</h2>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, message: 'Please enter a name' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="eid"
          label="E.id"
          rules={[{ required: true, message: 'Please enter an E.id' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Please enter an email' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddPerson;
