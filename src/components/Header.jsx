import React from 'react';
import { Layout, Avatar, Dropdown, Button, Space, message } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const { Header: AntHeader } = Layout;

const Header = () => {
    const navigate = useNavigate();
    const user = authService.getUser();


    const handleLogout = async () => {
        try {
            await authService.logout();
            message.success('Đăng xuất thành công!');
            navigate('/login');
        } catch (error) {


            navigate('/login');
        }
    };


    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Trang cá nhân',
            onClick: () => {


            },
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Cài đặt',
            onClick: () => {


            },
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
        },
    ];

    return (
        <AntHeader
            style={{
                background: '#fff',
                padding: '0 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
            }}
        >

            <div
                style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1890ff',
                    cursor: 'pointer',
                }}
                onClick={() => navigate('/')}
            >
                Book Me
            </div>


            <Space>
                <span style={{ color: '#666' }}>
                    Xin chào, {user?.displayName || 'User'}
                </span>
                <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    arrow
                >
                    <Button
                        type="text"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '4px 8px',
                        }}
                    >
                        <Avatar
                            size="small"
                            icon={<UserOutlined />}
                            src={user?.avatarUrl}
                        />
                    </Button>
                </Dropdown>
            </Space>
        </AntHeader>
    );
};

export default Header;
