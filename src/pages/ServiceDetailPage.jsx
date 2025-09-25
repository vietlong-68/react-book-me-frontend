import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Typography,
    Row,
    Col,
    Button,
    Spin,
    message,
    Space,
    Tag,
    Image,
    Divider
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    ShopOutlined,
    DollarOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import { providerService } from '../services/providerService';
import { getImageUrl } from '../utils/imageUtils';
import BookingModal from '../components/BookingModal';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const ServiceDetailPage = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [service, setService] = useState(null);
    const [bookingModalVisible, setBookingModalVisible] = useState(false);

    useEffect(() => {
        fetchServiceDetail();
    }, [serviceId]);

    const fetchServiceDetail = async () => {
        setLoading(true);
        try {
            const response = await providerService.getPublicServiceById(serviceId);
            if (response.success) {
                setService(response.data);
            } else {
                message.error('Không thể tải thông tin dịch vụ');
                navigate('/');
            }
        } catch (error) {

            message.error('Không thể tải thông tin dịch vụ');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleBookingClick = () => {
        setBookingModalVisible(true);
    };

    const handleBookingSuccess = () => {
        setBookingModalVisible(false);
        message.success('Đặt lịch thành công!');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours} giờ ${mins > 0 ? mins + ' phút' : ''}`;
        }
        return `${mins} phút`;
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

    if (!service) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <Text type="secondary">Không tìm thấy dịch vụ</Text>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                style={{ marginBottom: '24px' }}
            >
                Quay lại
            </Button>

            <Row gutter={[32, 32]}>

                <Col xs={24} lg={12}>
                    <Card style={{ borderRadius: '12px', overflow: 'hidden' }}>
                        {service.imageUrl ? (
                            <Image
                                src={getImageUrl(service.imageUrl)}
                                alt={service.serviceName}
                                style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                                preview={{
                                    mask: 'Xem ảnh'
                                }}
                            />
                        ) : (
                            <div style={{
                                height: '400px',
                                backgroundColor: '#f5f5f5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#999',
                                fontSize: '48px'
                            }}>
                                📷
                            </div>
                        )}
                    </Card>
                </Col>


                <Col xs={24} lg={12}>
                    <div>

                        <Title level={1} style={{ marginBottom: '16px' }}>
                            {service.serviceName}
                        </Title>


                        <div style={{ marginBottom: '16px' }}>
                            <Space>
                                {service.providerLogoUrl ? (
                                    <Image
                                        src={getImageUrl(service.providerLogoUrl)}
                                        alt={service.providerBusinessName || 'Provider Logo'}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '4px',
                                            objectFit: 'cover'
                                        }}
                                        preview={true}
                                    />
                                ) : (
                                    <ShopOutlined style={{ color: '#666' }} />
                                )}
                                <Text strong style={{ fontSize: '16px' }}>
                                    {service.providerBusinessName || 'Nhà cung cấp'}
                                </Text>
                            </Space>
                        </div>

                        {service.categoryName && (
                            <div style={{ marginBottom: '16px' }}>
                                <Space>
                                    <Tag color="blue" style={{ fontSize: '14px', padding: '4px 12px' }}>
                                        {service.categoryName}
                                    </Tag>
                                </Space>
                            </div>
                        )}


                        <div style={{ marginBottom: '16px' }}>
                            <Space>
                                <Text strong style={{ fontSize: '24px', color: '#52c41a' }}>
                                    {formatPrice(service.price)}
                                </Text>
                            </Space>
                        </div>


                        <div style={{ marginBottom: '16px' }}>
                            <Space>
                                <ClockCircleOutlined style={{ color: '#666' }} />
                                <Text style={{ fontSize: '16px' }}>
                                    Thời lượng: {formatDuration(service.durationMinutes)}
                                </Text>
                            </Space>
                        </div>


                        <div style={{ marginBottom: '24px' }}>
                            <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                                Có sẵn
                            </Tag>
                        </div>


                        {service.description && (
                            <div style={{ marginBottom: '32px' }}>
                                <Title level={4}>Mô tả dịch vụ</Title>
                                <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
                                    {service.description}
                                </Paragraph>
                            </div>
                        )}

                        <Divider />


                        <div style={{ textAlign: 'center' }}>
                            <Button
                                type="primary"
                                size="large"
                                icon={<CalendarOutlined />}
                                onClick={handleBookingClick}
                                style={{
                                    height: '60px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    padding: '0 40px',
                                    borderRadius: '8px'
                                }}
                            >
                                Chọn lịch hẹn
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>


            <BookingModal
                visible={bookingModalVisible}
                service={service}
                onCancel={() => setBookingModalVisible(false)}
                onSuccess={handleBookingSuccess}
            />
        </div>
    );
};

export default ServiceDetailPage;
