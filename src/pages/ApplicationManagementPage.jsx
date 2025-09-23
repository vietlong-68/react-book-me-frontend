import React, { useState, useEffect } from 'react';
import { Card, Button, message, Typography, Tag, Space, Modal, Row, Col, Empty, Spin } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { providerApplicationService } from '../services/providerApplicationService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ApplicationManagementPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({});
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
                        <Text type="secondary">
                            Đơn đăng ký của bạn đã được duyệt. Bạn có thể bắt đầu cung cấp dịch vụ.
                        </Text>
                    </div>
                );
            case 'REJECTED':
                return (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <CloseCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
                        <Title level={4} style={{ color: '#ff4d4f', marginBottom: '8px' }}>
                            Rất tiếc!
                        </Title>
                        <Text type="secondary">
                            Đơn đăng ký của bạn đã bị từ chối. Vui lòng liên hệ với chúng tôi để biết thêm chi tiết.
                        </Text>
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
                    <Row gutter={[16, 16]}>
                        {applications.map((application) => {
                            const statusConfig = getStatusConfig(application.status);

                            return (
                                <Col xs={24} sm={12} lg={8} key={application.id}>
                                    <Card
                                        hoverable
                                        style={{
                                            height: '100%',
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        bodyStyle={{ padding: '20px' }}
                                    >

                                        <div style={{ marginBottom: '16px' }}>
                                            <Title level={4} style={{ marginBottom: '8px', color: '#1e3a8a' }}>
                                                {application.businessName}
                                            </Title>
                                            <Tag
                                                color={statusConfig.color}
                                                icon={statusConfig.icon}
                                                style={{ fontSize: '12px', padding: '4px 8px' }}
                                            >
                                                {statusConfig.text}
                                            </Tag>
                                        </div>


                                        <div style={{ marginBottom: '16px' }}>
                                            <Row gutter={[8, 8]}>
                                                <Col span={24}>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        Ngày nộp đơn:
                                                    </Text>
                                                    <br />
                                                    <Text strong>
                                                        {dayjs(application.createdAt).format('DD/MM/YYYY HH:mm')}
                                                    </Text>
                                                </Col>
                                                {application.bio && (
                                                    <Col span={24}>
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            Giới thiệu:
                                                        </Text>
                                                        <br />
                                                        <Text style={{ fontSize: '13px' }}>
                                                            {application.bio.length > 100
                                                                ? `${application.bio.substring(0, 100)}...`
                                                                : application.bio
                                                            }
                                                        </Text>
                                                    </Col>
                                                )}
                                                {application.address && (
                                                    <Col span={24}>
                                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                                            Địa chỉ:
                                                        </Text>
                                                        <br />
                                                        <Text style={{ fontSize: '13px' }}>
                                                            {application.address}
                                                        </Text>
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>


                                        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                                            {renderStatusContent(application)}
                                        </div>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default ApplicationManagementPage;
