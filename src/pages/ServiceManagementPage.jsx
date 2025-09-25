import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Table,
    Button,
    Input,
    Space,
    Typography,
    Tag,
    Switch,
    Popconfirm,
    message,
    Card,
    Row,
    Col,
    Spin,
    Image
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    SearchOutlined,
    ShopOutlined,
    SettingOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import { providerService } from '../services/providerService';
import ServiceModal from '../components/ServiceModal';
import ProviderModal from '../components/ProviderModal';
import { getImageUrl } from '../utils/imageUtils';

const { Title, Text } = Typography;
const { Search } = Input;

const ServiceManagementPage = () => {
    const { providerId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState([]);
    const [provider, setProvider] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchText, setSearchText] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [providerModalVisible, setProviderModalVisible] = useState(false);

    useEffect(() => {
        if (providerId) {
            fetchProviderInfo();
            fetchServices();
        }
    }, [providerId, pagination.current, pagination.pageSize]);

    const fetchProviderInfo = async () => {
        try {
            const response = await providerService.getProviderById(providerId);
            if (response.success) {
                setProvider(response.data);
            }
        } catch (error) {

        }
    };

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await providerService.getProviderServicesPaginated(
                providerId,
                pagination.current - 1,
                pagination.pageSize
            );
            if (response.success) {
                setServices(response.data.content || []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.totalElements || 0
                }));
            } else {
                message.error(response.message || 'Không thể tải danh sách dịch vụ');
            }
        } catch (error) {

            message.error('Không thể tải danh sách dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);


    };

    const handleToggleStatus = async (serviceId, currentStatus) => {
        try {
            let response;
            if (currentStatus) {
                response = await providerService.deactivateService(providerId, serviceId);
            } else {
                response = await providerService.activateService(providerId, serviceId);
            }

            if (response.success) {
                message.success(response.message || 'Cập nhật trạng thái thành công');
                fetchServices();
            } else {
                message.error(response.message || 'Cập nhật trạng thái thất bại');
            }
        } catch (error) {

            message.error('Cập nhật trạng thái thất bại');
        }
    };

    const handleDelete = async (serviceId) => {
        try {
            const response = await providerService.deleteService(providerId, serviceId);
            if (response.success) {
                message.success('Xóa dịch vụ thành công');
                fetchServices();
            } else {
                message.error(response.message || 'Xóa dịch vụ thất bại');
            }
        } catch (error) {

            message.error('Xóa dịch vụ thất bại');
        }
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

    const filteredServices = services.filter(service =>
        service.serviceName.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Ảnh',
            dataIndex: 'imageUrl',
            key: 'imageUrl',
            width: 80,
            render: (imageUrl) => (
                imageUrl ? (
                    <Image
                        width={50}
                        height={50}
                        src={getImageUrl(imageUrl)}
                        style={{ borderRadius: '6px', objectFit: 'cover' }}
                        placeholder={
                            <div style={{
                                width: 50,
                                height: 50,
                                background: '#f5f5f5',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ShopOutlined style={{ color: '#ccc' }} />
                            </div>
                        }
                    />
                ) : (
                    <div style={{
                        width: 50,
                        height: 50,
                        background: '#f5f5f5',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <ShopOutlined style={{ color: '#ccc' }} />
                    </div>
                )
            )
        },
        {
            title: 'Tên Dịch vụ',
            dataIndex: 'serviceName',
            key: 'serviceName',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>{formatPrice(price)}</Text>
        },
        {
            title: 'Thời lượng',
            dataIndex: 'durationMinutes',
            key: 'durationMinutes',
            render: (duration) => <Text>{formatDuration(duration)}</Text>
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive, record) => (
                <Switch
                    checked={isActive}
                    onChange={() => handleToggleStatus(record.id, isActive)}
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Tạm dừng"
                />
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingService(record);
                            setModalVisible(true);
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa dịch vụ này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    if (loading && !provider) {
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

            <div style={{ marginBottom: '24px' }}>
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/service-management')}
                    style={{ marginBottom: '16px' }}
                >
                    Quay lại chọn nhà cung cấp
                </Button>

                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    {provider?.logoUrl ? (
                        <img
                            src={getImageUrl(provider.logoUrl)}
                            alt={provider.businessName}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                marginRight: '12px'
                            }}
                        />
                    ) : (
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px'
                        }}>
                            <ShopOutlined style={{ fontSize: '18px', color: '#fff' }} />
                        </div>
                    )}
                    <Title level={2} style={{ margin: 0, color: '#1e3a8a' }}>
                        Quản lý Dịch vụ cho "{provider?.businessName || 'Loading...'}"
                    </Title>
                </div>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                    Quản lý tất cả dịch vụ của nhà cung cấp này
                </Text>
            </div>


            <Card style={{ marginBottom: '24px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Search
                            placeholder="Tìm kiếm theo tên dịch vụ"
                            allowClear
                            style={{ width: 300 }}
                            onSearch={handleSearch}
                            prefix={<SearchOutlined />}
                        />
                    </Col>
                    <Col>
                        <Space>
                            <Button
                                icon={<CalendarOutlined />}
                                size="large"
                                onClick={() => {
                                    navigate(`/schedule-management/${providerId}`);
                                }}
                            >
                                Quản lý Lịch làm việc
                            </Button>
                            <Button
                                icon={<SettingOutlined />}
                                size="large"
                                onClick={() => {
                                    setProviderModalVisible(true);
                                }}
                            >
                                Quản lý Provider
                            </Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                onClick={() => {
                                    setEditingService(null);
                                    setModalVisible(true);
                                }}
                            >
                                + Thêm Dịch vụ mới
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>


            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredServices}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} dịch vụ`,
                        onChange: (page, pageSize) => {
                            setPagination(prev => ({
                                ...prev,
                                current: page,
                                pageSize: pageSize
                            }));
                        }
                    }}
                />
            </Card>


            <ServiceModal
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingService(null);
                }}
                onSuccess={() => {
                    fetchServices();
                    setModalVisible(false);
                    setEditingService(null);
                }}
                providerId={providerId}
                editingService={editingService}
            />


            <ProviderModal
                visible={providerModalVisible}
                onCancel={() => {
                    setProviderModalVisible(false);
                }}
                onSuccess={() => {
                    fetchProviderInfo();
                    fetchServices();
                    setProviderModalVisible(false);
                }}
                providerId={providerId}
                provider={provider}
            />
        </div>
    );
};

export default ServiceManagementPage;
