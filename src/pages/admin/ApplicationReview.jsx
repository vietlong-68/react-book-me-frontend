import React, { useState, useEffect } from 'react';
import {
    Table,
    Tabs,
    Button,
    Modal,
    Typography,
    Tag,
    Space,
    Image,
    Row,
    Col,
    Input,
    message,
    Spin,
    Card,
    Divider
} from 'antd';
import {
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import { getImageUrl } from '../../utils/imageUtils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ApplicationReview = () => {
    const [loading, setLoading] = useState(false);
    const [applications, setApplications] = useState([]);
    const [applicationsByStatus, setApplicationsByStatus] = useState({
        PENDING: [],
        APPROVED: [],
        REJECTED: []
    });
    const [activeTab, setActiveTab] = useState('PENDING');
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, [activeTab]);


    useEffect(() => {
        const loadAllTabs = async () => {

            const statuses = ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'];
            for (const status of statuses) {
                try {
                    const response = await adminService.getApplicationsByStatus(status);
                    if (response && response.success) {
                        const data = response.data;
                        if (data && data.content && Array.isArray(data.content)) {

                            if (status === 'PENDING') {
                                setApplicationsByStatus(prev => ({
                                    ...prev,
                                    PENDING: [...prev.PENDING, ...data.content]
                                }));
                            } else if (status === 'APPROVED' || status === 'COMPLETED') {
                                setApplicationsByStatus(prev => ({
                                    ...prev,
                                    APPROVED: [...prev.APPROVED, ...data.content]
                                }));
                            } else if (status === 'REJECTED' || status === 'CANCELLED') {
                                setApplicationsByStatus(prev => ({
                                    ...prev,
                                    REJECTED: [...prev.REJECTED, ...data.content]
                                }));
                            }
                        }
                    }
                } catch (error) {

                }
            }
        };
        loadAllTabs();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {

            const allStatuses = ['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'CANCELLED'];
            let allApplications = [];

            for (const status of allStatuses) {
                try {
                    const response = await adminService.getApplicationsByStatus(status);
                    if (response && response.success) {
                        const data = response.data;
                        if (data && data.content && Array.isArray(data.content)) {
                            allApplications = [...allApplications, ...data.content];
                        }
                    }
                } catch (error) {

                }
            }


            const pendingApps = allApplications.filter(app => app.status === 'PENDING');
            const approvedApps = allApplications.filter(app =>
                app.status === 'APPROVED' || app.status === 'COMPLETED'
            );
            const rejectedApps = allApplications.filter(app =>
                app.status === 'REJECTED' || app.status === 'CANCELLED'
            );


            setApplicationsByStatus({
                PENDING: pendingApps,
                APPROVED: approvedApps,
                REJECTED: rejectedApps
            });


            switch (activeTab) {
                case 'PENDING':
                    setApplications(pendingApps);
                    break;
                case 'APPROVED':
                    setApplications(approvedApps);
                    break;
                case 'REJECTED':
                    setApplications(rejectedApps);
                    break;
                default:
                    setApplications([]);
            }

        } catch (error) {


            const mockData = [
                {
                    id: '1',
                    businessName: 'Cửa hàng cắt tóc ABC',
                    bio: 'Cửa hàng cắt tóc chuyên nghiệp',
                    address: '123 Đường ABC, Quận 1, TP.HCM',
                    phoneNumber: '0123456789',
                    websiteUrl: 'https://abc-barbershop.com',
                    businessLicenseFileUrl: '/uploads/sample-license.jpg',
                    status: activeTab,
                    userId: 'user-123',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            setApplications(mockData);
            setApplicationsByStatus(prev => ({
                ...prev,
                [activeTab]: mockData
            }));
            message.warning('Đang sử dụng dữ liệu mẫu. API có thể chưa sẵn sàng.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (applicationId) => {
        try {
            const response = await adminService.getApplicationById(applicationId);
            if (response.success) {
                setSelectedApplication(response.data);
                setDetailModalVisible(true);
            } else {
                message.error(response.message || 'Không thể tải thông tin chi tiết');
            }
        } catch (error) {

            message.error('Không thể tải thông tin chi tiết');
        }
    };

    const handleApprove = async (applicationId) => {
        setActionLoading(true);
        try {
            const response = await adminService.approveApplication(applicationId);
            if (response.success) {
                message.success('Duyệt đơn thành công!');
                setDetailModalVisible(false);
                fetchApplications();
            } else {
                message.error(response.message || 'Duyệt đơn thất bại');
            }
        } catch (error) {

            message.error('Duyệt đơn thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = () => {
        if (!rejectReason.trim()) {
            message.error('Vui lòng nhập lý do từ chối');
            return;
        }

        setActionLoading(true);
        adminService.rejectApplication(selectedApplication.id, rejectReason)
            .then(response => {
                if (response.success) {
                    message.success('Từ chối đơn thành công!');
                    setRejectModalVisible(false);
                    setDetailModalVisible(false);
                    setRejectReason('');
                    fetchApplications();
                } else {
                    message.error(response.message || 'Từ chối đơn thất bại');
                }
            })
            .catch(error => {

                message.error('Từ chối đơn thất bại');
            })
            .finally(() => {
                setActionLoading(false);
            });
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING':
                return {
                    color: 'processing',
                    icon: <ClockCircleOutlined />,
                    text: 'Đang chờ duyệt'
                };
            case 'APPROVED':
                return {
                    color: 'success',
                    icon: <CheckCircleOutlined />,
                    text: 'Đã duyệt'
                };
            case 'COMPLETED':
                return {
                    color: 'success',
                    icon: <CheckCircleOutlined />,
                    text: 'Đã hoàn thành'
                };
            case 'REJECTED':
                return {
                    color: 'error',
                    icon: <CloseCircleOutlined />,
                    text: 'Đã từ chối'
                };
            case 'CANCELLED':
                return {
                    color: 'error',
                    icon: <CloseCircleOutlined />,
                    text: 'Đã hủy'
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
            title: 'Ngày nộp đơn',
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
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record.id)}
                    >
                        Xem chi tiết
                    </Button>
                </Space>
            )
        }
    ];

    const tabItems = [
        {
            key: 'PENDING',
            label: (
                <span>
                    <ClockCircleOutlined />
                    Chờ duyệt ({applicationsByStatus.PENDING.length})
                </span>
            ),
            children: (
                <Table
                    columns={columns}
                    dataSource={applications}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đơn đăng ký`
                    }}
                />
            )
        },
        {
            key: 'APPROVED',
            label: (
                <span>
                    <CheckCircleOutlined />
                    Đã duyệt ({applicationsByStatus.APPROVED.length})
                </span>
            ),
            children: (
                <Table
                    columns={columns}
                    dataSource={applications}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đơn đăng ký`
                    }}
                />
            )
        },
        {
            key: 'REJECTED',
            label: (
                <span>
                    <CloseCircleOutlined />
                    Đã hủy/Từ chối ({applicationsByStatus.REJECTED.length})
                </span>
            ),
            children: (
                <Table
                    columns={columns}
                    dataSource={applications}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đơn đăng ký`
                    }}
                />
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                    Xét duyệt Đơn đăng ký
                </Title>
                <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                    Quản lý và xét duyệt các đơn đăng ký trở thành nhà cung cấp
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
                title="Chi tiết đơn đăng ký"
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                    setSelectedApplication(null);
                }}
                footer={null}
                width={800}
                centered
            >
                {selectedApplication ? (
                    <div>

                        <div style={{ marginBottom: '24px' }}>
                            <Title level={3} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                                {selectedApplication.businessName}
                            </Title>
                            <Tag
                                color={getStatusConfig(selectedApplication.status).color}
                                icon={getStatusConfig(selectedApplication.status).icon}
                                style={{ fontSize: '14px', padding: '6px 12px' }}
                            >
                                {getStatusConfig(selectedApplication.status).text}
                            </Tag>
                        </div>

                        <Divider />


                        <div style={{ marginBottom: '24px' }}>
                            <Title level={4} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                                Thông tin cơ bản
                            </Title>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>Ngày nộp đơn</Text>
                                        <br />
                                        <Text strong>
                                            {dayjs(selectedApplication.createdAt).format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>Cập nhật lần cuối</Text>
                                        <br />
                                        <Text strong>
                                            {dayjs(selectedApplication.updatedAt).format('DD/MM/YYYY HH:mm')}
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
                                {selectedApplication.bio && (
                                    <Col span={24}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Giới thiệu</Text>
                                            <br />
                                            <Text>{selectedApplication.bio}</Text>
                                        </div>
                                    </Col>
                                )}
                                {selectedApplication.address && (
                                    <Col span={12}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Địa chỉ</Text>
                                            <br />
                                            <Text>{selectedApplication.address}</Text>
                                        </div>
                                    </Col>
                                )}
                                {selectedApplication.phoneNumber && (
                                    <Col span={12}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Số điện thoại</Text>
                                            <br />
                                            <Text>{selectedApplication.phoneNumber}</Text>
                                        </div>
                                    </Col>
                                )}
                                {selectedApplication.websiteUrl && (
                                    <Col span={24}>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>Website</Text>
                                            <br />
                                            <Text>
                                                <a href={selectedApplication.websiteUrl} target="_blank" rel="noopener noreferrer">
                                                    {selectedApplication.websiteUrl}
                                                </a>
                                            </Text>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </div>


                        <div style={{ marginBottom: '24px' }}>
                            <Title level={4} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                                Giấy phép kinh doanh
                            </Title>
                            {selectedApplication.businessLicenseFileUrl ? (
                                <div style={{ textAlign: 'center' }}>
                                    <Image
                                        src={getImageUrl(selectedApplication.businessLicenseFileUrl)}
                                        alt="Giấy phép kinh doanh"
                                        style={{
                                            maxWidth: '400px',
                                            maxHeight: '300px',
                                            width: '100%',
                                            height: 'auto',
                                            borderRadius: '8px',
                                            objectFit: 'contain'
                                        }}
                                        preview={{
                                            mask: 'Xem ảnh',
                                            src: getImageUrl(selectedApplication.businessLicenseFileUrl)
                                        }}
                                    />
                                </div>
                            ) : (
                                <Text type="secondary">Không có ảnh giấy phép kinh doanh</Text>
                            )}
                        </div>


                        <Divider />
                        <div style={{ textAlign: 'right' }}>
                            <Space>
                                <Button onClick={() => setDetailModalVisible(false)}>
                                    Đóng
                                </Button>
                                {selectedApplication.status === 'PENDING' && (
                                    <>
                                        <Button
                                            type="primary"
                                            danger
                                            icon={<CloseOutlined />}
                                            onClick={() => setRejectModalVisible(true)}
                                        >
                                            Từ chối
                                        </Button>
                                        <Button
                                            type="primary"
                                            icon={<CheckOutlined />}
                                            loading={actionLoading}
                                            onClick={() => handleApprove(selectedApplication.id)}
                                        >
                                            Duyệt
                                        </Button>
                                    </>
                                )}
                            </Space>
                        </div>
                    </div>
                ) : (
                    <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />
                )}
            </Modal>


            <Modal
                title="Từ chối đơn đăng ký"
                open={rejectModalVisible}
                onCancel={() => {
                    setRejectModalVisible(false);
                    setRejectReason('');
                }}
                onOk={handleReject}
                confirmLoading={actionLoading}
                okText="Từ chối"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
            >
                <div>
                    <p style={{ marginBottom: '16px' }}>
                        Vui lòng nhập lý do từ chối đơn đăng ký của <strong>{selectedApplication?.businessName}</strong>:
                    </p>
                    <TextArea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Nhập lý do từ chối..."
                        rows={4}
                        maxLength={500}
                        showCount
                    />
                </div>
            </Modal>
        </div>
    );
};

export default ApplicationReview;
