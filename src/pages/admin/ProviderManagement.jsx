import React, { useState, useEffect } from 'react';
import {
    Table,
    Tabs,
    Button,
    Modal,
    Typography,
    Tag,
    Space,
    message,
    Popconfirm,
    Card,
    Row,
    Col,
    Image
} from 'antd';
import {
    EyeOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import { getImageUrl } from '../../utils/imageUtils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ProviderManagement = () => {
    const [loading, setLoading] = useState(false);
    const [providers, setProviders] = useState([]);
    const [activeTab, setActiveTab] = useState('ACTIVE');
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchProviders();
    }, [activeTab]);

    const fetchProviders = async () => {
        setLoading(true);
        try {
            const response = await adminService.getProvidersByStatus(activeTab);
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

    const handleViewDetail = (provider) => {
        setSelectedProvider(provider);
        setDetailModalVisible(true);
    };

    const handleChangeStatus = async (providerId, newStatus) => {
        setActionLoading(true);
        try {
            const response = await adminService.changeProviderStatus(providerId, newStatus);
            if (response.success) {
                message.success(
                    newStatus === 'ACTIVE'
                        ? 'Kích hoạt nhà cung cấp thành công!'
                        : 'Tạm ngưng nhà cung cấp thành công!'
                );
                fetchProviders();
            } else {
                message.error(response.message || 'Thay đổi trạng thái thất bại');
            }
        } catch (error) {

            message.error('Thay đổi trạng thái thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'ACTIVE':
                return {
                    color: 'success',
                    icon: <CheckCircleOutlined />,
                    text: 'Hoạt động'
                };
            case 'SUSPENDED':
                return {
                    color: 'error',
                    icon: <CloseCircleOutlined />,
                    text: 'Bị tạm ngưng'
                };
            default:
                return {
                    color: 'default',
                    icon: null,
                    text: status
                };
        }
    };

    const columns = [
        {
            title: 'Tên doanh nghiệp',
            dataIndex: 'businessName',
            key: 'businessName',
            render: (text) => <Text strong>{text}</Text>
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
            title: 'Xác thực',
            dataIndex: 'isVerified',
            key: 'isVerified',
            render: (isVerified) => (
                <Tag color={isVerified ? 'green' : 'orange'}>
                    {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </Tag>
            )
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Cập nhật lần cuối',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
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
                        onClick={() => handleViewDetail(record)}
                    >
                        Xem chi tiết
                    </Button>
                    {record.status === 'ACTIVE' ? (
                        <Popconfirm
                            title="Xác nhận tạm ngưng"
                            description="Bạn có chắc muốn tạm ngưng nhà cung cấp này?"
                            onConfirm={() => handleChangeStatus(record.id, 'SUSPENDED')}
                            okText="Tạm ngưng"
                            cancelText="Hủy"
                            okType="danger"
                        >
                            <Button
                                size="small"
                                danger
                                icon={<PauseCircleOutlined />}
                                loading={actionLoading}
                            >
                                Tạm ngưng
                            </Button>
                        </Popconfirm>
                    ) : (
                        <Popconfirm
                            title="Xác nhận kích hoạt"
                            description="Bạn có chắc muốn kích hoạt nhà cung cấp này?"
                            onConfirm={() => handleChangeStatus(record.id, 'ACTIVE')}
                            okText="Kích hoạt"
                            cancelText="Hủy"
                        >
                            <Button
                                size="small"
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                loading={actionLoading}
                            >
                                Kích hoạt
                            </Button>
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    const tabItems = [
        {
            key: 'ACTIVE',
            label: (
                <span>
                    <CheckCircleOutlined />
                    Hoạt động ({providers.length})
                </span>
            ),
            children: (
                <Table
                    columns={columns}
                    dataSource={providers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} nhà cung cấp`
                    }}
                />
            )
        },
        {
            key: 'SUSPENDED',
            label: (
                <span>
                    <CloseCircleOutlined />
                    Bị tạm ngưng
                </span>
            ),
            children: (
                <Table
                    columns={columns}
                    dataSource={providers}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} nhà cung cấp`
                    }}
                />
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                    Quản lý Nhà cung cấp
                </Title>
                <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                    Quản lý trạng thái và thông tin các nhà cung cấp trong hệ thống
                </p>
            </div>

            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    size="large"
                />
            </Card>


            <Modal
                title="Chi tiết Nhà cung cấp"
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedProvider(null);
                }}
                footer={null}
                width={800}
                centered
            >
                {selectedProvider ? (
                    <div>

                        <div style={{ marginBottom: '24px' }}>
                            <Title level={3} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                                {selectedProvider.businessName}
                            </Title>
                            <Space>
                                <Tag
                                    color={getStatusConfig(selectedProvider.status).color}
                                    icon={getStatusConfig(selectedProvider.status).icon}
                                    style={{ fontSize: '14px', padding: '6px 12px' }}
                                >
                                    {getStatusConfig(selectedProvider.status).text}
                                </Tag>
                                <Tag color={selectedProvider.isVerified ? 'green' : 'orange'}>
                                    {selectedProvider.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                                </Tag>
                            </Space>
                        </div>


                        <div style={{ marginBottom: '24px' }}>
                            <Title level={4} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                                Thông tin cơ bản
                            </Title>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>Ngày tạo</Text>
                                        <br />
                                        <Text strong>
                                            {dayjs(selectedProvider.createdAt).format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>Cập nhật lần cuối</Text>
                                        <br />
                                        <Text strong>
                                            {dayjs(selectedProvider.updatedAt).format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                    </div>
                                </Col>
                            </Row>
                        </div>


                        <div style={{ marginBottom: '24px' }}>
                            <Title level={4} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                                Thông tin doanh nghiệp
                            </Title>
                            <Row gutter={[16, 16]}>
                                {selectedProvider.bio && (
                                    <Col span={24}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Giới thiệu</Text>
                                            <br />
                                            <Text>{selectedProvider.bio}</Text>
                                        </div>
                                    </Col>
                                )}
                                {selectedProvider.address && (
                                    <Col span={12}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Địa chỉ</Text>
                                            <br />
                                            <Text>{selectedProvider.address}</Text>
                                        </div>
                                    </Col>
                                )}
                                {selectedProvider.phoneNumber && (
                                    <Col span={12}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Số điện thoại</Text>
                                            <br />
                                            <Text>{selectedProvider.phoneNumber}</Text>
                                        </div>
                                    </Col>
                                )}
                                {selectedProvider.websiteUrl && (
                                    <Col span={24}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Website</Text>
                                            <br />
                                            <Text>
                                                <a href={selectedProvider.websiteUrl} target="_blank" rel="noopener noreferrer">
                                                    {selectedProvider.websiteUrl}
                                                </a>
                                            </Text>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </div>


                        <div style={{ marginBottom: '24px' }}>
                            <Title level={4} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                                Hình ảnh
                            </Title>
                            <Row gutter={[16, 16]}>
                                {selectedProvider.logoUrl && (
                                    <Col span={12}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Logo</Text>
                                            <br />
                                            <Image
                                                src={getImageUrl(selectedProvider.logoUrl)}
                                                alt="Logo"
                                                style={{
                                                    maxWidth: '200px',
                                                    maxHeight: '150px',
                                                    borderRadius: '8px'
                                                }}
                                                preview={{
                                                    mask: 'Xem ảnh'
                                                }}
                                            />
                                        </div>
                                    </Col>
                                )}
                                {selectedProvider.bannerUrl && (
                                    <Col span={12}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Banner</Text>
                                            <br />
                                            <Image
                                                src={getImageUrl(selectedProvider.bannerUrl)}
                                                alt="Banner"
                                                style={{
                                                    maxWidth: '200px',
                                                    maxHeight: '150px',
                                                    borderRadius: '8px'
                                                }}
                                                preview={{
                                                    mask: 'Xem ảnh'
                                                }}
                                            />
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </div>


                        <div style={{ textAlign: 'right' }}>
                            <Space>
                                <Button onClick={() => setDetailModalVisible(false)}>
                                    Đóng
                                </Button>
                                {selectedProvider.status === 'ACTIVE' ? (
                                    <Popconfirm
                                        title="Xác nhận tạm ngưng"
                                        description="Bạn có chắc muốn tạm ngưng nhà cung cấp này?"
                                        onConfirm={() => {
                                            handleChangeStatus(selectedProvider.id, 'SUSPENDED');
                                            setDetailModalVisible(false);
                                        }}
                                        okText="Tạm ngưng"
                                        cancelText="Hủy"
                                        okType="danger"
                                    >
                                        <Button danger icon={<PauseCircleOutlined />}>
                                            Tạm ngưng
                                        </Button>
                                    </Popconfirm>
                                ) : (
                                    <Popconfirm
                                        title="Xác nhận kích hoạt"
                                        description="Bạn có chắc muốn kích hoạt nhà cung cấp này?"
                                        onConfirm={() => {
                                            handleChangeStatus(selectedProvider.id, 'ACTIVE');
                                            setDetailModalVisible(false);
                                        }}
                                        okText="Kích hoạt"
                                        cancelText="Hủy"
                                    >
                                        <Button type="primary" icon={<PlayCircleOutlined />}>
                                            Kích hoạt
                                        </Button>
                                    </Popconfirm>
                                )}
                            </Space>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};

export default ProviderManagement;
