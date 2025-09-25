import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    Button,
    message,
    Row,
    Col,
    Typography,
    Divider,
    Space
} from 'antd';
import {
    PlusOutlined,
    UploadOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { providerService } from '../services/providerService';
import { categoryService } from '../services/categoryService';
import { getImageUrl } from '../utils/imageUtils';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const ServiceModal = ({
    visible,
    onCancel,
    onSuccess,
    providerId,
    editingService = null
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (visible) {
            fetchCategories();
            if (editingService) {
                form.setFieldsValue({
                    serviceName: editingService.serviceName,
                    description: editingService.description,
                    price: editingService.price,
                    durationMinutes: editingService.durationMinutes,
                    categoryId: editingService.categoryId
                });
                if (editingService.imageUrl) {
                    setImagePreview(getImageUrl(editingService.imageUrl));
                }
            } else {
                form.resetFields();
                setImageFile(null);
                setImagePreview(null);
            }
        }
    }, [visible, editingService, form]);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getCategories();
            if (response.success) {
                setCategories(response.data || []);
            }
        } catch (error) {

        }
    };

    const handleImageChange = (info) => {
        if (info.file) {
            setImageFile(info.file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(info.file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();


            Object.keys(values).forEach(key => {
                if (values[key] !== undefined && values[key] !== null) {
                    formData.append(key, values[key]);
                }
            });


            if (imageFile) {
                formData.append('imageFile', imageFile);
            }

            let response;
            if (editingService) {

                response = await providerService.updateService(providerId, editingService.id, formData);
            } else {

                response = await providerService.createService(providerId, formData);
            }

            if (response.success) {
                message.success(response.message ||
                    (editingService ? 'Cập nhật dịch vụ thành công' : 'Tạo dịch vụ thành công')
                );
                onSuccess();
                handleCancel();
            } else {
                message.error(response.message || 'Có lỗi xảy ra');
            }
        } catch (error) {

            message.error('Có lỗi xảy ra khi lưu dịch vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        setImageFile(null);
        setImagePreview(null);
        onCancel();
    };

    return (
        <Modal
            title={
                <Title level={3} style={{ margin: 0, color: '#1e3a8a' }}>
                    {editingService ? 'Chỉnh sửa Dịch vụ' : 'Thêm Dịch vụ mới'}
                </Title>
            }
            open={visible}
            onCancel={handleCancel}
            footer={null}
            width={800}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                style={{ marginTop: '20px' }}
            >
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="serviceName"
                            label="Tên dịch vụ"
                            rules={[{ required: true, message: 'Vui lòng nhập tên dịch vụ' }]}
                        >
                            <Input placeholder="Nhập tên dịch vụ" size="large" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="price"
                            label="Giá dịch vụ (VNĐ)"
                            rules={[{ required: true, message: 'Vui lòng nhập giá dịch vụ' }]}
                        >
                            <InputNumber
                                placeholder="Nhập giá dịch vụ"
                                style={{ width: '100%' }}
                                size="large"
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                min={0}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="durationMinutes"
                            label="Thời lượng (phút)"
                            rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
                        >
                            <InputNumber
                                placeholder="Nhập thời lượng"
                                style={{ width: '100%' }}
                                size="large"
                                min={1}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="categoryId"
                            label="Danh mục"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                        >
                            <Select placeholder="Chọn danh mục" size="large">
                                {categories.map(category => (
                                    <Option key={category.id} value={category.id}>
                                        {category.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="description"
                            label="Mô tả dịch vụ"
                        >
                            <TextArea
                                placeholder="Nhập mô tả dịch vụ"
                                rows={4}
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item label="Ảnh dịch vụ">
                            <div>
                                {imagePreview ? (
                                    <div style={{ marginBottom: '16px' }}>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{
                                                width: '150px',
                                                height: '150px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                border: '1px solid #d9d9d9'
                                            }}
                                        />
                                        <div style={{ marginTop: '8px' }}>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={handleRemoveImage}
                                                size="small"
                                            >
                                                Xóa ảnh
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Upload
                                        beforeUpload={() => false}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        showUploadList={false}
                                    >
                                        <Button icon={<UploadOutlined />} size="large">
                                            Chọn ảnh dịch vụ
                                        </Button>
                                    </Upload>
                                )}
                                <div style={{ marginTop: '8px' }}>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        Định dạng: JPG, PNG, JPEG, GIF. Kích thước tối đa: 10MB
                                    </Text>
                                </div>
                            </div>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <div style={{ textAlign: 'right' }}>
                    <Space>
                        <Button onClick={handleCancel} size="large">
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={<PlusOutlined />}
                            size="large"
                        >
                            {editingService ? 'Cập nhật' : 'Tạo dịch vụ'}
                        </Button>
                    </Space>
                </div>
            </Form>
        </Modal>
    );
};

export default ServiceModal;
