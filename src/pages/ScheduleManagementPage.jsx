import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Button,
    Typography,
    Space,
    message,
    Row,
    Col,
    Spin,
    Tag,
    Popconfirm,
    Tooltip,
    Tabs,
    Table,
    Input,
    DatePicker,
    Select
} from 'antd';
import {
    CalendarOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    ClockCircleOutlined,
    UserOutlined,
    ShopOutlined,
    SearchOutlined,
    FilterOutlined,
    UnorderedListOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import { providerService } from '../services/providerService';
import { scheduleService } from '../services/scheduleService';
import ScheduleModal from '../components/ScheduleModal';
import { getImageUrl } from '../utils/imageUtils';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ScheduleManagementPage = () => {
    const { providerId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [schedules, setSchedules] = useState([]);
    const [provider, setProvider] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [activeView, setActiveView] = useState('list');
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState(null);

    useEffect(() => {
        if (providerId) {
            fetchProviderInfo();
            fetchSchedules();
        }
    }, [providerId]);

    const fetchProviderInfo = async () => {
        try {
            const response = await providerService.getProviderById(providerId);
            if (response.success) {
                setProvider(response.data);
            }
        } catch (error) {
            message.error('Không thể tải thông tin nhà cung cấp');
        }
    };

    const fetchSchedules = async () => {
        setLoading(true);
        try {
            const startDate = currentDate.startOf('month').format('YYYY-MM-DD');
            const endDate = currentDate.endOf('month').format('YYYY-MM-DD');

            const response = await scheduleService.getProviderSchedules();
            if (response.success) {
                setSchedules(response.data || []);
            } else {
                message.error(response.message || 'Không thể tải danh sách lịch làm việc');
            }
        } catch (error) {
            message.error('Không thể tải danh sách lịch làm việc');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (scheduleId) => {
        try {
            const response = await scheduleService.deleteSchedule(scheduleId);
            if (response.success) {
                message.success('Xóa lịch làm việc thành công');
                fetchSchedules();
            } else {
                message.error(response.message || 'Xóa lịch làm việc thất bại');
            }
        } catch (error) {
            message.error('Xóa lịch làm việc thất bại');
        }
    };

    const formatTime = (timeString) => {
        return dayjs(timeString).format('HH:mm');
    };

    const formatDate = (dateString) => {
        return dayjs(dateString).format('DD/MM/YYYY');
    };

    const getScheduleStatus = (schedule) => {
        const now = dayjs();
        const startTime = dayjs(schedule.startTime);
        const endTime = dayjs(schedule.endTime);

        if (now.isBefore(startTime)) {
            return { status: 'upcoming', color: 'blue', text: 'Sắp tới' };
        } else if (now.isAfter(endTime)) {
            return { status: 'completed', color: 'green', text: 'Đã hoàn thành' };
        } else {
            return { status: 'ongoing', color: 'orange', text: 'Đang diễn ra' };
        }
    };


    const getFilteredSchedules = () => {
        let filtered = [...schedules];


        if (searchText) {
            filtered = filtered.filter(schedule =>
                schedule.serviceName?.toLowerCase().includes(searchText.toLowerCase()) ||
                schedule.notes?.toLowerCase().includes(searchText.toLowerCase())
            );
        }


        if (statusFilter !== 'all') {
            filtered = filtered.filter(schedule => {
                const status = getScheduleStatus(schedule);
                return status.status === statusFilter;
            });
        }


        if (dateFilter) {
            const filterDate = dayjs(dateFilter).format('YYYY-MM-DD');
            filtered = filtered.filter(schedule =>
                dayjs(schedule.startTime).format('YYYY-MM-DD') === filterDate
            );
        }

        return filtered;
    };


    const renderScheduleCard = (schedule) => {
        const status = getScheduleStatus(schedule);

        return (
            <Card
                key={schedule.id}
                size="small"
                style={{
                    marginBottom: 8,
                    border: `1px solid ${status.color === 'blue' ? '#1890ff' : status.color === 'orange' ? '#fa8c16' : '#52c41a'}`
                }}
                actions={[
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                setEditingSchedule(schedule);
                                setModalVisible(true);
                            }}
                        />
                    </Tooltip>,
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc chắn muốn xóa lịch làm việc này?"
                        onConfirm={() => handleDelete(schedule.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                ]}
            >
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text strong style={{ fontSize: '14px' }}>{schedule.serviceName}</Text>
                        <Tag color={status.color}>{status.text}</Tag>
                    </div>

                    <div style={{ marginBottom: 4 }}>
                        <ClockCircleOutlined style={{ marginRight: 4, color: '#666' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </Text>
                    </div>

                    <div style={{ marginBottom: 4 }}>
                        <UserOutlined style={{ marginRight: 4, color: '#666' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Tối đa {schedule.maxCapacity} khách
                        </Text>
                    </div>

                    {schedule.notes && (
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {schedule.notes}
                            </Text>
                        </div>
                    )}
                </div>
            </Card>
        );
    };



    const renderWeekView = () => {

        const startOfWeek = currentDate.startOf('week').add(1, 'day');
        const endOfWeek = startOfWeek.add(6, 'day');


        const weekSchedules = schedules.filter(schedule => {
            const scheduleDate = dayjs(schedule.startTime);
            return scheduleDate.isAfter(startOfWeek.subtract(1, 'day')) &&
                scheduleDate.isBefore(endOfWeek.add(1, 'day'));
        });

        const days = [];
        const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

        for (let i = 0; i < 7; i++) {
            const day = startOfWeek.add(i, 'day');
            const daySchedules = weekSchedules.filter(schedule =>
                dayjs(schedule.startTime).format('YYYY-MM-DD') === day.format('YYYY-MM-DD')
            );
            const isToday = day.isSame(dayjs(), 'day');

            days.push(
                <div key={i} style={{
                    minHeight: '400px',
                    border: '1px solid #f0f0f0',
                    padding: '12px',
                    backgroundColor: isToday ? '#e6f7ff' : '#fff'
                }}>
                    <div style={{
                        fontWeight: 'bold',
                        marginBottom: '12px',
                        color: isToday ? '#1890ff' : '#000',
                        fontSize: '16px',
                        textAlign: 'center',
                        padding: '8px',
                        backgroundColor: isToday ? '#1890ff' : '#fafafa',
                        color: isToday ? '#fff' : '#000',
                        borderRadius: '4px'
                    }}>
                        {dayNames[i]} - {day.format('DD/MM')}
                    </div>

                    <div style={{ maxHeight: '350px', overflow: 'auto' }}>
                        {daySchedules.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                color: '#999',
                                padding: '20px',
                                fontSize: '14px'
                            }}>
                                Không có lịch
                            </div>
                        ) : (
                            daySchedules.map(schedule => renderScheduleCard(schedule))
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px' }}>
                {days}
            </div>
        );
    };


    const renderListView = () => {
        const filteredSchedules = getFilteredSchedules();

        const columns = [
            {
                title: 'Dịch vụ',
                dataIndex: 'serviceName',
                key: 'serviceName',
                width: 200,
                render: (text, record) => (
                    <div>
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{text}</div>
                        {record.notes && (
                            <div style={{ fontSize: '12px', color: '#666' }}>{record.notes}</div>
                        )}
                    </div>
                )
            },
            {
                title: 'Ngày',
                dataIndex: 'startTime',
                key: 'startTime',
                width: 120,
                render: (text) => formatDate(text)
            },
            {
                title: 'Thời gian',
                dataIndex: 'startTime',
                key: 'time',
                width: 150,
                render: (text, record) => (
                    <div>
                        <ClockCircleOutlined style={{ marginRight: 4, color: '#666' }} />
                        {formatTime(text)} - {formatTime(record.endTime)}
                    </div>
                )
            },
            {
                title: 'Số khách',
                dataIndex: 'maxCapacity',
                key: 'maxCapacity',
                width: 100,
                render: (text, record) => (
                    <div>
                        <UserOutlined style={{ marginRight: 4, color: '#666' }} />
                        {record.currentBookings || 0}/{text}
                    </div>
                )
            },
            {
                title: 'Trạng thái',
                dataIndex: 'status',
                key: 'status',
                width: 120,
                render: (text, record) => {
                    const status = getScheduleStatus(record);
                    return <Tag color={status.color}>{status.text}</Tag>;
                }
            },
            {
                title: 'Thao tác',
                key: 'actions',
                width: 120,
                render: (text, record) => (
                    <Space>
                        <Tooltip title="Chỉnh sửa">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                size="small"
                                onClick={() => {
                                    setEditingSchedule(record);
                                    setModalVisible(true);
                                }}
                            />
                        </Tooltip>
                        <Popconfirm
                            title="Xác nhận xóa"
                            description="Bạn có chắc chắn muốn xóa lịch làm việc này?"
                            onConfirm={() => handleDelete(record.id)}
                            okText="Xóa"
                            cancelText="Hủy"
                            okType="danger"
                        >
                            <Tooltip title="Xóa">
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    size="small"
                                />
                            </Tooltip>
                        </Popconfirm>
                    </Space>
                )
            }
        ];

        return (
            <Table
                columns={columns}
                dataSource={filteredSchedules}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} của ${total} lịch làm việc`
                }}
                scroll={{ x: 800 }}
            />
        );
    };

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
                        <CalendarOutlined style={{ marginRight: 8 }} />
                        Quản lý Lịch làm việc - "{provider?.businessName || 'Loading...'}"
                    </Title>
                </div>
                <Text type="secondary" style={{ fontSize: '16px' }}>
                    Quản lý lịch làm việc và khung giờ phục vụ
                </Text>
            </div>


            <Card style={{ marginBottom: '24px' }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
                    <Col>
                        <Space>
                            {activeView === 'week' && (
                                <>
                                    <Button
                                        onClick={() => {
                                            setCurrentDate(currentDate.subtract(1, 'week'));
                                            fetchSchedules();
                                        }}
                                    >
                                        Tuần trước
                                    </Button>
                                    <Title level={4} style={{ margin: 0 }}>
                                        {`${currentDate.startOf('week').add(1, 'day').format('DD/MM')} - ${currentDate.startOf('week').add(7, 'day').format('DD/MM/YYYY')}`}
                                    </Title>
                                    <Button
                                        onClick={() => {
                                            setCurrentDate(currentDate.add(1, 'week'));
                                            fetchSchedules();
                                        }}
                                    >
                                        Tuần sau
                                    </Button>
                                </>
                            )}
                        </Space>
                    </Col>
                    <Col>
                        <Space>
                            <Button.Group>
                                <Button
                                    type={activeView === 'list' ? 'primary' : 'default'}
                                    icon={<UnorderedListOutlined />}
                                    onClick={() => setActiveView('list')}
                                >
                                    Danh sách
                                </Button>
                                <Button
                                    type={activeView === 'week' ? 'primary' : 'default'}
                                    icon={<CalendarOutlined />}
                                    onClick={() => setActiveView('week')}
                                >
                                    Tuần
                                </Button>
                            </Button.Group>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                size="large"
                                onClick={() => {
                                    setEditingSchedule(null);
                                    setModalVisible(true);
                                }}
                            >
                                + Tạo Lịch làm việc mới
                            </Button>
                        </Space>
                    </Col>
                </Row>


                {activeView === 'list' && (
                    <Row gutter={16} align="middle">
                        <Col flex="auto">
                            <Input
                                placeholder="Tìm kiếm theo tên dịch vụ hoặc ghi chú..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{ maxWidth: 400 }}
                            />
                        </Col>
                        <Col>
                            <Select
                                placeholder="Trạng thái"
                                value={statusFilter}
                                onChange={setStatusFilter}
                                style={{ width: 150 }}
                            >
                                <Select.Option value="all">Tất cả</Select.Option>
                                <Select.Option value="upcoming">Sắp tới</Select.Option>
                                <Select.Option value="ongoing">Đang diễn ra</Select.Option>
                                <Select.Option value="completed">Đã hoàn thành</Select.Option>
                            </Select>
                        </Col>
                        <Col>
                            <DatePicker
                                placeholder="Chọn ngày"
                                value={dateFilter}
                                onChange={setDateFilter}
                                style={{ width: 150 }}
                            />
                        </Col>
                        <Col>
                            <Button
                                icon={<FilterOutlined />}
                                onClick={() => {
                                    setSearchText('');
                                    setStatusFilter('all');
                                    setDateFilter(null);
                                }}
                            >
                                Xóa bộ lọc
                            </Button>
                        </Col>
                    </Row>
                )}
            </Card>


            <Card>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    activeView === 'list' ? renderListView() : renderWeekView()
                )}
            </Card>


            <ScheduleModal
                visible={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingSchedule(null);
                }}
                onSuccess={() => {
                    fetchSchedules();
                    setModalVisible(false);
                    setEditingSchedule(null);
                }}
                providerId={providerId}
            />
        </div>
    );
};

export default ScheduleManagementPage;
