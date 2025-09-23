import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const handleLogin = async (values) => {
        setLoading(true);
        try {

            const response = await authService.login(values.email, values.password);


            if (response.success) {
                message.success(response.message || 'Đăng nhập thành công!');

                await authService.getCurrentUser();
                navigate('/');
            } else {
                message.error(response.message || 'Đăng nhập thất bại!');
            }
        } catch (error) {





            let errorMessage = 'Đăng nhập thất bại!';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

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
                    maxWidth: 500,
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
                            Đăng nhập
                        </div>
                    </div>
                }
                extra={
                    <Button
                        type="link"
                        onClick={() => navigate('/register')}
                        style={{ color: '#1e3a8a', fontWeight: '500' }}
                    >
                        Chưa có tài khoản? Đăng ký
                    </Button>
                }
            >
                <Form
                    name="login"
                    onFinish={handleLogin}
                    layout="vertical"
                    size="large"
                >
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

                    <Form.Item>
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
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
