import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin, message } from 'antd';
import {
    FileTextOutlined,
    UserOutlined,
    TeamOutlined,
    SecurityScanOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';

const { Title } = Typography;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingApplications: 0,
        totalUsers: 0,
        activeProviders: 0,
        tokenStats: {}
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const data = await adminService.getDashboardStats();
            setStats(data);
        } catch (error) {


            setStats({
                pendingApplications: 5,
                totalUsers: 150,
                activeProviders: 25,
                tokenStats: {
                    totalActiveTokens: 120,
                    totalBlacklistedTokens: 10
                }
            });
            message.warning('Đang sử dụng dữ liệu mẫu. API có thể chưa sẵn sàng.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <Spin size="large" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Đơn chờ duyệt',
            value: stats.pendingApplications,
            icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
            color: '#faad14',
            onClick: () => navigate('/admin/applications'),
            description: 'Đơn đăng ký nhà cung cấp chờ duyệt'
        },
        {
            title: 'Tổng số người dùng',
            value: stats.totalUsers,
            icon: <UserOutlined style={{ color: '#1890ff' }} />,
            color: '#1890ff',
            onClick: () => navigate('/admin/users'),
            description: 'Tổng số tài khoản trong hệ thống'
        },
        {
            title: 'Nhà cung cấp hoạt động',
            value: stats.activeProviders,
            icon: <TeamOutlined style={{ color: '#52c41a' }} />,
            color: '#52c41a',
            onClick: () => navigate('/admin/providers'),
            description: 'Nhà cung cấp đang hoạt động'
        },
        {
            title: 'Token đang hoạt động',
            value: stats.tokenStats.totalActiveTokens || 0,
            icon: <SecurityScanOutlined style={{ color: '#722ed1' }} />,
            color: '#722ed1',
            onClick: () => navigate('/admin/system'),
            description: 'Số token đang hoạt động trong hệ thống'
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                    Tổng quan Hệ thống
                </Title>
                <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                    Cái nhìn tổng thể về hoạt động của hệ thống Book Me
                </p>
            </div>

            <Row gutter={[24, 24]}>
                {statCards.map((card, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card
                            hoverable
                            onClick={card.onClick}
                            style={{
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            bodyStyle={{ padding: '24px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                                <div style={{
                                    fontSize: '32px',
                                    marginRight: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '12px',
                                    background: `${card.color}15`
                                }}>
                                    {card.icon}
                                </div>
                                <div>
                                    <Title level={4} style={{ margin: 0, color: '#1e3a8a' }}>
                                        {card.title}
                                    </Title>
                                    <p style={{
                                        margin: 0,
                                        color: '#666',
                                        fontSize: '12px',
                                        lineHeight: '1.4'
                                    }}>
                                        {card.description}
                                    </p>
                                </div>
                            </div>

                            <Statistic
                                value={card.value}
                                valueStyle={{
                                    color: card.color,
                                    fontSize: '32px',
                                    fontWeight: 'bold'
                                }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>


            {stats.tokenStats && (
                <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
                    <Col xs={24} lg={12}>
                        <Card
                            title="Thống kê Token"
                            style={{ borderRadius: '12px' }}
                            headStyle={{
                                background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                                color: '#fff',
                                borderRadius: '12px 12px 0 0'
                            }}
                        >
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Statistic
                                        title="Token đang hoạt động"
                                        value={stats.tokenStats.totalActiveTokens || 0}
                                        valueStyle={{ color: '#52c41a' }}
                                        prefix={<CheckCircleOutlined />}
                                    />
                                </Col>
                                <Col span={12}>
                                    <Statistic
                                        title="Token bị chặn"
                                        value={stats.tokenStats.totalBlacklistedTokens || 0}
                                        valueStyle={{ color: '#ff4d4f' }}
                                        prefix={<CloseCircleOutlined />}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card
                            title="Hành động nhanh"
                            style={{ borderRadius: '12px' }}
                            headStyle={{
                                background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                                color: '#fff',
                                borderRadius: '12px 12px 0 0'
                            }}
                        >
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <p style={{ color: '#666', marginBottom: '16px' }}>
                                    Quản lý hệ thống và bảo mật
                                </p>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => navigate('/admin/applications')}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#faad14',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Xét duyệt đơn
                                    </button>
                                    <button
                                        onClick={() => navigate('/admin/system')}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#722ed1',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Quản lý hệ thống
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default Dashboard;
