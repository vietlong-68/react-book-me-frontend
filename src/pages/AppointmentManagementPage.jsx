import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Button,
    Tag,
    Space,
    Typography,
    Tabs,
    message,
    Tooltip,
    Modal,
    Descriptions,
    Row,
    Col,
    Statistic,
    Divider
} from 'antd';
import {
    ArrowLeftOutlined,
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    UserOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { providerService } from '../services/providerService';
import { appointmentService } from '../services/appointmentService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AppointmentManagementPage = () => {
    const navigate = useNavigate();
    const { providerId } = useParams();

    const [loading, setLoading] = useState(false);
    const [appointments, setAppointments] = useState([]);
    const [provider, setProvider] = useState(null);
    const [activeTab, setActiveTab] = useState('SCHEDULED');
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    useEffect(() => {
        if (providerId) {
            fetchProviderInfo();
            fetchAppointments();
        }
    }, [providerId, activeTab, pagination.current, pagination.pageSize]);

    const fetchProviderInfo = async () => {
        try {
            const response = await providerService.getProviderById(providerId);
            if (response.success) {
                setProvider(response.data);
            }
        } catch (error) {

        }
    };

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            let response;

            if (activeTab === 'ALL') {
                response = await appointmentService.getProviderAppointmentsPaginated(
                    pagination.current - 1,
                    pagination.pageSize
                );
            } else {
                response = await appointmentService.getProviderAppointmentsByStatus(
                    activeTab,
                    pagination.current - 1,
                    pagination.pageSize
                );
            }

            if (response.success) {
                setAppointments(response.data.content || []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.totalElements || 0
                }));
            } else {
                message.error('Không thể tải danh sách cuộc hẹn');
            }
        } catch (error) {

            message.error('Không thể tải danh sách cuộc hẹn');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleConfirmAppointment = async (appointmentId) => {
        try {
            const response = await appointmentService.confirmAppointment(appointmentId);
            if (response.success) {
                message.success('Xác nhận cuộc hẹn thành công!');
                fetchAppointments();
            } else {
                message.error(response.message || 'Không thể xác nhận cuộc hẹn');
            }
        } catch (error) {

            message.error('Không thể xác nhận cuộc hẹn');
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        try {
            const response = await appointmentService.cancelAppointment(appointmentId);
            if (response.success) {
                message.success('Hủy cuộc hẹn thành công!');
                fetchAppointments();
            } else {
                message.error(response.message || 'Không thể hủy cuộc hẹn');
            }
        } catch (error) {

            message.error('Không thể hủy cuộc hẹn');
        }
    };

    const handleCompleteAppointment = async (appointmentId) => {
        try {
            const response = await appointmentService.completeAppointment(appointmentId);
            if (response.success) {
                message.success('Hoàn thành cuộc hẹn thành công!');
                fetchAppointments();
            } else {
                message.error(response.message || 'Không thể hoàn thành cuộc hẹn');
            }
        } catch (error) {

            message.error('Không thể hoàn thành cuộc hẹn');
        }
    };

    const handleViewDetails = async (appointmentId) => {
        try {
            const response = await appointmentService.getAppointmentById(appointmentId);
            if (response.success) {
                setSelectedAppointment(response.data);
                setDetailModalVisible(true);
            } else {
                message.error('Không thể tải chi tiết cuộc hẹn');
            }
        } catch (error) {

            message.error('Không thể tải chi tiết cuộc hẹn');
        }
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            SCHEDULED: { color: 'orange', text: 'Chờ xác nhận' },
            CONFIRMED: { color: 'blue', text: 'Đã xác nhận' },
            COMPLETED: { color: 'green', text: 'Đã hoàn thành' },
            CANCELLED: { color: 'red', text: 'Đã hủy' }
        };

        const config = statusConfig[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getActionButtons = (record) => {
        const { id, status } = record;

        switch (status) {
            case 'SCHEDULED':
                return (
                    <Space>
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleConfirmAppointment(id)}
                        >
                            Xác nhận
                        </Button>
                        <Button
                            danger
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => handleCancelAppointment(id)}
                        >
                            Hủy lịch
                        </Button>
                    </Space>
                );

            case 'CONFIRMED':
                return (
                    <Space>
                        <Button
                            type="primary"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleCompleteAppointment(id)}
                        >
                            Hoàn thành
                        </Button>
                        <Button
                            danger
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={() => handleCancelAppointment(id)}
                        >
                            Hủy lịch
                        </Button>
                    </Space>
                );

            case 'COMPLETED':
            case 'CANCELLED':
                return (
                    <Button
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(id)}
                    >
                        Xem chi tiết
                    </Button>
                );

            default:
                return null;
        }
    };

    const columns = [
        {
            title: 'Khách hàng',
            dataIndex: 'userName',
            key: 'userDisplayName',
            render: (text) => (
                <Space>
                    <UserOutlined />
                    <Text strong>{text || 'N/A'}</Text>
                </Space>
            )
        },
        {
            title: 'Dịch vụ',
            dataIndex: 'serviceName',
            key: 'serviceName',
            render: (text) => <Text>{text || 'N/A'}</Text>
        },
        {
            title: 'Thời gian',
            key: 'time',
            render: (record) => (
                <Space direction="vertical" size={0}>
                    <Space>
                        <CalendarOutlined />
                        <Text>{dayjs(record.startTime).format('DD/MM/YYYY')}</Text>
                    </Space>
                    <Space>
                        <ClockCircleOutlined />
                        <Text>{dayjs(record.startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}</Text>
                    </Space>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status)
        },
        {
            title: 'Ghi chú',
            dataIndex: 'notesFromUser',
            key: 'notesFromUser',
            render: (notes) => (
                notes ? (
                    <Tooltip title={notes}>
                        <FileTextOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                ) : (
                    <Text type="secondary">-</Text>
                )
            )
        },
        {
            title: 'Hành động',
            key: 'actions',
            render: (record) => getActionButtons(record)
        }
    ];

    const handleTableChange = (pagination) => {
        setPagination(pagination);
    };

    const getTabStats = () => {

        return {
            SCHEDULED: appointments.filter(apt => apt.status === 'SCHEDULED').length,
            CONFIRMED: appointments.filter(apt => apt.status === 'CONFIRMED').length,
            COMPLETED: appointments.filter(apt => apt.status === 'COMPLETED').length,
            CANCELLED: appointments.filter(apt => apt.status === 'CANCELLED').length
        };
    };

    const stats = getTabStats();

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>

            <Card style={{ marginBottom: '24px' }}>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Space>
                            <Button
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate(`/service-management/${providerId}`)}
                            >
                                Quay lại
                            </Button>
                            <Divider type="vertical" />
                            <Title level={3} style={{ margin: 0 }}>
                                Quản lý Cuộc hẹn cho '{provider?.businessName || 'Provider'}'
                            </Title>
                        </Space>
                    </Col>
                </Row>
            </Card>


            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Chờ xác nhận"
                            value={stats.SCHEDULED}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã xác nhận"
                            value={stats.CONFIRMED}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã hoàn thành"
                            value={stats.COMPLETED}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã hủy"
                            value={stats.CANCELLED}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>


            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    style={{ marginBottom: '16px' }}
                >
                    <TabPane tab={`Chờ xác nhận (${stats.SCHEDULED})`} key="SCHEDULED" />
                    <TabPane tab={`Đã xác nhận (${stats.CONFIRMED})`} key="CONFIRMED" />
                    <TabPane tab={`Đã hoàn thành (${stats.COMPLETED})`} key="COMPLETED" />
                    <TabPane tab={`Đã hủy (${stats.CANCELLED})`} key="CANCELLED" />
                    <TabPane tab="Tất cả" key="ALL" />
                </Tabs>

                <Table
                    columns={columns}
                    dataSource={appointments}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} cuộc hẹn`
                    }}
                    onChange={handleTableChange}
                />
            </Card>


            <Modal
                title="Chi tiết Cuộc hẹn"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedAppointment && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Khách hàng">
                            {selectedAppointment.userDisplayName || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Dịch vụ">
                            {selectedAppointment.serviceName || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày">
                            {dayjs(selectedAppointment.startTime).format('DD/MM/YYYY')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian">
                            {dayjs(selectedAppointment.startTime).format('HH:mm')} - {dayjs(selectedAppointment.endTime).format('HH:mm')}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            {getStatusTag(selectedAppointment.status)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ghi chú từ khách hàng">
                            {selectedAppointment.notesFromUser || 'Không có ghi chú'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian tạo">
                            {dayjs(selectedAppointment.createdAt).format('DD/MM/YYYY HH:mm')}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default AppointmentManagementPage;
