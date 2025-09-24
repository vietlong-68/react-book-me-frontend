import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Typography,
    Statistic,
    Row,
    Col,
    Input,
    Table,
    Space,
    message,
    Modal,
    Tag,
    Divider,
    Alert
} from 'antd';
import {
    SecurityScanOutlined,
    DeleteOutlined,
    UserOutlined,
    LogoutOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SystemManagement = () => {
    const [tokenStats, setTokenStats] = useState({});
    const [loading, setLoading] = useState(false);
    const [cleanupLoading, setCleanupLoading] = useState(false);
    const [userTokens, setUserTokens] = useState([]);
    const [userTokensLoading, setUserTokensLoading] = useState(false);
    const [userId, setUserId] = useState('');
    const [cleanupResult, setCleanupResult] = useState(null);

    useEffect(() => {
        fetchTokenStats();
    }, []);

    const fetchTokenStats = async () => {
        setLoading(true);
        try {
            const response = await adminService.getTokenStats();
            if (response.success) {
                setTokenStats(response.data || {});
            } else {
                message.error(response.message || 'Không thể tải thống kê token');
            }
        } catch (error) {

            message.error('Không thể tải thống kê token');
        } finally {
            setLoading(false);
        }
    };

    const handleCleanupTokens = async () => {
        setCleanupLoading(true);
        try {
            const response = await adminService.cleanupExpiredTokens();
            if (response.success) {
                setCleanupResult(response.data);
                message.success(`Dọn dẹp thành công! Đã xóa ${response.data?.cleanedCount || 0} token hết hạn`);
                fetchTokenStats();
            } else {
                message.error(response.message || 'Dọn dẹp token thất bại');
            }
        } catch (error) {

            message.error('Dọn dẹp token thất bại');
        } finally {
            setCleanupLoading(false);
        }
    };

    const handleGetUserTokens = async () => {
        if (!userId.trim()) {
            message.error('Vui lòng nhập User ID');
            return;
        }

        setUserTokensLoading(true);
        try {
            const response = await adminService.getUserActiveTokens(userId);
            if (response.success) {
                setUserTokens(response.data || []);
                if (response.data && response.data.length === 0) {
                    message.info('Người dùng này không có token đang hoạt động');
                }
            } else {
                message.error(response.message || 'Không thể tải danh sách token');
                setUserTokens([]);
            }
        } catch (error) {

            message.error('Không thể tải danh sách token');
            setUserTokens([]);
        } finally {
            setUserTokensLoading(false);
        }
    };

    const handleForceLogout = async () => {
        if (!userId.trim()) {
            message.error('Vui lòng nhập User ID');
            return;
        }

        Modal.confirm({
            title: 'Xác nhận đăng xuất bắt buộc',
            content: `Bạn có chắc muốn đăng xuất bắt buộc người dùng có ID: ${userId}?`,
            okText: 'Đăng xuất bắt buộc',
            cancelText: 'Hủy',
            okType: 'danger',
            onOk: async () => {
                try {
                    const response = await adminService.forceLogoutUser(userId);
                    if (response.success) {
                        message.success('Đăng xuất bắt buộc thành công!');
                        setUserTokens([]);
                        fetchTokenStats();
                    } else {
                        message.error(response.message || 'Đăng xuất bắt buộc thất bại');
                    }
                } catch (error) {

                    message.error('Đăng xuất bắt buộc thất bại');
                }
            }
        });
    };

    const tokenColumns = [
        {
            title: 'Token ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Text code>{text.substring(0, 20)}...</Text>
        },
        {
            title: 'Người dùng',
            dataIndex: 'userId',
            key: 'userId',
        },
        {
            title: 'Thời gian tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Hết hạn',
            dataIndex: 'expiresAt',
            key: 'expiresAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                const isExpired = dayjs().isAfter(dayjs(record.expiresAt));
                return (
                    <Tag color={isExpired ? 'red' : 'green'} icon={isExpired ? <CloseCircleOutlined /> : <CheckCircleOutlined />}>
                        {isExpired ? 'Hết hạn' : 'Hoạt động'}
                    </Tag>
                );
            }
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                    Hệ thống - Bảo mật & Token
                </Title>
                <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                    Quản lý bảo mật và token trong hệ thống
                </p>
            </div>


            <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
                <Col xs={24} lg={12}>
                    <Card
                        title="Thống kê Token"
                        extra={
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={fetchTokenStats}
                                loading={loading}
                            >
                                Làm mới
                            </Button>
                        }
                        style={{ borderRadius: '12px' }}
                        headStyle={{
                            background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                            color: '#fff',
                            borderRadius: '12px 12px 0 0'
                        }}
                    >
                        <Row gutter={[16, 16]}>
                            <Col span={12}>
                                <Statistic
                                    title="Token đang hoạt động"
                                    value={tokenStats.totalActiveTokens || 0}
                                    valueStyle={{ color: '#52c41a' }}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Token bị chặn"
                                    value={tokenStats.totalBlacklistedTokens || 0}
                                    valueStyle={{ color: '#ff4d4f' }}
                                    prefix={<CloseCircleOutlined />}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title="Dọn dẹp Token"
                        style={{ borderRadius: '12px' }}
                        headStyle={{
                            background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                            color: '#fff',
                            borderRadius: '12px 12px 0 0'
                        }}
                    >
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <p style={{ color: '#666', marginBottom: '16px' }}>
                                Dọn dẹp các token đã hết hạn trong hệ thống
                            </p>
                            <Button
                                type="primary"
                                icon={<DeleteOutlined />}
                                loading={cleanupLoading}
                                onClick={handleCleanupTokens}
                                style={{
                                    background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                                    border: 'none'
                                }}
                            >
                                Dọn dẹp Token hết hạn
                            </Button>
                            {cleanupResult && (
                                <Alert
                                    message={`Đã dọn dẹp ${cleanupResult.cleanedCount || 0} token hết hạn`}
                                    type="success"
                                    style={{ marginTop: '16px' }}
                                    showIcon
                                />
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>


            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <Card
                        title="Quản lý Token người dùng"
                        style={{ borderRadius: '12px' }}
                        headStyle={{
                            background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                            color: '#fff',
                            borderRadius: '12px 12px 0 0'
                        }}
                    >
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>User ID:</Text>
                            <Input
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="Nhập User ID"
                                style={{ marginTop: '8px' }}
                            />
                        </div>

                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                            <Button
                                icon={<UserOutlined />}
                                onClick={handleGetUserTokens}
                                loading={userTokensLoading}
                            >
                                Xem phiên đăng nhập
                            </Button>
                            <Button
                                danger
                                icon={<LogoutOutlined />}
                                onClick={handleForceLogout}
                            >
                                Đăng xuất bắt buộc
                            </Button>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title="Thông tin bảo mật"
                        style={{ borderRadius: '12px' }}
                        headStyle={{
                            background: 'linear-gradient(135deg, #13c2c2 0%, #36cfc9 100%)',
                            color: '#fff',
                            borderRadius: '12px 12px 0 0'
                        }}
                    >
                        <div style={{ padding: '20px 0' }}>
                            <Alert
                                message="Thông tin bảo mật"
                                description="Hệ thống sử dụng JWT token để xác thực. Token có thời hạn và sẽ tự động hết hạn. Admin có thể dọn dẹp token hết hạn và đăng xuất bắt buộc người dùng."
                                type="info"
                                showIcon
                                icon={<SecurityScanOutlined />}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>


            {userTokens.length > 0 && (
                <Card
                    title={`Token đang hoạt động của User: ${userId}`}
                    style={{ marginTop: '24px', borderRadius: '12px' }}
                >
                    <Table
                        columns={tokenColumns}
                        dataSource={userTokens}
                        rowKey="id"
                        loading={userTokensLoading}
                        pagination={{
                            pageSize: 5,
                            showSizeChanger: false,
                            showTotal: (total) => `${total} token`
                        }}
                        size="small"
                    />
                </Card>
            )}
        </div>
    );
};

export default SystemManagement;
