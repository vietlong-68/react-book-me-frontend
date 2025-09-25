import React, { useState } from 'react';
import { Layout, Avatar, Dropdown, Button, Space, message, Input } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, CopyOutlined, FileTextOutlined, CalendarOutlined, AppstoreOutlined, DashboardOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { getAvatarUrl } from '../utils/imageUtils';

const { Header: AntHeader } = Layout;

const Header = () => {
    const navigate = useNavigate();
    const user = authService.getUser();
    const [searchTerm, setSearchTerm] = useState('');


    const handleLogout = async () => {
        try {
            await authService.logout();
            message.success('Đăng xuất thành công!');
            navigate('/login');
        } catch (error) {
            navigate('/login');
        }
    };

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/services?search=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
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
                height: '64px',
                minHeight: '64px'
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


            <div style={{
                flex: 1,
                maxWidth: '500px',
                margin: '0 32px',
                display: 'flex',
                justifyContent: 'center'
            }}>
                <Input.Search
                    placeholder="Tìm kiếm dịch vụ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onSearch={handleSearch}
                    onKeyPress={handleSearchKeyPress}
                    enterButton={<SearchOutlined />}
                    size="large"
                    style={{
                        borderRadius: '25px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: '1px solid #d9d9d9',
                        width: '100%'
                    }}
                    allowClear
                />
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '200px',
                justifyContent: 'flex-end'
            }}>
                <span style={{
                    color: '#666',
                    fontSize: '14px',
                    fontWeight: '500'
                }}>
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
                            padding: '6px 12px',
                            borderRadius: '8px',
                            height: 'auto',
                            border: '1px solid #f0f0f0',
                            background: '#fafafa'
                        }}
                    >
                        <Avatar
                            size="small"
                            icon={<UserOutlined />}
                            src={getAvatarUrl(user?.avatarUrl)}
                        />
                    </Button>
                </Dropdown>
            </div>
        </AntHeader>
    );
};

export default Header;
