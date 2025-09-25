import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Select,
    DatePicker,
    InputNumber,
    Input,
    Button,
    message,
    Row,
    Col,
    Typography,
    Space
} from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    UserOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { providerService } from '../services/providerService';
import { scheduleService } from '../services/scheduleService';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

const ScheduleModal = ({
    visible,
    onCancel,
    onSuccess,
    providerId
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);

    useEffect(() => {
        if (visible && providerId) {
            fetchServices();
            form.resetFields();
            setStartTime(null);
            setEndTime(null);
            setSelectedService(null);
        }
    }, [visible, providerId, form]);

    const fetchServices = async () => {
        try {

            const response = await providerService.getProviderServices(providerId);

            if (response.success) {
                setServices(response.data || []);
            } else {
                message.error(response.message || 'Không thể tải danh sách dịch vụ');
            }
        } catch (error) {

            message.error('Không thể tải danh sách dịch vụ');
        }
    };

    const handleServiceChange = (serviceId) => {
        const service = services.find(s => s.id === serviceId);
        setSelectedService(service);


        if (service && startTime) {
            const suggestedEndTime = startTime.add(service.durationMinutes, 'minute');
            setEndTime(suggestedEndTime);
            form.setFieldsValue({ endTime: suggestedEndTime });
        }
    };

    const handleStartTimeChange = (time) => {
        setStartTime(time);


        if (selectedService && time) {
            const suggestedEndTime = time.add(selectedService.durationMinutes, 'minute');
            setEndTime(suggestedEndTime);
            form.setFieldsValue({ endTime: suggestedEndTime });
        }
    };

    const handleEndTimeChange = (time) => {
        setEndTime(time);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const values = await form.validateFields();


            const scheduleData = {
                serviceId: values.serviceId,
                startTime: values.startTime.format('YYYY-MM-DDTHH:mm:ss'),
                endTime: values.endTime.format('YYYY-MM-DDTHH:mm:ss'),
                maxCapacity: values.maxCapacity,
                notes: values.notes || null
            };

            const response = await scheduleService.createSchedule(scheduleData);

            if (response.success) {
                message.success('Tạo lịch thành công!');
                onSuccess();
            } else {
                message.error(response.message || 'Tạo lịch thất bại');
            }

        } catch (error) {



            if (error.message) {
                if (error.message.includes('INVALID_TIME')) {
                    message.error('Thời gian bắt đầu và kết thúc không hợp lệ');
                } else if (error.message.includes('OVERLAPPING_SCHEDULE')) {
                    message.error('Khung giờ này bị trùng với lịch đã có');
                } else {
                    message.error(error.message);
                }
            } else {
                message.error('Có lỗi xảy ra khi tạo lịch');
            }
        } finally {
            setLoading(false);
        }
    };

    const disabledDate = (current) => {

        return current && current < dayjs().startOf('day');
    };

    const disabledStartTime = (current) => {
        if (!current) return false;

        const now = dayjs();
        const selectedDate = current.format('YYYY-MM-DD');
        const today = now.format('YYYY-MM-DD');


        if (selectedDate === today) {
            return current && current < now;
        }

        return false;
    };

    const disabledEndTime = (current) => {
        if (!current || !startTime) return false;


        return current && current <= startTime;
    };

    return (
        <Modal
            title={
                <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        <CalendarOutlined style={{ marginRight: 8 }} />
                        Tạo Lịch làm việc mới
                    </Title>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            width={600}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                    disabled={!form.isFieldsTouched(['serviceId', 'startTime', 'endTime', 'maxCapacity']) ||
                        !form.getFieldsValue(['serviceId', 'startTime', 'endTime', 'maxCapacity']).serviceId ||
                        !form.getFieldsValue(['serviceId', 'startTime', 'endTime', 'maxCapacity']).startTime ||
                        !form.getFieldsValue(['serviceId', 'startTime', 'endTime', 'maxCapacity']).endTime ||
                        !form.getFieldsValue(['serviceId', 'startTime', 'endTime', 'maxCapacity']).maxCapacity}
                >
                    Lưu Lịch
                </Button>
            ]}
        >
            <Form
                form={form}
                layout="vertical"
                style={{ marginTop: 16 }}
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label={
                                <Space>
                                    <UserOutlined />
                                    <span>Chọn dịch vụ áp dụng <Text type="danger">*</Text></span>
                                </Space>
                            }
                            name="serviceId"
                            rules={[
                                { required: true, message: 'Vui lòng chọn dịch vụ' }
                            ]}
                        >
                            <Select
                                placeholder="Chọn dịch vụ"
                                onChange={handleServiceChange}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {services.map(service => (
                                    <Option key={service.id} value={service.id}>
                                        {service.serviceName} - {service.durationMinutes} phút
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label={
                                <Space>
                                    <ClockCircleOutlined />
                                    <span>Thời gian bắt đầu <Text type="danger">*</Text></span>
                                </Space>
                            }
                            name="startTime"
                            rules={[
                                { required: true, message: 'Vui lòng chọn thời gian bắt đầu' }
                            ]}
                        >
                            <DatePicker
                                showTime
                                format="HH:mm DD/MM/YYYY"
                                placeholder="Chọn thời gian bắt đầu"
                                style={{ width: '100%' }}
                                disabledDate={disabledDate}
                                disabledTime={disabledStartTime}
                                onChange={handleStartTimeChange}
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label={
                                <Space>
                                    <ClockCircleOutlined />
                                    <span>Thời gian kết thúc <Text type="danger">*</Text></span>
                                </Space>
                            }
                            name="endTime"
                            rules={[
                                { required: true, message: 'Vui lòng chọn thời gian kết thúc' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const startTime = getFieldValue('startTime');
                                        if (!value || !startTime) {
                                            return Promise.resolve();
                                        }
                                        if (value <= startTime) {
                                            return Promise.reject(new Error('Thời gian kết thúc phải sau thời gian bắt đầu'));
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                showTime
                                format="HH:mm DD/MM/YYYY"
                                placeholder="Chọn thời gian kết thúc"
                                style={{ width: '100%' }}
                                disabledDate={disabledDate}
                                disabledTime={disabledEndTime}
                                onChange={handleEndTimeChange}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label={
                                <Space>
                                    <UserOutlined />
                                    <span>Số lượng khách tối đa <Text type="danger">*</Text></span>
                                </Space>
                            }
                            name="maxCapacity"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số lượng khách tối đa' },
                                { type: 'number', min: 1, message: 'Số lượng khách tối thiểu là 1' }
                            ]}
                            initialValue={1}
                        >
                            <InputNumber
                                min={1}
                                max={100}
                                style={{ width: '100%' }}
                                placeholder="Nhập số lượng khách tối đa"
                            />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            label={
                                <Space>
                                    <FileTextOutlined />
                                    <span>Ghi chú (tùy chọn)</span>
                                </Space>
                            }
                            name="notes"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Thêm ghi chú cho khung giờ này..."
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {selectedService && (
                    <div style={{
                        background: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: '6px',
                        padding: '12px',
                        marginTop: '16px'
                    }}>
                        <Text type="secondary">
                            <strong>Thông tin dịch vụ:</strong> {selectedService.serviceName} -
                            Thời lượng: {selectedService.durationMinutes} phút -
                            Giá: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedService.price)}
                        </Text>
                    </div>
                )}
            </Form>
        </Modal>
    );
};

export default ScheduleModal;
