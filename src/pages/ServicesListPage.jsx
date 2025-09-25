import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Card,
    Typography,
    Row,
    Col,
    Button,
    Spin,
    message,
    Space,
    Pagination,
    Image
} from 'antd';
import {
    SearchOutlined,
    ArrowLeftOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { providerService } from '../services/providerService';
import { categoryService } from '../services/categoryService';
import { getImageUrl } from '../utils/imageUtils';

const { Title, Text, Paragraph } = Typography;

const ServicesListPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0
    });

    const categoryId = searchParams.get('category');
    const searchTerm = searchParams.get('search');

    useEffect(() => {
        fetchCategories();
        fetchServices();
    }, [categoryId, searchTerm, pagination.current, pagination.pageSize]);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getCategories();
            if (response.success) {
                setCategories(response.data || []);


                if (categoryId) {
                    const category = response.data?.find(cat => cat.id === categoryId);
                    setCurrentCategory(category);
                }
            }
        } catch (error) {

        }
    };

    const fetchServices = async () => {
        setLoading(true);
        try {
            let response;

            if (searchTerm) {

                response = await providerService.searchServices(
                    searchTerm,
                    pagination.current - 1,
                    pagination.pageSize,
                    'createdAt',
                    'desc'
                );
            } else if (categoryId) {

                response = await providerService.getServicesByCategory(
                    categoryId,
                    pagination.current - 1,
                    pagination.pageSize,
                    'createdAt',
                    'desc'
                );
            } else {

                response = await providerService.getPublicServices(
                    pagination.current - 1,
                    pagination.pageSize,
                    'createdAt',
                    'desc'
                );
            }

            if (response.success) {
                setServices(response.data.content || []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.totalElements || 0
                }));
            } else {
                message.error('Không thể tải danh sách dịch vụ');
            }
        } catch (error) {

            message.error('Không thể tải danh sách dịch vụ');
        } finally {
            setLoading(false);
        }
    };


    const handlePageChange = (page, pageSize) => {
        setPagination(prev => ({
            ...prev,
            current: page,
            pageSize: pageSize
        }));
    };

    const handleServiceClick = (serviceId) => {
        navigate(`/services/${serviceId}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDuration = (minutes) => {
        if (minutes < 60) {
            return `${minutes} phút`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            if (remainingMinutes === 0) {
                return `${hours} giờ`;
            } else {
                return `${hours} giờ ${remainingMinutes} phút`;
            }
        }
    };

    const getPageTitle = () => {
        if (searchTerm) {
            return `Kết quả tìm kiếm: "${searchTerm}"`;
        }
        if (currentCategory) {
            return `Dịch vụ trong danh mục: ${currentCategory.name}`;
        }
        return 'Tất cả Dịch vụ';
    };

    const renderServiceCard = (service) => (
        <Col xs={24} sm={12} md={8} lg={6} xl={4} key={service.id}>
            <Card
                hoverable
                onClick={() => handleServiceClick(service.id)}
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    height: '100%'
                }}
                bodyStyle={{ padding: '16px' }}
                cover={
                    service.imageUrl ? (
                        <Image
                            src={getImageUrl(service.imageUrl)}
                            alt={service.serviceName}
                            style={{ height: '200px', objectFit: 'cover' }}
                            preview={false}
                        />
                    ) : (
                        <div style={{
                            height: '200px',
                            backgroundColor: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#999',
                            fontSize: '48px'
                        }}>
                            📷
                        </div>
                    )
                }
            >
                <div>
                    <Title level={4} style={{
                        marginBottom: '8px',
                        color: '#1e3a8a',
                        fontSize: '16px',
                        lineHeight: '1.4'
                    }} ellipsis={{ rows: 2 }}>
                        {service.serviceName}
                    </Title>

                    {service.providerBusinessName && (
                        <div style={{ marginBottom: '8px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {service.providerBusinessName}
                            </Text>
                        </div>
                    )}

                    <div style={{ marginBottom: '12px' }}>
                        <Space>
                            <ClockCircleOutlined style={{ color: '#666' }} />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {formatDuration(service.durationMinutes)}
                            </Text>
                        </Space>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <Text strong style={{ color: '#1890ff', fontSize: '18px' }}>
                            {formatPrice(service.price)}
                        </Text>
                    </div>

                    {service.description && (
                        <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{
                                fontSize: '12px',
                                color: '#666',
                                marginBottom: '12px'
                            }}
                        >
                            {service.description}
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
                            Xem chi tiết →
                        </Text>
                    </div>
                </div>
            </Card>
        </Col>
    );

    if (loading && services.length === 0) {
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
                    {getPageTitle()}
                </Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                    {searchTerm
                        ? `Tìm thấy ${pagination.total} kết quả cho "${searchTerm}"`
                        : currentCategory
                            ? `Khám phá các dịch vụ trong danh mục ${currentCategory.name}`
                            : 'Khám phá tất cả các dịch vụ có sẵn'
                    }
                </Text>
            </div>


            <div>
                {services.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '40px' }}>
                        <SearchOutlined style={{ fontSize: '64px', color: '#ccc', marginBottom: '16px' }} />
                        <Title level={4} type="secondary">Không tìm thấy dịch vụ nào</Title>
                        <Paragraph type="secondary">
                            {searchTerm
                                ? `Không tìm thấy dịch vụ nào cho "${searchTerm}"`
                                : currentCategory
                                    ? `Không có dịch vụ nào trong danh mục ${currentCategory.name}`
                                    : 'Hiện tại không có dịch vụ nào có sẵn'
                            }
                        </Paragraph>
                    </Card>
                ) : (
                    <>
                        <Row gutter={[16, 16]}>
                            {services.map(renderServiceCard)}
                        </Row>


                        <div style={{
                            textAlign: 'center',
                            marginTop: '32px',
                            marginBottom: '20px'
                        }}>
                            <Pagination
                                current={pagination.current}
                                pageSize={pagination.pageSize}
                                total={pagination.total}
                                onChange={handlePageChange}
                                showSizeChanger
                                showQuickJumper
                                showTotal={(total, range) =>
                                    `${range[0]}-${range[1]} của ${total} dịch vụ`
                                }
                                pageSizeOptions={['12', '24', '48']}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ServicesListPage;
