import React, { useState } from 'react';

import {
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
  ContainerOutlined,
  DesktopOutlined,
  MailOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { Button, Input, Space, Table, Layout, Menu } from 'antd';
import Highlighter from 'react-highlight-words';

import Dashboard from './pages/Dashboard';
import SystemStatus from './pages/SystemStatus';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';

const { Header, Content, Sider } = Layout;

const items = [
  {
    key: 'Dashboard',
    icon: <PieChartOutlined />,
    label: 'Dashboard',
  },
  {
    key: 'System Status',
    icon: <DesktopOutlined />,
    label: 'System Status',
  },
  {
    key: 'Admin Panel',
    icon: <ContainerOutlined />,
    label: 'Admin Panel',
  },
  {
    key: 'Settings',
    label: 'Settings',
    icon: <MailOutlined />,
  },
];

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState('Dashboard');

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    return (
      <div className="App">
        <header className="App-header">
          <h1>Camera IP Finder</h1>
          <SystemStatus />
        </header>
      </div>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'Dashboard':
        return <Dashboard />;
      case 'System Status':
        return <SystemStatus />;
      case 'Admin Panel':
        return <AdminPanel />;
      case 'Settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', width: '100vw' }}>
      <Header style={{ background: '#000', color: '#fff', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: 'white', fontSize: '24px', textAlign: 'left', flex: 1 }}>Secure Premises</div>
      </Header>
      <Layout>
        <Sider collapsible collapsed={collapsed} onCollapse={toggleCollapsed} width={256}>
          <Menu
            theme="dark"
            defaultSelectedKeys={['Dashboard']}
            mode="inline"
            items={items}
            onClick={(item) => setCurrentPage(item.key)}
          />
        </Sider>
        <Layout>
          <Content style={{ margin: '24px 16px', paddingTop: 0, background: '#ffffff', minHeight: 280 }}>
            {renderPage()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
