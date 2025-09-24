import React, { useState, useEffect } from 'react';
import { Card, Button, message, Typography, Tag, Space, Modal, Row, Col, Empty, Spin, Image, Divider } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { providerApplicationService } from '../services/providerApplicationService';
import { getImageUrl } from '../utils/imageUtils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ApplicationManagementPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const navigate = useNavigate();


    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await providerApplicationService.getMyApplications();
            if (response.success) {
                setApplications(response.data || []);
            } else {
                message.error(response.message || 'Không thể tải danh sách đơn đăng ký!');
            }
        } catch (error) {

            const errorMessage = error.message || error.response?.data?.message || 'Không thể tải danh sách đơn đăng ký!';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);


    const handleCancelApplication = (applicationId) => {
        Modal.confirm({
            title: 'Xác nhận hủy đơn',
            content: 'Bạn có chắc muốn hủy đơn đăng ký này?',
            okText: 'Hủy đơn',
            cancelText: 'Không',
            okType: 'danger',
            onOk: async () => {
                setActionLoading(prev => ({ ...prev, [applicationId]: true }));
                try {
                    const response = await providerApplicationService.cancelApplication(applicationId);
                    if (response.success) {
                        message.success('Hủy đơn thành công!');
                        fetchApplications();
                    } else {
                        message.error(response.message || 'Hủy đơn thất bại!');
                    }
                } catch (error) {

                    const errorMessage = error.message || error.response?.data?.message || 'Hủy đơn thất bại!';
                    message.error(errorMessage);
                } finally {
                    setActionLoading(prev => ({ ...prev, [applicationId]: false }));
                }
            }
        });
    };


    const handleEditApplication = (applicationId) => {
        navigate(`/edit-application/${applicationId}`);
    };

    const handleViewDetail = async (applicationId) => {
        setDetailLoading(true);
        setDetailModalVisible(true);
        try {
            const response = await providerApplicationService.getApplicationById(applicationId);
            if (response.success) {
                setSelectedApplication(response.data);
            } else {
                message.error(response.message || 'Không thể tải thông tin chi tiết!');
                setDetailModalVisible(false);
            }
        } catch (error) {
            const errorMessage = error.message || error.response?.data?.message || 'Không thể tải thông tin chi tiết!';
            message.error(errorMessage);
            setDetailModalVisible(false);
        } finally {
            setDetailLoading(false);
        }
    };


    const getStatusConfig = (status) => {
        switch (status) {
            case 'PENDING':
                return {
                    color: 'processing',
                    icon: <ClockCircleOutlined />,
                    text: 'Chờ duyệt'
                };
            case 'APPROVED':
                return {
                    color: 'success',
                    icon: <CheckCircleOutlined />,
                    text: 'Đã được duyệt'
                };
            case 'REJECTED':
                return {
                    color: 'error',
                    icon: <CloseCircleOutlined />,
                    text: 'Đã bị từ chối'
                };
            default:
                return {
                    color: 'default',
                    icon: null,
                    text: status
                };
        }
    };


    const renderStatusContent = (application) => {
        const statusConfig = getStatusConfig(application.status);

        switch (application.status) {
            case 'PENDING':
                return (
                    <Space>
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(application.id)}
                        >
                            Xem chi tiết
                        </Button>
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => handleEditApplication(application.id)}
                        >
                            Chỉnh sửa
                        </Button>
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            loading={actionLoading[application.id]}
                            onClick={() => handleCancelApplication(application.id)}
                        >
                            Hủy đơn
                        </Button>
                    </Space>
                );
            case 'APPROVED':
                return (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
                        <Title level={4} style={{ color: '#52c41a', marginBottom: '8px' }}>
                            Chúc mừng!
                        </Title>
                        <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
                            Đơn đăng ký của bạn đã được duyệt. Bạn có thể bắt đầu cung cấp dịch vụ.
                        </Text>
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(application.id)}
                        >
                            Xem chi tiết
                        </Button>
                    </div>
                );
            case 'REJECTED':
                return (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <CloseCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
                        <Title level={4} style={{ color: '#ff4d4f', marginBottom: '8px' }}>
                            Rất tiếc!
                        </Title>
                        <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
                            Đơn đăng ký của bạn đã bị từ chối. Vui lòng liên hệ với chúng tôi để biết thêm chi tiết.
                        </Text>
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(application.id)}
                        >
                            Xem chi tiết
                        </Button>
                    </div>
                );
            default:
                return null;
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
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                }}>
                    <div>
                        <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                            Đơn đăng ký của tôi
                        </Title>
                        <Text type="secondary">
                            Theo dõi trạng thái các đơn đăng ký trở thành đối tác cung cấp dịch vụ
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        onClick={() => navigate('/apply-provider')}
                        style={{
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                            border: 'none',
                            height: '40px',
                            fontWeight: '600'
                        }}
                    >
                        Đăng ký mới
                    </Button>
                </div>


                {applications.length === 0 ? (
                    <Card>
                        <Empty
                            description="Bạn chưa có đơn đăng ký nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        >
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => navigate('/apply-provider')}
                                style={{
                                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                    border: 'none'
                                }}
                            >
                                Tạo đơn đăng ký đầu tiên
                            </Button>
                        </Empty>
                    </Card>
                ) : (
                    <div>
                        {applications.map((application) => {
                            const statusConfig = getStatusConfig(application.status);

                            return (
                                <Card
                                    key={application.id}
                                    hoverable
                                    style={{
                                        marginBottom: '16px',
                                        borderRadius: '12px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                    bodyStyle={{ padding: '16px' }}
                                >
                                    <Row gutter={[16, 16]} align="middle">
                                        { }
                                        <Col xs={24} sm={12} md={8}>
                                            <div>
                                                <Title level={4} style={{ marginBottom: '4px', color: '#1e3a8a' }}>
                                                    {application.businessName}
                                                </Title>
                                                <Tag
                                                    color={statusConfig.color}
                                                    icon={statusConfig.icon}
                                                    style={{ fontSize: '12px', padding: '2px 6px' }}
                                                >
                                                    {statusConfig.text}
                                                </Tag>
                                            </div>
                                        </Col>

                                        { }
                                        <Col xs={24} sm={12} md={8}>
                                            <div>
                                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                                    Ngày nộp đơn:
                                                </Text>
                                                <br />
                                                <Text strong style={{ fontSize: '13px' }}>
                                                    {dayjs(application.createdAt).format('DD/MM/YYYY HH:mm')}
                                                </Text>
                                                {application.bio && (
                                                    <>
                                                        <br />
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            Giới thiệu:
                                                        </Text>
                                                        <br />
                                                        <Text style={{ fontSize: '12px' }}>
                                                            {application.bio.length > 50
                                                                ? `${application.bio.substring(0, 50)}...`
                                                                : application.bio
                                                            }
                                                        </Text>
                                                    </>
                                                )}
                                            </div>
                                        </Col>

                                        { }
                                        <Col xs={24} sm={24} md={8}>
                                            <div style={{ textAlign: 'right' }}>
                                                {renderStatusContent(application)}
                                            </div>
                                        </Col>
                                    </Row>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>


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
                {detailLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Spin size="large" />
                    </div>
                ) : selectedApplication ? (
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
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => {
                                            setDetailModalVisible(false);
                                            handleEditApplication(selectedApplication.id);
                                        }}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                )}
                            </Space>
                        </div>
                    </div>
                ) : null}
            </Modal>
        </div>
    );
};

export default ApplicationManagementPage;
