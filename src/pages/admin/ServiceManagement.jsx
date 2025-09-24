import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Typography,
    Tag,
    Space,
    message,
    Card,
    Row,
    Col,
    Image,
    Input,
    Divider
} from 'antd';
import {
    EyeOutlined,
    SearchOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import { getImageUrl } from '../../utils/imageUtils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;

const ServiceManagement = () => {
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchServices();
    }, [pagination.current, pagination.pageSize]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await adminService.getServicesPaginated(
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

    const handleViewDetail = async (serviceId) => {
        try {
            const response = await adminService.getServiceById(serviceId);
            if (response.success) {
                setSelectedService(response.data);
                setDetailModalVisible(true);
            } else {
                message.error(response.message || 'Không thể tải thông tin chi tiết');
            }
        } catch (error) {

            message.error('Không thể tải thông tin chi tiết');
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);

    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'ACTIVE':
                return {
                    color: 'success',
                    icon: <CheckCircleOutlined />,
                    text: 'Hoạt động'
                };
            case 'INACTIVE':
                return {
                    color: 'error',
                    icon: <CloseCircleOutlined />,
                    text: 'Không hoạt động'
                };
            case 'PENDING':
                return {
                    color: 'processing',
                    icon: <ClockCircleOutlined />,
                    text: 'Chờ duyệt'
                };
            default:
                return {
                    color: 'default',
                    icon: null,
                    text: status
                };
        }
    };

    const filteredServices = services.filter(service =>
        service.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        service.categoryName?.toLowerCase().includes(searchText.toLowerCase())
    );

    const columns = [
        {
            title: 'Tên dịch vụ',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Danh mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
            render: (text) => text || '-'
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'providerName',
            key: 'providerName',
            render: (text) => text || '-'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = getStatusConfig(status);
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {config.text}
                    </Tag>
                );
            }
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (price) => price ? `${price.toLocaleString()} VNĐ` : '-'
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record.id)}
                    >
                        Xem chi tiết
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                    Tất cả Dịch vụ
                </Title>
                <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                    Xem và quản lý tất cả dịch vụ trong hệ thống
                </p>
            </div>

            <Card>
                <div style={{ marginBottom: '16px' }}>
                    <Search
                        placeholder="Tìm kiếm theo tên, mô tả hoặc danh mục..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        onSearch={handleSearch}
                        style={{ maxWidth: 400 }}
                    />
                </div>

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


            <Modal
                title="Chi tiết Dịch vụ"
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedService(null);
                }}
                footer={null}
                width={800}
                centered
            >
                {selectedService ? (
                    <div>

                        <div style={{ marginBottom: '24px' }}>
                            <Title level={3} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                                {selectedService.name}
                            </Title>
                            <Space>
                                <Tag
                                    color={getStatusConfig(selectedService.status).color}
                                    icon={getStatusConfig(selectedService.status).icon}
                                    style={{ fontSize: '14px', padding: '6px 12px' }}
                                >
                                    {getStatusConfig(selectedService.status).text}
                                </Tag>
                                {selectedService.categoryName && (
                                    <Tag color="blue">{selectedService.categoryName}</Tag>
                                )}
                            </Space>
                        </div>


                        <div style={{ marginBottom: '24px' }}>
                            <Title level={4} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                                Thông tin cơ bản
                            </Title>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>Nhà cung cấp</Text>
                                        <br />
                                        <Text strong>{selectedService.providerName || '-'}</Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>Giá</Text>
                                        <br />
                                        <Text strong>
                                            {selectedService.price
                                                ? `${selectedService.price.toLocaleString()} VNĐ`
                                                : '-'
                                            }
                                        </Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>Ngày tạo</Text>
                                        <br />
                                        <Text strong>
                                            {dayjs(selectedService.createdAt).format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>Cập nhật lần cuối</Text>
                                        <br />
                                        <Text strong>
                                            {dayjs(selectedService.updatedAt).format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                    </div>
                                </Col>
                            </Row>
                        </div>


                        {selectedService.description && (
                            <div style={{ marginBottom: '24px' }}>
                                <Title level={4} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                                    Mô tả
                                </Title>
                                <Text>{selectedService.description}</Text>
                            </div>
                        )}


                        {selectedService.imageUrl && (
                            <div style={{ marginBottom: '24px' }}>
                                <Title level={4} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                                    Hình ảnh
                                </Title>
                                <div style={{ textAlign: 'center' }}>
                                    <Image
                                        src={getImageUrl(selectedService.imageUrl)}
                                        alt="Hình ảnh dịch vụ"
                                        style={{
                                            maxWidth: '400px',
                                            maxHeight: '300px',
                                            borderRadius: '8px'
                                        }}
                                        preview={{
                                            mask: 'Xem ảnh'
                                        }}
                                    />
                                </div>
                            </div>
                        )}


                        <div style={{ marginBottom: '24px' }}>
                            <Title level={4} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                                Thông tin bổ sung
                            </Title>
                            <Row gutter={[16, 16]}>
                                {selectedService.duration && (
                                    <Col span={12}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Thời gian</Text>
                                            <br />
                                            <Text>{selectedService.duration} phút</Text>
                                        </div>
                                    </Col>
                                )}
                                {selectedService.location && (
                                    <Col span={12}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Địa điểm</Text>
                                            <br />
                                            <Text>{selectedService.location}</Text>
                                        </div>
                                    </Col>
                                )}
                                {selectedService.notes && (
                                    <Col span={24}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Ghi chú</Text>
                                            <br />
                                            <Text>{selectedService.notes}</Text>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </div>


                        <Divider />
                        <div style={{ textAlign: 'right' }}>
                            <Button onClick={() => setDetailModalVisible(false)}>
                                Đóng
                            </Button>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};

export default ServiceManagement;
