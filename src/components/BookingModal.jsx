import React, { useState, useEffect } from 'react';
import {
    Modal,
    Steps,
    Card,
    Button,
    List,
    Typography,
    Space,
    Tag,
    Spin,
    message,
    Input,
    Row,
    Col,
    Divider,
    Result
} from 'antd';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import { scheduleService } from '../services/scheduleService';
import { appointmentService } from '../services/appointmentService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const BookingModal = ({ visible, service, onCancel, onSuccess }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [notes, setNotes] = useState('');
    const [bookingResult, setBookingResult] = useState(null);

    useEffect(() => {
        if (visible && service) {
            setCurrentStep(0);
            setSelectedSchedule(null);
            setNotes('');
            setBookingResult(null);
            fetchAvailableSchedules();
        }
    }, [visible, service]);

    const fetchAvailableSchedules = async () => {
        setLoading(true);
        try {
            const response = await scheduleService.getAvailableSchedules(service.id);
            if (response.success) {
                setAvailableSchedules(response.data || []);
            } else {
                message.error('Không thể tải danh sách lịch trống');
            }
        } catch (error) {

            message.error('Không thể tải danh sách lịch trống');
        } finally {
            setLoading(false);
        }
    };

    const groupSchedulesByDate = (schedules) => {
        const grouped = {};
        schedules.forEach(schedule => {
            const date = dayjs(schedule.startTime).format('DD/MM/YYYY');
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(schedule);
        });
        return grouped;
    };

    const formatTime = (startTime, endTime) => {
        const start = dayjs(startTime).format('HH:mm');
        const end = dayjs(endTime).format('HH:mm');
        return `${start} - ${end}`;
    };

    const getAvailableSlots = (schedule) => {
        return schedule.maxCapacity - (schedule.currentBookings || 0);
    };

    const handleScheduleSelect = (schedule) => {
        setSelectedSchedule(schedule);
        setCurrentStep(1);
    };

    const handleBookingConfirm = async () => {
        if (!selectedSchedule) return;

        setLoading(true);
        try {
            const response = await appointmentService.createAppointment({
                scheduleId: selectedSchedule.id,
                notesFromUser: notes
            });

            if (response.success) {
                setBookingResult({
                    success: true,
                    appointment: response.data
                });
                setCurrentStep(2);
            } else {

                if (response.message === 'SCHEDULE_NOT_AVAILABLE') {
                    message.error('Khung giờ này không còn trống. Vui lòng chọn khung giờ khác.');
                    setCurrentStep(0);
                    fetchAvailableSchedules();
                } else {
                    message.error(response.message || 'Có lỗi xảy ra khi đặt lịch');
                }
            }
        } catch (error) {

            if (error.message === 'SCHEDULE_NOT_AVAILABLE') {
                message.error('Khung giờ này không còn trống. Vui lòng chọn khung giờ khác.');
                setCurrentStep(0);
                fetchAvailableSchedules();
            } else {
                message.error('Có lỗi xảy ra khi đặt lịch');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentStep(0);
        setSelectedSchedule(null);
        setNotes('');
        setBookingResult(null);
        onCancel();
    };

    const handleViewAppointments = () => {
        onSuccess();

        window.location.href = '/appointments';
    };

    const renderStep1 = () => {
        const groupedSchedules = groupSchedulesByDate(availableSchedules);
        const dates = Object.keys(groupedSchedules).sort();

        if (loading) {
            return (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '16px' }}>Đang tải danh sách lịch trống...</div>
                </div>
            );
        }

        if (availableSchedules.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <CalendarOutlined style={{ fontSize: '48px', color: '#999', marginBottom: '16px' }} />
                    <div style={{ color: '#999' }}>
                        Rất tiếc, hiện không có lịch trống cho dịch vụ này.
                    </div>
                </div>
            );
        }

        return (
            <div>
                <Title level={4} style={{ marginBottom: '16px' }}>
                    Chọn một khung giờ trống
                </Title>
                {dates.map(date => (
                    <div key={date} style={{ marginBottom: '24px' }}>
                        <Title level={5} style={{ marginBottom: '12px', color: '#1890ff' }}>
                            {date}
                        </Title>
                        <List
                            dataSource={groupedSchedules[date]}
                            renderItem={(schedule) => {
                                const availableSlots = getAvailableSlots(schedule);
                                const isAvailable = availableSlots > 0;

                                return (
                                    <List.Item>
                                        <Card
                                            size="small"
                                            style={{
                                                width: '100%',
                                                border: isAvailable ? '1px solid #d9d9d9' : '1px solid #ffccc7',
                                                backgroundColor: isAvailable ? '#fff' : '#fff2f0'
                                            }}
                                        >
                                            <Row align="middle" justify="space-between">
                                                <Col flex="auto">
                                                    <Space direction="vertical" size="small">
                                                        <div>
                                                            <ClockCircleOutlined style={{ marginRight: '8px', color: '#666' }} />
                                                            <Text strong>{formatTime(schedule.startTime, schedule.endTime)}</Text>
                                                        </div>
                                                        <div>
                                                            <UserOutlined style={{ marginRight: '8px', color: '#666' }} />
                                                            <Text type="secondary">
                                                                {isAvailable
                                                                    ? `Còn lại: ${availableSlots} chỗ`
                                                                    : 'Hết chỗ'
                                                                }
                                                            </Text>
                                                        </div>
                                                    </Space>
                                                </Col>
                                                <Col>
                                                    <Button
                                                        type={isAvailable ? 'primary' : 'default'}
                                                        disabled={!isAvailable}
                                                        onClick={() => handleScheduleSelect(schedule)}
                                                    >
                                                        {isAvailable ? 'Chọn' : 'Hết chỗ'}
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Card>
                                    </List.Item>
                                );
                            }}
                        />
                    </div>
                ))}
            </div>
        );
    };

    const renderStep2 = () => {
        if (!selectedSchedule) return null;

        return (
            <div>
                <Title level={4} style={{ marginBottom: '16px' }}>
                    Xem lại và Xác nhận
                </Title>

                <Card style={{ marginBottom: '24px', backgroundColor: '#f9f9f9' }}>
                    <Title level={5} style={{ marginBottom: '12px' }}>Thông tin lịch hẹn</Title>
                    <Row gutter={[16, 8]}>
                        <Col span={24}>
                            <Text strong>Dịch vụ: </Text>
                            <Text>{service.serviceName}</Text>
                        </Col>
                        <Col span={24}>
                            <Text strong>Thời gian: </Text>
                            <Text>{dayjs(selectedSchedule.startTime).format('DD/MM/YYYY HH:mm')} - {dayjs(selectedSchedule.endTime).format('HH:mm')}</Text>
                        </Col>
                        <Col span={24}>
                            <Text strong>Giá: </Text>
                            <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND'
                                }).format(service.price)}
                            </Text>
                        </Col>
                    </Row>
                </Card>

                <div style={{ marginBottom: '24px' }}>
                    <Text strong>Ghi chú cho nhà cung cấp (tùy chọn)</Text>
                    <TextArea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Nhập ghi chú nếu có..."
                        rows={4}
                        style={{ marginTop: '8px' }}
                    />
                </div>

                <div style={{ textAlign: 'center' }}>
                    <Button
                        type="primary"
                        size="large"
                        loading={loading}
                        onClick={handleBookingConfirm}
                        style={{ minWidth: '200px' }}
                    >
                        Xác nhận đặt lịch
                    </Button>
                </div>
            </div>
        );
    };

    const renderStep3 = () => {
        if (!bookingResult) return null;

        return (
            <Result
                status="success"
                title="Đặt lịch thành công!"
                subTitle="Lịch hẹn của bạn đang chờ nhà cung cấp xác nhận."
                extra={[
                    <Button type="primary" key="view" onClick={handleViewAppointments}>
                        Xem Lịch hẹn của tôi
                    </Button>,
                    <Button key="close" onClick={handleClose}>
                        Đóng
                    </Button>
                ]}
            >
                <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                    <Card size="small" style={{ backgroundColor: '#f6ffed' }}>
                        <Space direction="vertical" size="small">
                            <div>
                                <Text strong>Dịch vụ: </Text>
                                <Text>{service.serviceName}</Text>
                            </div>
                            <div>
                                <Text strong>Thời gian: </Text>
                                <Text>{dayjs(selectedSchedule.startTime).format('DD/MM/YYYY HH:mm')} - {dayjs(selectedSchedule.endTime).format('HH:mm')}</Text>
                            </div>
                            <div>
                                <Text strong>Trạng thái: </Text>
                                <Tag color="orange">Chờ xác nhận</Tag>
                            </div>
                        </Space>
                    </Card>
                </div>
            </Result>
        );
    };

    const steps = [
        {
            title: 'Chọn lịch',
            icon: <CalendarOutlined />
        },
        {
            title: 'Xác nhận',
            icon: <CheckCircleOutlined />
        },
        {
            title: 'Hoàn tất',
            icon: <CheckCircleOutlined />
        }
    ];

    return (
        <Modal
            title="Đặt lịch hẹn"
            open={visible}
            onCancel={handleClose}
            footer={null}
            width={600}
            destroyOnClose
        >
            <Steps current={currentStep} items={steps} style={{ marginBottom: '24px' }} />

            {currentStep === 0 && renderStep1()}
            {currentStep === 1 && renderStep2()}
            {currentStep === 2 && renderStep3()}
        </Modal>
    );
};

export default BookingModal;
