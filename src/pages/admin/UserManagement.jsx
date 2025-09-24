import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    Typography,
    Tag,
    Space,
    message,
    Popconfirm,
    Card,
    Row,
    Col,
    Divider
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    TeamOutlined,
    CrownOutlined
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const UserManagement = () => {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [roleModalVisible, setRoleModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form] = Form.useForm();
    const [roleForm] = Form.useForm();

    useEffect(() => {
        fetchUsers();
    }, [pagination.current, pagination.pageSize]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminService.getUsersPaginated(
                pagination.current - 1,
                pagination.pageSize
            );
            if (response.success) {
                setUsers(response.data.content || []);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.totalElements || 0
                }));
            } else {
                message.error(response.message || 'Không thể tải danh sách người dùng');
            }
        } catch (error) {

            message.error('Không thể tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (values) => {
        try {
            const response = await adminService.createUser(values);
            if (response.success) {
                message.success('Tạo người dùng thành công!');
                setCreateModalVisible(false);
                form.resetFields();
                fetchUsers();
            } else {
                message.error(response.message || 'Tạo người dùng thất bại');
            }
        } catch (error) {

            message.error('Tạo người dùng thất bại');
        }
    };

    const handleEditUser = async (values) => {
        try {
            const response = await adminService.updateUser(selectedUser.id, values);
            if (response.success) {
                message.success('Cập nhật người dùng thành công!');
                setEditModalVisible(false);
                setSelectedUser(null);
                form.resetFields();
                fetchUsers();
            } else {
                message.error(response.message || 'Cập nhật người dùng thất bại');
            }
        } catch (error) {

            message.error('Cập nhật người dùng thất bại');
        }
    };

    const handleChangeRole = async (values) => {
        try {
            const response = await adminService.changeUserRole(selectedUser.id, values.role);
            if (response.success) {
                message.success('Thay đổi vai trò thành công!');
                setRoleModalVisible(false);
                setSelectedUser(null);
                roleForm.resetFields();
                fetchUsers();
            } else {
                message.error(response.message || 'Thay đổi vai trò thất bại');
            }
        } catch (error) {

            message.error('Thay đổi vai trò thất bại');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const response = await adminService.deleteUser(userId);
            if (response.success) {
                message.success('Xóa người dùng thành công!');
                fetchUsers();
            } else {
                message.error(response.message || 'Xóa người dùng thất bại');
            }
        } catch (error) {

            message.error('Xóa người dùng thất bại');
        }
    };

    const getRoleConfig = (role) => {
        switch (role) {
            case 'USER':
                return {
                    color: 'blue',
                    icon: <UserOutlined />,
                    text: 'Người dùng'
                };
            case 'PROVIDER':
                return {
                    color: 'green',
                    icon: <TeamOutlined />,
                    text: 'Nhà cung cấp'
                };
            case 'ADMIN':
                return {
                    color: 'red',
                    icon: <CrownOutlined />,
                    text: 'Quản trị viên'
                };
            default:
                return {
                    color: 'default',
                    icon: <UserOutlined />,
                    text: role
                };
        }
    };

    const columns = [
        {
            title: 'Tên hiển thị',
            dataIndex: 'displayName',
            key: 'displayName',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => {
                const config = getRoleConfig(role);
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {config.text}
                    </Tag>
                );
            }
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            render: (text) => text || '-'
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setSelectedUser(record);
                            form.setFieldsValue(record);
                            setEditModalVisible(true);
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                    <Button
                        size="small"
                        onClick={() => {
                            setSelectedUser(record);
                            roleForm.setFieldsValue({ role: record.role });
                            setRoleModalVisible(true);
                        }}
                    >
                        Đổi vai trò
                    </Button>
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc muốn xóa người dùng này?"
                        onConfirm={() => handleDeleteUser(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okType="danger"
                    >
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                    Quản lý Người dùng
                </Title>
                <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                    Quản lý tất cả tài khoản người dùng trong hệ thống
                </p>
            </div>

            <Card>
                <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setCreateModalVisible(true)}
                    >
                        Tạo Người dùng mới
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} người dùng`,
                        onChange: (page, pageSize) => {
                            setPagination(prev => ({
                                ...prev,
                                current: page,
                                pageSize: pageSize
                            }));
                        }
                    }}
                />
            </Card>


            <Modal
                title="Tạo Người dùng mới"
                open={createModalVisible}
                onCancel={() => {
                    setCreateModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateUser}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="displayName"
                                label="Tên hiển thị"
                                rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị' }]}
                            >
                                <Input placeholder="Nhập tên hiển thị" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input placeholder="Nhập email" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label="Mật khẩu"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                                    { min: 8, message: 'Mật khẩu tối thiểu 8 ký tự' }
                                ]}
                            >
                                <Input.Password placeholder="Nhập mật khẩu" />
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
                                name="role"
                                label="Vai trò"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                            >
                                <Select placeholder="Chọn vai trò">
                                    <Option value="USER">Người dùng</Option>
                                    <Option value="PROVIDER">Nhà cung cấp</Option>
                                    <Option value="ADMIN">Quản trị viên</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dateOfBirth"
                                label="Ngày sinh"
                            >
                                <Input placeholder="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="gender"
                                label="Giới tính"
                            >
                                <Select placeholder="Chọn giới tính">
                                    <Option value="MALE">Nam</Option>
                                    <Option value="FEMALE">Nữ</Option>
                                    <Option value="OTHER">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                            >
                                <Input placeholder="Nhập địa chỉ" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />
                    <div style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setCreateModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Tạo người dùng
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>


            <Modal
                title="Chỉnh sửa Người dùng"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setSelectedUser(null);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEditUser}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="displayName"
                                label="Tên hiển thị"
                                rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị' }]}
                            >
                                <Input placeholder="Nhập tên hiển thị" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input placeholder="Nhập email" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                            >
                                <Input placeholder="Nhập số điện thoại" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="dateOfBirth"
                                label="Ngày sinh"
                            >
                                <Input placeholder="YYYY-MM-DD" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="gender"
                                label="Giới tính"
                            >
                                <Select placeholder="Chọn giới tính">
                                    <Option value="MALE">Nam</Option>
                                    <Option value="FEMALE">Nữ</Option>
                                    <Option value="OTHER">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="address"
                                label="Địa chỉ"
                            >
                                <Input placeholder="Nhập địa chỉ" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider />
                    <div style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setEditModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Cập nhật
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>


            <Modal
                title="Thay đổi Vai trò"
                open={roleModalVisible}
                onCancel={() => {
                    setRoleModalVisible(false);
                    setSelectedUser(null);
                    roleForm.resetFields();
                }}
                footer={null}
                width={400}
            >
                <Form
                    form={roleForm}
                    layout="vertical"
                    onFinish={handleChangeRole}
                >
                    <div style={{ marginBottom: '16px' }}>
                        <Text strong>Người dùng: </Text>
                        <Text>{selectedUser?.displayName}</Text>
                    </div>

                    <Form.Item
                        name="role"
                        label="Vai trò mới"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                    >
                        <Select placeholder="Chọn vai trò">
                            <Option value="USER">Người dùng</Option>
                            <Option value="PROVIDER">Nhà cung cấp</Option>
                            <Option value="ADMIN">Quản trị viên</Option>
                        </Select>
                    </Form.Item>

                    <Divider />
                    <div style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setRoleModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Thay đổi
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
