import React, { useState } from 'react';
import { Layout, Menu, Typography, Button } from 'antd';
import {
    DashboardOutlined,
    FileTextOutlined,
    UserOutlined,
    TeamOutlined,
    AppstoreOutlined,
    TagsOutlined,
    SettingOutlined,
    SecurityScanOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider, Content } = Layout;
const { Title } = Typography;

const AdminLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
        },
        {
            key: '/admin/applications',
            icon: <FileTextOutlined />,
            label: 'Xét duyệt Đơn đăng ký',
        },
        {
            key: 'user-management',
            icon: <UserOutlined />,
            label: 'Quản lý Tài khoản',
            children: [
                {
                    key: '/admin/users',
                    label: 'Người dùng (Users)',
                },
                {
                    key: '/admin/providers',
                    label: 'Nhà cung cấp (Providers)',
                },
            ],
        },
        {
            key: 'service-management',
            icon: <AppstoreOutlined />,
            label: 'Quản lý Dịch vụ',
            children: [
                {
                    key: '/admin/categories',
                    label: 'Danh mục (Categories)',
                },
                {
                    key: '/admin/services',
                    label: 'Tất cả Dịch vụ (Services)',
                },
            ],
        },
        {
            key: '/admin/system',
            icon: <SecurityScanOutlined />,
            label: 'Hệ thống',
        },
    ];

    const handleMenuClick = ({ key }) => {
        if (key.startsWith('/admin')) {
            navigate(key);
        }
    };

    const getSelectedKeys = () => {
        const path = location.pathname;
        if (path === '/admin') return ['/admin'];
        if (path.startsWith('/admin/applications')) return ['/admin/applications'];
        if (path.startsWith('/admin/users')) return ['/admin/users'];
        if (path.startsWith('/admin/providers')) return ['/admin/providers'];
        if (path.startsWith('/admin/categories')) return ['/admin/categories'];
        if (path.startsWith('/admin/services')) return ['/admin/services'];
        if (path.startsWith('/admin/system')) return ['/admin/system'];
        return [];
    };

    const getOpenKeys = () => {
        const path = location.pathname;
        if (path.startsWith('/admin/users') || path.startsWith('/admin/providers')) {
            return ['user-management'];
        }
        if (path.startsWith('/admin/categories') || path.startsWith('/admin/services')) {
            return ['service-management'];
        }
        return [];
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                style={{
                    background: '#fff',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                }}
                width={280}
            >
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #f0f0f0',
                    textAlign: 'center'
                }}>
                    <Title level={4} style={{
                        margin: 0,
                        color: '#1890ff',
                        fontSize: collapsed ? '16px' : '18px'
                    }}>
                        {collapsed ? 'AM' : 'Admin Panel'}
                    </Title>
                    <Button
                        type="link"
                        icon={<HomeOutlined />}
                        onClick={() => navigate('/')}
                        style={{
                            color: '#1890ff',
                            marginTop: '8px',
                            fontSize: '14px'
                        }}
                    >
                        {collapsed ? '' : 'Quay lại trang chủ'}
                    </Button>
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={getSelectedKeys()}
                    defaultOpenKeys={getOpenKeys()}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        border: 'none',
                        background: '#fff',
                    }}
                />
            </Sider>

            <Layout>
                <Content style={{
                    margin: '16px',
                    padding: '24px',
                    background: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    minHeight: 'calc(100vh - 32px)',
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
