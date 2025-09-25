import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Row, Col, Typography, Spin, message, Tag, Button } from 'antd';
import {
    ShopOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    GlobalOutlined,
    ArrowLeftOutlined,
    CheckCircleOutlined,
    PauseCircleOutlined
} from '@ant-design/icons';
import { providerService } from '../services/providerService';
import { getImageUrl } from '../utils/imageUtils';

const { Title, Text, Paragraph } = Typography;

const ProviderSelectionPage = () => {
    const [loading, setLoading] = useState(true);
    const [providers, setProviders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const response = await providerService.getMyProviders();
            if (response.success) {
                setProviders(response.data || []);
            } else {
                message.error(response.message || 'Không thể tải danh sách nhà cung cấp');
            }
        } catch (error) {

            message.error('Không thể tải danh sách nhà cung cấp');
        } finally {
            setLoading(false);
        }
    };

    const handleProviderSelect = (providerId) => {
        navigate(`/service-management/${providerId}`);
    };

    const getStatusConfig = (status, isVerified) => {
        if (status === 'ACTIVE') {
            return {
                color: 'success',
                icon: <CheckCircleOutlined />,
                text: isVerified ? 'Hoạt động - Đã xác thực' : 'Hoạt động - Chưa xác thực'
            };
        } else {
            return {
                color: 'warning',
                icon: <PauseCircleOutlined />,
                text: 'Bị tạm ngưng'
            };
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

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

            <div style={{ marginBottom: '32px' }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/')}
                    style={{ marginBottom: '16px' }}
                >
                    Quay lại trang chủ
                </Button>
                <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                    Chọn một nhà cung cấp để quản lý
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                    Chọn nhà cung cấp mà bạn muốn quản lý dịch vụ
                </Text>
            </div>


            {providers.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '40px' }}>
                    <ShopOutlined style={{ fontSize: '64px', color: '#ccc', marginBottom: '16px' }} />
                    <Title level={4} type="secondary">Chưa có nhà cung cấp nào</Title>
                    <Paragraph type="secondary">
                        Bạn chưa có nhà cung cấp nào. Hãy đăng ký làm nhà cung cấp trước.
                    </Paragraph>
                    <Button type="primary" onClick={() => navigate('/apply-provider')}>
                        Đăng ký làm nhà cung cấp
                    </Button>
                </Card>
            ) : (
                <div>
                    {providers.map((provider) => {
                        const statusConfig = getStatusConfig(provider.status, provider.isVerified);

                        return (
                            <Card
                                key={provider.id}
                                hoverable
                                onClick={() => handleProviderSelect(provider.id)}
                                style={{
                                    marginBottom: '16px',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                bodyStyle={{ padding: '20px' }}
                            >
                                <Row align="top" gutter={24}>
                                    { }
                                    <Col flex="0 0 100px">
                                        <div style={{ textAlign: 'center' }}>
                                            {provider.logoUrl ? (
                                                <img
                                                    src={getImageUrl(provider.logoUrl)}
                                                    alt={provider.businessName}
                                                    style={{
                                                        width: '100px',
                                                        height: '100px',
                                                        borderRadius: '50%',
                                                        objectFit: 'cover',
                                                        border: '3px solid #f0f0f0',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '100px',
                                                    height: '100px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                }}>
                                                    <ShopOutlined style={{ fontSize: '40px', color: '#fff' }} />
                                                </div>
                                            )}
                                        </div>
                                    </Col>

                                    <Col flex="auto">
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            { }
                                            <div style={{ marginBottom: '16px' }}>
                                                <Title level={2} style={{
                                                    marginBottom: '8px',
                                                    color: '#1e3a8a',
                                                    fontSize: '24px'
                                                }}>
                                                    {provider.businessName}
                                                </Title>
                                                <Tag
                                                    color={statusConfig.color}
                                                    icon={statusConfig.icon}
                                                    style={{
                                                        fontSize: '14px',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px'
                                                    }}
                                                >
                                                    {statusConfig.text}
                                                </Tag>
                                            </div>

                                            { }
                                            <div style={{
                                                marginBottom: '16px',
                                                padding: '16px',
                                                backgroundColor: '#f8f9fa',
                                                borderRadius: '8px',
                                                border: '1px solid #e9ecef'
                                            }}>
                                                <Row gutter={[16, 8]}>
                                                    {provider.address && (
                                                        <Col span={24}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <EnvironmentOutlined style={{
                                                                    marginRight: '8px',
                                                                    color: '#1890ff',
                                                                    fontSize: '16px'
                                                                }} />
                                                                <Text style={{ fontSize: '14px', color: '#333' }}>
                                                                    {provider.address}
                                                                </Text>
                                                            </div>
                                                        </Col>
                                                    )}
                                                    {provider.phoneNumber && (
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <PhoneOutlined style={{
                                                                    marginRight: '8px',
                                                                    color: '#52c41a',
                                                                    fontSize: '16px'
                                                                }} />
                                                                <Text style={{ fontSize: '14px', color: '#333' }}>
                                                                    {provider.phoneNumber}
                                                                </Text>
                                                            </div>
                                                        </Col>
                                                    )}
                                                    {provider.websiteUrl && (
                                                        <Col span={12}>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                <GlobalOutlined style={{
                                                                    marginRight: '8px',
                                                                    color: '#722ed1',
                                                                    fontSize: '16px'
                                                                }} />
                                                                <Text
                                                                    style={{
                                                                        fontSize: '14px',
                                                                        color: '#1890ff',
                                                                        textDecoration: 'underline'
                                                                    }}
                                                                    ellipsis={{ tooltip: provider.websiteUrl }}
                                                                >
                                                                    {provider.websiteUrl}
                                                                </Text>
                                                            </div>
                                                        </Col>
                                                    )}
                                                </Row>
                                            </div>

                                            { }
                                            {provider.bio && (
                                                <div style={{
                                                    marginBottom: '16px',
                                                    padding: '12px',
                                                    backgroundColor: '#fff',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e9ecef'
                                                }}>
                                                    <Text style={{
                                                        fontSize: '14px',
                                                        color: '#666',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        "{provider.bio}"
                                                    </Text>
                                                </div>
                                            )}

                                            { }
                                            <div style={{
                                                marginTop: 'auto',
                                                textAlign: 'right'
                                            }}>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '12px 20px',
                                                    background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                                                    borderRadius: '25px',
                                                    border: 'none',
                                                    boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    <Text style={{
                                                        fontSize: '14px',
                                                        color: '#fff',
                                                        fontWeight: '500'
                                                    }}>
                                                        Quản lý dịch vụ →
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProviderSelectionPage;
