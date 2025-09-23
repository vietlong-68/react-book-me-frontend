import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Row, Col, Select, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import dayjs from 'dayjs';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleRegister = async (values) => {
        setLoading(true);
        try {

            const formData = {
                ...values,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : undefined
            };

            const response = await authService.register(formData);

            if (response.success) {
                message.success(response.message || 'Đăng ký thành công! Vui lòng đăng nhập.');
                navigate('/login');
            } else {
                message.error(response.message || 'Đăng ký thất bại!');
            }
        } catch (error) {


            const errorMessage = error.message || error.response?.data?.message || 'Đăng ký thất bại!';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
            padding: '20px'
        }}>
            <Card
                style={{
                    width: '100%',
                    maxWidth: 700,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
                title={
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: '#1e3a8a',
                            marginBottom: '8px'
                        }}>
                            Book Me
                        </div>
                        <div style={{
                            fontSize: '18px',
                            color: '#64748b',
                            fontWeight: '500'
                        }}>
                            Đăng ký tài khoản
                        </div>
                    </div>
                }
                extra={
                    <Button
                        type="link"
                        onClick={() => navigate('/login')}
                        style={{ color: '#1e3a8a', fontWeight: '500' }}
                    >
                        Đã có tài khoản? Đăng nhập
                    </Button>
                }
            >
                <Form
                    name="register"
                    onFinish={handleRegister}
                    layout="vertical"
                    size="middle"
                >

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="displayName"
                                label="Họ và tên"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập họ và tên!' },
                                    { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Nhập họ và tên"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' }
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="Nhập email của bạn"
                                />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                                rules={[
                                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                                ]}
                            >
                                <Input
                                    prefix={<PhoneOutlined />}
                                    placeholder="Nhập số điện thoại (không bắt buộc)"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dateOfBirth"
                                label="Ngày sinh"
                            >
                                <DatePicker
                                    style={{ width: '100%' }}
                                    placeholder="Chọn ngày sinh (không bắt buộc)"
                                    format="YYYY-MM-DD"
                                    allowClear
                                    disabledDate={(current) => {

                                        return current && current > dayjs().endOf('day');
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="gender"
                                label="Giới tính"
                            >
                                <Select
                                    placeholder="Chọn giới tính (không bắt buộc)"
                                    allowClear
                                    options={[
                                        { value: 'MALE', label: 'Nam' },
                                        { value: 'FEMALE', label: 'Nữ' },
                                        { value: 'OTHER', label: 'Khác' }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                            >
                                <Input
                                    prefix={<EnvironmentOutlined />}
                                    placeholder="Nhập địa chỉ (không bắt buộc)"
                                />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập mật khẩu"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="confirmPassword"
                                label="Xác nhận mật khẩu"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập lại mật khẩu"
                                />
                            </Form.Item>
                        </Col>
                    </Row>


                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    size="large"
                                    style={{
                                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                        border: 'none',
                                        height: '48px',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}
                                >
                                    Đăng ký tài khoản
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default Register;
