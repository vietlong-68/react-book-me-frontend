import React from 'react';
import { Layout, Avatar, Dropdown, Button, Space, message } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, CopyOutlined, FileTextOutlined, CalendarOutlined, AppstoreOutlined, DashboardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { getAvatarUrl } from '../utils/imageUtils';

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


    const getUserMenuItems = () => {
        const baseItems = [
            {
                key: 'profile',
                icon: <UserOutlined />,
                label: 'Trang cá nhân',
                onClick: () => {
                    navigate('/profile');
                },
            },
        ];

        const logoutItem = {
            type: 'divider',
        };

        const logoutButton = {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
        };

        switch (user?.role) {
            case 'USER':
                return [
                    ...baseItems,
                    {
                        key: 'register-provider',
                        icon: <CopyOutlined />,
                        label: 'Đăng ký nhà cung cấp',
                        onClick: () => {
                            navigate('/apply-provider');
                        },
                    },
                    {
                        key: 'my-applications',
                        icon: <FileTextOutlined />,
                        label: 'Đơn đăng ký của tôi',
                        onClick: () => {
                            navigate('/my-applications');
                        },
                    },
                    {
                        key: 'appointments',
                        icon: <CalendarOutlined />,
                        label: 'Lịch hẹn của tôi',
                        onClick: () => {
                            navigate('/appointments');
                        },
                    },
                    logoutItem,
                    logoutButton,
                ];

            case 'PROVIDER':
                return [
                    ...baseItems,
                    {
                        key: 'register-provider',
                        icon: <CopyOutlined />,
                        label: 'Đăng ký nhà cung cấp',
                        onClick: () => {
                            navigate('/apply-provider');
                        },
                    },
                    {
                        key: 'my-applications',
                        icon: <FileTextOutlined />,
                        label: 'Đơn đăng ký của tôi',
                        onClick: () => {
                            navigate('/my-applications');
                        },
                    },
                    {
                        key: 'appointments',
                        icon: <CalendarOutlined />,
                        label: 'Lịch hẹn của tôi',
                        onClick: () => {
                            navigate('/appointments');
                        },
                    },
                    {
                        key: 'manage-services',
                        icon: <AppstoreOutlined />,
                        label: 'Quản lý dịch vụ',
                        onClick: () => {
                            navigate('/service-management');
                        },
                    },
                    logoutItem,
                    logoutButton,
                ];

            case 'ADMIN':
                return [
                    ...baseItems,
                    {
                        key: 'admin-dashboard',
                        icon: <DashboardOutlined />,
                        label: 'Trang quản trị',
                        onClick: () => {
                            navigate('/admin');
                        },
                    },
                    logoutItem,
                    logoutButton,
                ];

            default:
                return [
                    ...baseItems,
                    logoutItem,
                    logoutButton,
                ];
        }
    };

    const userMenuItems = getUserMenuItems();

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
                            src={getAvatarUrl(user?.avatarUrl)}
                        />
                    </Button>
                </Dropdown>
            </Space>
        </AntHeader>
    );
};

export default Header;
