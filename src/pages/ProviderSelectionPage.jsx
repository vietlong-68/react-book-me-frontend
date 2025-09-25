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
        <div style={{ padding: '20px' }}>

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
                <Row gutter={[24, 24]}>
                    {providers.map((provider) => {
                        const statusConfig = getStatusConfig(provider.status, provider.isVerified);

                        return (
                            <Col xs={24} sm={12} lg={8} xl={6} key={provider.id}>
                                <Card
                                    hoverable
                                    onClick={() => handleProviderSelect(provider.id)}
                                    style={{
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        height: '100%'
                                    }}
                                    bodyStyle={{ padding: '20px' }}
                                >

                                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                        {provider.logoUrl ? (
                                            <img
                                                src={getImageUrl(provider.logoUrl)}
                                                alt={provider.businessName}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    borderRadius: '50%',
                                                    objectFit: 'cover',
                                                    border: '2px solid #f0f0f0'
                                                }}
                                            />
                                        ) : (
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '50%',
                                                background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto'
                                            }}>
                                                <ShopOutlined style={{ fontSize: '24px', color: '#fff' }} />
                                            </div>
                                        )}
                                    </div>


                                    <Title level={4} style={{
                                        textAlign: 'center',
                                        marginBottom: '12px',
                                        color: '#1e3a8a'
                                    }}>
                                        {provider.businessName}
                                    </Title>


                                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                        <Tag
                                            color={statusConfig.color}
                                            icon={statusConfig.icon}
                                            style={{ fontSize: '12px' }}
                                        >
                                            {statusConfig.text}
                                        </Tag>
                                    </div>


                                    <div style={{ marginBottom: '16px' }}>
                                        {provider.address && (
                                            <div style={{ marginBottom: '8px' }}>
                                                <EnvironmentOutlined style={{ marginRight: '8px', color: '#666' }} />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {provider.address}
                                                </Text>
                                            </div>
                                        )}

                                        {provider.phoneNumber && (
                                            <div style={{ marginBottom: '8px' }}>
                                                <PhoneOutlined style={{ marginRight: '8px', color: '#666' }} />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {provider.phoneNumber}
                                                </Text>
                                            </div>
                                        )}

                                        {provider.websiteUrl && (
                                            <div>
                                                <GlobalOutlined style={{ marginRight: '8px', color: '#666' }} />
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    {provider.websiteUrl}
                                                </Text>
                                            </div>
                                        )}
                                    </div>


                                    {provider.bio && (
                                        <Paragraph
                                            ellipsis={{ rows: 2 }}
                                            style={{
                                                fontSize: '12px',
                                                color: '#666',
                                                marginBottom: '16px'
                                            }}
                                        >
                                            {provider.bio}
                                        </Paragraph>
                                    )}


                                    <div style={{
                                        textAlign: 'center',
                                        padding: '8px',
                                        background: '#f8f9fa',
                                        borderRadius: '6px',
                                        border: '1px dashed #d9d9d9'
                                    }}>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Nhấp để quản lý dịch vụ
                                        </Text>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            )}
        </div>
    );
};

export default ProviderSelectionPage;
