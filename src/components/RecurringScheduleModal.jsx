import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Select,
    DatePicker,
    InputNumber,
    Input,
    Button,
    Space,
    Card,
    Typography,
    message,
    Row,
    Col,
    TimePicker,
    Divider
} from 'antd';
import {
    PlusOutlined,
    DeleteOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { providerService } from '../services/providerService';
import { scheduleService } from '../services/scheduleService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const RecurringScheduleModal = ({ visible, onCancel, onSuccess, providerId }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [services, setServices] = useState([]);
    const [shifts, setShifts] = useState([{ startTime: null, endTime: null }]);

    const dayOptions = [
        { value: 'MONDAY', label: 'Thứ 2' },
        { value: 'TUESDAY', label: 'Thứ 3' },
        { value: 'WEDNESDAY', label: 'Thứ 4' },
        { value: 'THURSDAY', label: 'Thứ 5' },
        { value: 'FRIDAY', label: 'Thứ 6' },
        { value: 'SATURDAY', label: 'Thứ 7' },
        { value: 'SUNDAY', label: 'Chủ nhật' }
    ];

    useEffect(() => {
        if (visible && providerId) {
            fetchServices();
        }
    }, [visible, providerId]);

    const fetchServices = async () => {
        try {
            const response = await providerService.getProviderServices(providerId);
            if (response.success) {
                setServices(response.data || []);
            } else {
                message.error('Không thể tải danh sách dịch vụ');
            }
        } catch (error) {

            message.error('Không thể tải danh sách dịch vụ');
        }
    };

    const handleAddShift = () => {
        setShifts([...shifts, { startTime: null, endTime: null }]);
    };

    const handleRemoveShift = (index) => {
        if (shifts.length > 1) {
            const newShifts = shifts.filter((_, i) => i !== index);
            setShifts(newShifts);
        }
    };

    const handleShiftTimeChange = (index, field, time) => {
        const newShifts = [...shifts];
        newShifts[index][field] = time;
        setShifts(newShifts);
    };

    const handleSubmit = async (values) => {
        try {
            setLoading(true);


            const validShifts = shifts.filter(shift => shift.startTime && shift.endTime);
            if (validShifts.length === 0) {
                message.error('Vui lòng thêm ít nhất một ca làm việc');
                return;
            }


            for (let i = 0; i < validShifts.length; i++) {
                const shift = validShifts[i];
                if (shift.startTime.isAfter(shift.endTime) || shift.startTime.isSame(shift.endTime)) {
                    message.error(`Ca ${i + 1}: Thời gian bắt đầu phải trước thời gian kết thúc`);
                    return;
                }
            }

            const requestData = {
                serviceId: values.serviceId,
                startDate: values.startDate.format('YYYY-MM-DD'),
                endDate: values.endDate.format('YYYY-MM-DD'),
                daysOfWeek: values.daysOfWeek,
                shifts: validShifts.map(shift => ({
                    startTime: shift.startTime.format('HH:mm'),
                    endTime: shift.endTime.format('HH:mm')
                })),
                maxCapacity: values.maxCapacity,
                notes: values.notes || null
            };

            const response = await scheduleService.createRecurringSchedule(requestData);
            if (response.success) {
                message.success(`Tạo thành công ${response.data.createdCount} lịch làm việc cố định!`);
                form.resetFields();
                setShifts([{ startTime: null, endTime: null }]);
                onSuccess();
            } else {
                message.error(response.message || 'Không thể tạo lịch làm việc cố định');
            }
        } catch (error) {

            message.error('Không thể tạo lịch làm việc cố định');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setShifts([{ startTime: null, endTime: null }]);
        onCancel();
    };

    return (
        <Modal
            title="Tạo Lịch Làm Việc Cố Định"
            open={visible}
            onCancel={handleCancel}
            width={800}
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    maxCapacity: 1
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="serviceId"
                            label="Dịch vụ"
                            rules={[{ required: true, message: 'Vui lòng chọn dịch vụ' }]}
                        >
                            <Select placeholder="Chọn dịch vụ">
                                {services.map(service => (
                                    <Option key={service.id} value={service.id}>
                                        {service.serviceName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="maxCapacity"
                            label="Số lượng khách tối đa"
                            rules={[
                                { required: true, message: 'Vui lòng nhập số lượng khách' },
                                { type: 'number', min: 1, message: 'Số lượng khách phải >= 1' }
                            ]}
                        >
                            <InputNumber
                                min={1}
                                style={{ width: '100%' }}
                                placeholder="Nhập số lượng khách"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="startDate"
                            label="Ngày bắt đầu"
                            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder="Chọn ngày bắt đầu"
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="endDate"
                            label="Ngày kết thúc"
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày kết thúc' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || !getFieldValue('startDate')) {
                                            return Promise.resolve();
                                        }
                                        if (value.isBefore(getFieldValue('startDate'))) {
                                            return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                style={{ width: '100%' }}
                                placeholder="Chọn ngày kết thúc"
                                disabledDate={(current) => {
                                    const startDate = form.getFieldValue('startDate');
                                    return current && startDate && current < startDate;
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="daysOfWeek"
                    label="Ngày trong tuần"
                    rules={[{ required: true, message: 'Vui lòng chọn ít nhất một ngày' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Chọn các ngày trong tuần"
                        style={{ width: '100%' }}
                    >
                        {dayOptions.map(day => (
                            <Option key={day.value} value={day.value}>
                                {day.label}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Divider orientation="left">
                    <Space>
                        <ClockCircleOutlined />
                        <span>Ca làm việc</span>
                    </Space>
                </Divider>

                {shifts.map((shift, index) => (
                    <Card
                        key={index}
                        size="small"
                        style={{ marginBottom: '16px' }}
                        title={`Ca ${index + 1}`}
                        extra={
                            shifts.length > 1 && (
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleRemoveShift(index)}
                                />
                            )
                        }
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text strong>Thời gian bắt đầu</Text>
                                <TimePicker
                                    value={shift.startTime}
                                    onChange={(time) => handleShiftTimeChange(index, 'startTime', time)}
                                    format="HH:mm"
                                    style={{ width: '100%', marginTop: '8px' }}
                                    placeholder="Chọn giờ bắt đầu"
                                />
                            </Col>
                            <Col span={12}>
                                <Text strong>Thời gian kết thúc</Text>
                                <TimePicker
                                    value={shift.endTime}
                                    onChange={(time) => handleShiftTimeChange(index, 'endTime', time)}
                                    format="HH:mm"
                                    style={{ width: '100%', marginTop: '8px' }}
                                    placeholder="Chọn giờ kết thúc"
                                />
                            </Col>
                        </Row>
                    </Card>
                ))}

                <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleAddShift}
                    style={{ width: '100%', marginBottom: '16px' }}
                >
                    Thêm ca làm việc
                </Button>

                <Form.Item
                    name="notes"
                    label="Ghi chú (tùy chọn)"
                >
                    <TextArea
                        rows={3}
                        placeholder="Nhập ghi chú cho lịch làm việc..."
                    />
                </Form.Item>

                <div style={{ textAlign: 'right', marginTop: '24px' }}>
                    <Space>
                        <Button onClick={handleCancel}>
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            Tạo Lịch Cố Định
                        </Button>
                    </Space>
                </div>
            </Form>
        </Modal>
    );
};

export default RecurringScheduleModal;
