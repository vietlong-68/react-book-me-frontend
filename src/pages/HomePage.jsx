import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Image
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    ShopOutlined,
    EyeOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { userService } from '../services/userService';
import { appointmentService } from '../services/appointmentService';
import { categoryService } from '../services/categoryService';
import { providerService } from '../services/providerService';
import { getImageUrl } from '../utils/imageUtils';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

const HomePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [featuredServices, setFeaturedServices] = useState([]);

    useEffect(() => {
        fetchHomeData();
    }, []);

    const fetchHomeData = async () => {
        setLoading(true);
        try {

            const userResponse = await userService.getProfile();
            if (userResponse.success) {
                setUser(userResponse.data);
            }



            const scheduledResponse = await appointmentService.getAppointmentsByStatus('SCHEDULED', 0, 3);
            const confirmedResponse = await appointmentService.getAppointmentsByStatus('CONFIRMED', 0, 3);

            let allUpcomingAppointments = [];
            if (scheduledResponse.success) {
                allUpcomingAppointments = [...allUpcomingAppointments, ...(scheduledResponse.data || [])];
            }
            if (confirmedResponse.success) {
                allUpcomingAppointments = [...allUpcomingAppointments, ...(confirmedResponse.data || [])];
            }


            allUpcomingAppointments.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
            setUpcomingAppointments(allUpcomingAppointments.slice(0, 3));


            const categoriesResponse = await categoryService.getCategories();
            if (categoriesResponse.success) {
                setCategories(categoriesResponse.data || []);
            }


            const servicesResponse = await providerService.getPublicServices(0, 6);
            if (servicesResponse.success) {
                setFeaturedServices(servicesResponse.data.content || []);
            }

        } catch (error) {

            message.error('Không thể tải dữ liệu trang chủ');
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        return dayjs(dateTimeString).format('HH:mm DD/MM/YYYY');
    };

    const renderUpcomingAppointments = () => {
        if (upcomingAppointments.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    <CalendarOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <div>Bạn chưa có lịch hẹn nào</div>
                </div>
            );
        }

        return (
            <div>
                {upcomingAppointments.map((appointment, index) => (
                    <Card
                        key={appointment.id || index}
                        size="small"
                        style={{
                            marginBottom: '12px',
                            border: '1px solid #f0f0f0',
                            borderRadius: '8px'
                        }}
                    >
                        <Row align="middle" justify="space-between">
                            <Col flex="auto">
                                <div style={{ marginBottom: '4px' }}>
                                    <Text strong style={{ fontSize: '16px' }}>
                                        {appointment.serviceName || 'Dịch vụ'}
                                    </Text>
                                </div>
                                <div style={{ marginBottom: '4px' }}>
                                    <ShopOutlined style={{ marginRight: '4px', color: '#666' }} />
                                    <Text type="secondary">
                                        {appointment.providerName || 'Nhà cung cấp'}
                                    </Text>
                                </div>
                                <div>
                                    <ClockCircleOutlined style={{ marginRight: '4px', color: '#666' }} />
                                    <Text type="secondary">
                                        {formatDateTime(appointment.startTime)}
                                    </Text>
                                </div>
                            </Col>
                            <Col>
                                <Tag color="blue">Sắp tới</Tag>
                            </Col>
                        </Row>
                    </Card>
                ))}
            </div>
        );
    };

    const renderCategories = () => {
        return (
            <Row gutter={[16, 16]}>
                {categories.map((category) => (
                    <Col xs={12} sm={8} md={6} key={category.id}>
                        <Card
                            hoverable
                            style={{
                                textAlign: 'center',
                                borderRadius: '8px',
                                border: '1px solid #f0f0f0'
                            }}
                            onClick={() => navigate(`/services?category=${category.id}`)}
                        >
                            <div style={{ padding: '20px' }}>
                                <Text strong style={{ fontSize: '14px' }}>
                                    {category.name}
                                </Text>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    const renderFeaturedServices = () => {
        return (
            <Row gutter={[16, 16]}>
                {featuredServices.map((service) => (
                    <Col xs={12} sm={8} md={6} key={service.id}>
                        <Card
                            hoverable
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #f0f0f0'
                            }}
                            cover={
                                service.imageUrl ? (
                                    <Image
                                        src={getImageUrl(service.imageUrl)}
                                        alt={service.serviceName}
                                        style={{ height: '120px', objectFit: 'cover' }}
                                        preview={false}
                                    />
                                ) : (
                                    <div style={{
                                        height: '120px',
                                        backgroundColor: '#f5f5f5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#999'
                                    }}>
                                    </div>
                                )
                            }
                            onClick={() => navigate(`/services/${service.id}`)}
                        >
                            <div>
                                <Text strong style={{ fontSize: '14px' }}>
                                    {service.serviceName}
                                </Text>
                                <div style={{ marginTop: '4px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        {service.providerName || 'Nhà cung cấp'}
                                    </Text>
                                </div>
                                <div style={{ marginTop: '8px' }}>
                                    <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(service.price)}
                                    </Text>
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
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
                <Title level={2} style={{ marginBottom: '8px' }}>
                    Chào mừng trở lại, {user?.displayName || 'Bạn'}! 👋
                </Title>
                <Paragraph type="secondary" style={{ fontSize: '16px' }}>
                    Khám phá các dịch vụ tuyệt vời và quản lý lịch hẹn của bạn
                </Paragraph>
            </div>


            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Space>
                            <CalendarOutlined />
                            <span>Lịch hẹn sắp tới</span>
                        </Space>
                        <Button
                            type="link"
                            onClick={() => navigate('/appointments')}
                            style={{ padding: 0 }}
                        >
                            Xem tất cả lịch hẹn →
                        </Button>
                    </div>
                }
                style={{ marginBottom: '32px' }}
            >
                {renderUpcomingAppointments()}
            </Card>


            <Card
                title={
                    <Space>
                        <SearchOutlined />
                        <span>Khám phá theo Danh mục</span>
                    </Space>
                }
                style={{ marginBottom: '32px' }}
            >
                {renderCategories()}
            </Card>


            <Card
                title={
                    <Space>
                        <ShopOutlined />
                        <span>Gợi ý Dịch vụ cho bạn</span>
                    </Space>
                }
                style={{ marginBottom: '32px' }}
            >
                {renderFeaturedServices()}
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<SearchOutlined />}
                        onClick={() => navigate('/services')}
                    >
                        Xem thêm dịch vụ
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default HomePage;
