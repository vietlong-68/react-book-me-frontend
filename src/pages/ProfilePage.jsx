import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Avatar, Button, Form, Input, Select, DatePicker, message, Upload, Modal, Typography, Space, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, CameraOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { authService } from '../services/authService';
import dayjs from 'dayjs';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const ProfilePage = () => {
    const [selectedKey, setSelectedKey] = useState('profile');
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [avatarModalVisible, setAvatarModalVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const navigate = useNavigate();


    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await userService.getProfile();
            if (response.success) {
                setUserProfile(response.data);
                form.setFieldsValue({
                    displayName: response.data.displayName,
                    phoneNumber: response.data.phoneNumber,
                    dateOfBirth: response.data.dateOfBirth ? dayjs(response.data.dateOfBirth) : null,
                    gender: response.data.gender,
                    address: response.data.address
                });
            } else {
                message.error(response.message || 'Không thể tải thông tin cá nhân!');
            }
        } catch (error) {

            const errorMessage = error.message || error.response?.data?.message || 'Không thể tải thông tin cá nhân!';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);


    const handleAvatarChange = (info) => {
        if (info.file) {
            setPreviewImage(info.file);
            setAvatarModalVisible(true);
        }
    };


    const handleSaveAvatar = async () => {
        if (!previewImage) return;

        setAvatarLoading(true);
        try {
            const response = await userService.updateAvatar(previewImage);
            if (response.success) {
                message.success('Cập nhật ảnh đại diện thành công!');
                setUserProfile(prev => ({
                    ...prev,
                    avatarUrl: response.data.avatarUrl
                }));

                localStorage.setItem('user', JSON.stringify(response.data));
                setAvatarModalVisible(false);
                setPreviewImage(null);
            } else {
                message.error(response.message || 'Cập nhật ảnh đại diện thất bại!');
            }
        } catch (error) {

            const errorMessage = error.message || error.response?.data?.message || 'Cập nhật ảnh đại diện thất bại!';
            message.error(errorMessage);
        } finally {
            setAvatarLoading(false);
        }
    };



    const handleSaveProfile = async (values) => {
        setProfileLoading(true);
        try {
            const updateData = {
                displayName: values.displayName,
                phoneNumber: values.phoneNumber,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
                gender: values.gender,
                address: values.address
            };

            const response = await userService.updateProfile(updateData);
            if (response.success) {
                message.success('Cập nhật thông tin thành công!');
                setUserProfile(response.data);

                localStorage.setItem('user', JSON.stringify(response.data));
                setSelectedKey('profile');
            } else {
                message.error(response.message || 'Cập nhật thông tin thất bại!');
            }
        } catch (error) {

            const errorMessage = error.message || error.response?.data?.message || 'Cập nhật thông tin thất bại!';
            message.error(errorMessage);
        } finally {
            setProfileLoading(false);
        }
    };


    const handleChangePassword = async (values) => {
        setPasswordLoading(true);
        try {
            const response = await userService.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            });

            if (response.success) {
                message.success('Đổi mật khẩu thành công!');
                passwordForm.resetFields();
            } else {
                message.error(response.message || 'Đổi mật khẩu thất bại!');
            }
        } catch (error) {

            const errorMessage = error.message || error.response?.data?.message || 'Đổi mật khẩu thất bại!';
            message.error(errorMessage);
        } finally {
            setPasswordLoading(false);
        }
    };


    const menuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Hồ sơ của tôi',
        },
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Chỉnh sửa thông tin',
        },
        {
            key: 'password',
            icon: <LockOutlined />,
            label: 'Thay đổi mật khẩu',
        },
    ];


    const renderProfileContent = () => {
        if (loading) {
            return <div>Đang tải...</div>;
        }

        if (!userProfile) {
            return <div>Không thể tải thông tin cá nhân</div>;
        }

        return (
            <div>
                <Title level={3} style={{ marginBottom: '24px', color: '#1e3a8a' }}>
                    Hồ sơ của tôi
                </Title>

                <Card>

                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <Avatar
                                size={120}
                                src={userProfile.avatarUrl}
                                icon={<UserOutlined />}
                                style={{
                                    border: '4px solid #f0f0f0',
                                    cursor: 'pointer'
                                }}
                            />
                            <Upload
                                showUploadList={false}
                                beforeUpload={() => false}
                                onChange={handleAvatarChange}
                                accept="image/*"
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(0,0,0,0.5)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        transition: 'opacity 0.3s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.target.style.opacity = 1}
                                    onMouseLeave={(e) => e.target.style.opacity = 0}
                                >
                                    <div style={{ color: 'white', textAlign: 'center' }}>
                                        <CameraOutlined style={{ fontSize: '24px', marginBottom: '4px' }} />
                                        <div style={{ fontSize: '12px' }}>Thay đổi</div>
                                    </div>
                                </div>
                            </Upload>
                            {avatarLoading && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(255,255,255,0.8)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <div>Đang tải...</div>
                                </div>
                            )}
                        </div>
                        <div style={{ marginTop: '16px' }}>
                            <Title level={4} style={{ margin: 0, color: '#1e3a8a' }}>
                                {userProfile.displayName}
                            </Title>
                            <Text type="secondary">{userProfile.email}</Text>
                        </div>
                    </div>

                    <Divider />


                    <div>
                        <Row gutter={16}>
                            <Col span={12}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Tên hiển thị</Text>
                                    <div style={{ fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                                        {userProfile.displayName}
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Email</Text>
                                    <div style={{ fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                                        {userProfile.email}
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Vai trò</Text>
                                    <div style={{ fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                                        {userProfile.role}
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Số điện thoại</Text>
                                    <div style={{ fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                                        {userProfile.phoneNumber || 'Chưa cập nhật'}
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Ngày sinh</Text>
                                    <div style={{ fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                                        {userProfile.dateOfBirth ? dayjs(userProfile.dateOfBirth).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>Giới tính</Text>
                                    <div style={{ fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                                        {userProfile.gender === 'MALE' ? 'Nam' :
                                            userProfile.gender === 'FEMALE' ? 'Nữ' :
                                                userProfile.gender === 'OTHER' ? 'Khác' : 'Chưa cập nhật'}
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <div style={{ marginBottom: '16px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>Địa chỉ</Text>
                            <div style={{ fontSize: '16px', fontWeight: '500', marginTop: '4px' }}>
                                {userProfile.address || 'Chưa cập nhật'}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };


    const renderEditContent = () => {
        if (loading) {
            return <div>Đang tải...</div>;
        }

        if (!userProfile) {
            return <div>Không thể tải thông tin cá nhân</div>;
        }

        return (
            <div>
                <Title level={3} style={{ marginBottom: '24px', color: '#1e3a8a' }}>
                    Chỉnh sửa thông tin
                </Title>

                <Card>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSaveProfile}
                        disabled={profileLoading}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="displayName"
                                    label="Tên hiển thị"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập tên hiển thị!' },
                                        { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' }
                                    ]}
                                >
                                    <Input placeholder="Nhập tên hiển thị" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label="Email">
                                    <Input value={userProfile.email} disabled />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label="Vai trò">
                                    <Input value={userProfile.role} disabled />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="phoneNumber"
                                    label="Số điện thoại"
                                >
                                    <Input placeholder="Nhập số điện thoại" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="dateOfBirth"
                                    label="Ngày sinh"
                                >
                                    <DatePicker
                                        style={{ width: '100%' }}
                                        placeholder="Chọn ngày sinh"
                                        format="DD/MM/YYYY"
                                        disabledDate={(current) => current && current > dayjs().endOf('day')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="gender"
                                    label="Giới tính"
                                >
                                    <Select placeholder="Chọn giới tính" allowClear>
                                        <Option value="MALE">Nam</Option>
                                        <Option value="FEMALE">Nữ</Option>
                                        <Option value="OTHER">Khác</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="address"
                            label="Địa chỉ"
                        >
                            <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>

                        <div style={{ textAlign: 'right', marginTop: '24px' }}>
                            <Space>
                                <Button onClick={() => setSelectedKey('profile')} disabled={profileLoading}>
                                    Hủy
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={profileLoading}
                                    icon={<SaveOutlined />}
                                    style={{
                                        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                                        border: 'none'
                                    }}
                                >
                                    Lưu thay đổi
                                </Button>
                            </Space>
                        </div>
                    </Form>
                </Card>
            </div>
        );
    };


    const renderPasswordContent = () => (
        <div>
            <Title level={3} style={{ marginBottom: '24px', color: '#1e3a8a' }}>
                Thay đổi mật khẩu
            </Title>

            <Card style={{ maxWidth: '500px' }}>
                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleChangePassword}
                >
                    <Form.Item
                        name="currentPassword"
                        label="Mật khẩu hiện tại"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                        ]}
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password placeholder="Nhập lại mật khẩu mới" />
                    </Form.Item>

                    <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={passwordLoading}
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
                            Cập nhật mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );


    const renderContent = () => {
        switch (selectedKey) {
            case 'profile':
                return renderProfileContent();
            case 'edit':
                return renderEditContent();
            case 'password':
                return renderPasswordContent();
            default:
                return renderProfileContent();
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Layout style={{ background: 'transparent' }}>
                    <Sider
                        width={250}
                        style={{
                            background: 'transparent',
                            marginRight: '24px'
                        }}
                    >
                        <Card style={{ height: 'fit-content' }}>
                            <Menu
                                mode="inline"
                                selectedKeys={[selectedKey]}
                                items={menuItems}
                                onClick={({ key }) => setSelectedKey(key)}
                                style={{ border: 'none' }}
                            />
                        </Card>
                    </Sider>
                    <Content>
                        {renderContent()}
                    </Content>
                </Layout>
            </div>


            <Modal
                title="Xem trước ảnh đại diện"
                open={avatarModalVisible}
                onOk={handleSaveAvatar}
                onCancel={() => {
                    setAvatarModalVisible(false);
                    setPreviewImage(null);
                }}
                confirmLoading={avatarLoading}
                okText="Lưu"
                cancelText="Hủy"
            >
                {previewImage && (
                    <div style={{ textAlign: 'center' }}>
                        <img
                            src={URL.createObjectURL(previewImage)}
                            alt="Preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '300px',
                                borderRadius: '8px'
                            }}
                        />
                        <div style={{ marginTop: '16px' }}>
                            <Text type="secondary">
                                Ảnh sẽ được cắt thành hình vuông để hiển thị tốt nhất
                            </Text>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProfilePage;
