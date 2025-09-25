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
    Table,
    Input,
    Select,
    DatePicker,
    Modal,
    Descriptions,
    Divider
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    ShopOutlined,
    EyeOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { appointmentService } from '../services/appointmentService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const AppointmentsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [appointments, searchText, statusFilter]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const response = await appointmentService.getAllAppointments();
            if (response.success) {
                setAppointments(response.data || []);
            } else {
                message.error('Không thể tải danh sách lịch hẹn');
            }
        } catch (error) {

            message.error('Không thể tải danh sách lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        let filtered = [...appointments];


        if (searchText) {
            filtered = filtered.filter(appointment =>
                appointment.serviceName?.toLowerCase().includes(searchText.toLowerCase()) ||
                appointment.providerName?.toLowerCase().includes(searchText.toLowerCase())
            );
        }


        if (statusFilter !== 'all') {
            filtered = filtered.filter(appointment => appointment.status === statusFilter);
        }

        setFilteredAppointments(filtered);
    };

    const formatDateTime = (dateTimeString) => {
        return dayjs(dateTimeString).format('HH:mm DD/MM/YYYY');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return 'blue';
            case 'CONFIRMED':
                return 'green';
            case 'COMPLETED':
                return 'purple';
            case 'CANCELLED':
                return 'red';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return 'Đã đặt';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const handleViewDetail = async (appointmentId) => {
        try {
            const response = await appointmentService.getAppointmentById(appointmentId);
            if (response.success) {
                setSelectedAppointment(response.data);
                setDetailModalVisible(true);
            } else {
                message.error('Không thể tải chi tiết lịch hẹn');
            }
        } catch (error) {

            message.error('Không thể tải chi tiết lịch hẹn');
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        try {
            const response = await appointmentService.cancelAppointment(appointmentId);
            if (response.success) {
                message.success('Hủy lịch hẹn thành công');
                setDetailModalVisible(false);
                fetchAppointments();
            } else {
                message.error(response.message || 'Không thể hủy lịch hẹn');
            }
        } catch (error) {

            message.error('Không thể hủy lịch hẹn');
        }
    };

    const handleServiceClick = (serviceId) => {
        navigate(`/services/${serviceId}`);
    };

    const columns = [
        {
            title: 'Dịch vụ',
            dataIndex: 'serviceName',
            key: 'serviceName',
            render: (text, record) => (
                <Text
                    strong
                    style={{
                        color: '#1890ff',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                    }}
                    onClick={() => handleServiceClick(record.serviceId)}
                >
                    {text || 'N/A'}
                </Text>
            )
        },
        {
            title: 'Nhà cung cấp',
            dataIndex: 'providerName',
            key: 'providerName',
            render: (text) => (
                <Space>
                    <ShopOutlined style={{ color: '#666' }} />
                    <Text>{text || 'N/A'}</Text>
                </Space>
            )
        },
        {
            title: 'Thời gian',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (text) => (
                <Space>
                    <ClockCircleOutlined style={{ color: '#666' }} />
                    <Text>{formatDateTime(text)}</Text>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record.id)}
                    >
                        Xem chi tiết
                    </Button>
                </Space>
            )
        }
    ];

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

            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ marginBottom: '8px' }}>
                    <CalendarOutlined style={{ marginRight: '12px' }} />
                    Lịch hẹn của tôi
                </Title>
                <Paragraph type="secondary" style={{ fontSize: '16px' }}>
                    Quản lý và theo dõi tất cả lịch hẹn của bạn
                </Paragraph>
            </div>


            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <Search
                            placeholder="Tìm kiếm theo dịch vụ hoặc nhà cung cấp..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            style={{ width: '100%' }}
                            placeholder="Lọc theo trạng thái"
                        >
                            <Option value="all">Tất cả trạng thái</Option>
                            <Option value="SCHEDULED">Đã đặt</Option>
                            <Option value="CONFIRMED">Đã xác nhận</Option>
                            <Option value="COMPLETED">Hoàn thành</Option>
                            <Option value="CANCELLED">Đã hủy</Option>
                        </Select>
                    </Col>
                    <Col xs={24} sm={12} md={4}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchAppointments}
                            style={{ width: '100%' }}
                        >
                            Làm mới
                        </Button>
                    </Col>
                </Row>
            </Card>


            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredAppointments}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} lịch hẹn`
                    }}
                    locale={{
                        emptyText: 'Bạn chưa có lịch hẹn nào'
                    }}
                />
            </Card>


            <Modal
                title="Chi tiết lịch hẹn"
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                    selectedAppointment && (selectedAppointment.status === 'SCHEDULED' || selectedAppointment.status === 'CONFIRMED') && (
                        <Button
                            key="cancel"
                            danger
                            onClick={() => handleCancelAppointment(selectedAppointment.id)}
                        >
                            Hủy lịch hẹn
                        </Button>
                    )
                ]}
                width={600}
            >
                {selectedAppointment && (
                    <Descriptions column={1} bordered>
                        <Descriptions.Item label="Dịch vụ">
                            <Text
                                strong
                                style={{
                                    color: '#1890ff',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                                onClick={() => handleServiceClick(selectedAppointment.serviceId)}
                            >
                                {selectedAppointment.serviceName || 'N/A'}
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Nhà cung cấp">
                            {selectedAppointment.providerName || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian bắt đầu">
                            {formatDateTime(selectedAppointment.startTime)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Thời gian kết thúc">
                            {formatDateTime(selectedAppointment.endTime)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color={getStatusColor(selectedAppointment.status)}>
                                {getStatusText(selectedAppointment.status)}
                            </Tag>
                        </Descriptions.Item>
                        {selectedAppointment.notesFromUser && (
                            <Descriptions.Item label="Ghi chú của bạn">
                                {selectedAppointment.notesFromUser}
                            </Descriptions.Item>
                        )}
                        {selectedAppointment.notesFromProvider && (
                            <Descriptions.Item label="Ghi chú từ nhà cung cấp">
                                {selectedAppointment.notesFromProvider}
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="Ngày tạo">
                            {formatDateTime(selectedAppointment.createdAt)}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default AppointmentsPage;
