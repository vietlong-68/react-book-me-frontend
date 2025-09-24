import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Typography,
    Tag,
    Space,
    message,
    Popconfirm,
    Card,
    Switch,
    Divider
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CategoryManagement = () => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await adminService.getAllCategories();
            if (response.success) {
                setCategories(response.data || []);
            } else {
                message.error(response.message || 'Không thể tải danh sách danh mục');
            }
        } catch (error) {

            message.error('Không thể tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async (values) => {
        try {
            const response = await adminService.createCategory(values);
            if (response.success) {
                message.success('Tạo danh mục thành công!');
                setCreateModalVisible(false);
                form.resetFields();
                fetchCategories();
            } else {
                message.error(response.message || 'Tạo danh mục thất bại');
            }
        } catch (error) {

            message.error('Tạo danh mục thất bại');
        }
    };

    const handleEditCategory = async (values) => {
        try {
            const response = await adminService.updateCategory(selectedCategory.id, values);
            if (response.success) {
                message.success('Cập nhật danh mục thành công!');
                setEditModalVisible(false);
                setSelectedCategory(null);
                form.resetFields();
                fetchCategories();
            } else {
                message.error(response.message || 'Cập nhật danh mục thất bại');
            }
        } catch (error) {

            message.error('Cập nhật danh mục thất bại');
        }
    };

    const handleToggleStatus = async (categoryId, isActive) => {
        try {
            const response = isActive
                ? await adminService.activateCategory(categoryId)
                : await adminService.deactivateCategory(categoryId);

            if (response.success) {
                message.success(
                    isActive
                        ? 'Kích hoạt danh mục thành công!'
                        : 'Vô hiệu hóa danh mục thành công!'
                );
                fetchCategories();
            } else {
                message.error(response.message || 'Thay đổi trạng thái thất bại');
            }
        } catch (error) {

            message.error('Thay đổi trạng thái thất bại');
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        try {
            const response = await adminService.deleteCategory(categoryId);
            if (response.success) {
                message.success('Xóa danh mục thành công!');
                fetchCategories();
            } else {
                if (response.message && response.message.includes('CATEGORY_IN_USE')) {
                    message.error('Không thể xóa danh mục đang được sử dụng bởi các dịch vụ');
                } else {
                    message.error(response.message || 'Xóa danh mục thất bại');
                }
            }
        } catch (error) {

            if (error.message && error.message.includes('CATEGORY_IN_USE')) {
                message.error('Không thể xóa danh mục đang được sử dụng bởi các dịch vụ');
            } else {
                message.error('Xóa danh mục thất bại');
            }
        }
    };

    const getStatusConfig = (isActive) => {
        return isActive
            ? {
                color: 'success',
                icon: <CheckCircleOutlined />,
                text: 'Hoạt động'
            }
            : {
                color: 'error',
                icon: <CloseCircleOutlined />,
                text: 'Vô hiệu hóa'
            };
    };

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (text) => text || '-',
            ellipsis: true
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive, record) => {
                const config = getStatusConfig(isActive);
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {config.text}
                    </Tag>
                );
            }
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
        },
        {
            title: 'Cập nhật lần cuối',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
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
                            setSelectedCategory(record);
                            form.setFieldsValue(record);
                            setEditModalVisible(true);
                        }}
                    >
                        Chỉnh sửa
                    </Button>
                    <Switch
                        size="small"
                        checked={record.isActive}
                        onChange={(checked) => handleToggleStatus(record.id, checked)}
                        checkedChildren="ON"
                        unCheckedChildren="OFF"
                    />
                    <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc muốn xóa danh mục này?"
                        onConfirm={() => handleDeleteCategory(record.id)}
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
                    Quản lý Danh mục
                </Title>
                <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
                    Quản lý các danh mục dịch vụ trong hệ thống
                </p>
            </div>

            <Card>
                <div style={{ marginBottom: '16px', textAlign: 'right' }}>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setCreateModalVisible(true)}
                    >
                        Tạo Danh mục mới
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={categories}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} danh mục`
                    }}
                />
            </Card>


            <Modal
                title="Tạo Danh mục mới"
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
                    onFinish={handleCreateCategory}
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                    >
                        <Input placeholder="Nhập tên danh mục" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <TextArea
                            placeholder="Nhập mô tả danh mục"
                            rows={4}
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

                    <Divider />
                    <div style={{ textAlign: 'right' }}>
                        <Space>
                            <Button onClick={() => setCreateModalVisible(false)}>
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Tạo danh mục
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Modal>


            <Modal
                title="Chỉnh sửa Danh mục"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    setSelectedCategory(null);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEditCategory}
                >
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                    >
                        <Input placeholder="Nhập tên danh mục" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Mô tả"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                    >
                        <TextArea
                            placeholder="Nhập mô tả danh mục"
                            rows={4}
                            maxLength={500}
                            showCount
                        />
                    </Form.Item>

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
        </div>
    );
};

export default CategoryManagement;
