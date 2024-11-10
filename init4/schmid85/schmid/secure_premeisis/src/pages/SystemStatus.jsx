import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Switch } from 'antd';
import { VideoCameraAddOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Heading, Flex, Box, Text, VStack } from '@chakra-ui/react';

const styles = {
  container: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  heading: {
    color: '#333',
    marginBottom: '30px',
    fontWeight: 'bold',
    fontSize: '24px',
    textAlign: 'center',
  },
  switchContainer: {
    marginBottom: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchLabel: {
    color: '#555',
    fontSize: '16px',
    fontWeight: 'bold',
    marginRight: '10px',
  },
  cameraStatus: {
    color: '#555',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  cameraInfo: {
    color: '#777',
    fontSize: '14px',
  },
  infoContainer: {
    marginTop: '30px',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
};

const SystemStatus = () => {
  const [isFacialRecognitionEnabled, setIsFacialRecognitionEnabled] = useState(false);

  useEffect(() => {
    const storedStatus = localStorage.getItem('facialRecognitionStatus');
    if (storedStatus !== null) {
      setIsFacialRecognitionEnabled(storedStatus === 'false');
    }
  }, []);


  const handleToggle = async (checked) => {
    try {
      if (checked) {
        await axios.post('http://localhost:5001/api/start');
        console.log('Face recognition started');
      } else {
        await axios.post('http://localhost:5001/api/stop');
        console.log('Face recognition stopped');
      }
      localStorage.setItem('facialRecognitionStatus', checked);
      setIsFacialRecognitionEnabled(checked);
    } catch (error) {
      console.error('Error toggling face recognition:', error);
    }
  };

  return (
    <Box style={styles.container}>
      <Heading style={styles.heading}>System Status</Heading>
      <hr />
      <Flex alignItems="center" style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Enable Facial Recognition:</Text>
        <Switch
          checkedChildren={<VideoCameraAddOutlined />}
          unCheckedChildren={<VideoCameraOutlined />}
          checked={isFacialRecognitionEnabled}
          onChange={handleToggle}
        />
      </Flex>
      <Box style={styles.infoContainer}>
        <VStack align="start" spacing={2}>
          <Text style={styles.cameraStatus}>Camera Status:</Text>
          <Text style={styles.cameraInfo}>{isFacialRecognitionEnabled ? 'Active' : 'Inactive'}</Text>
          <Text style={styles.cameraStatus}>Camera Info:</Text>
          {/* <Text style={styles.cameraInfo}>Frame Rate: N/A</Text> */}
        </VStack>
      </Box>
    </Box>
  );
};

export default SystemStatus;