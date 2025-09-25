import React, { useState, useEffect } from 'react';
import {
    Modal,
    Form,
    Input,
    Upload,
    Button,
    message,
    Row,
    Col,
    Typography,
    Divider,
    Space,
    Image
} from 'antd';
import {
    UploadOutlined,
    DeleteOutlined,
    PictureOutlined
} from '@ant-design/icons';
import { providerService } from '../services/providerService';
import { getImageUrl } from '../utils/imageUtils';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ProviderModal = ({
    visible,
    onCancel,
    onSuccess,
    providerId,
    provider = null
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    useEffect(() => {
        if (visible && provider) {
            form.setFieldsValue({
                businessName: provider.businessName,
                bio: provider.bio,
                address: provider.address,
                phoneNumber: provider.phoneNumber,
                websiteUrl: provider.websiteUrl
            });

            if (provider.logoUrl) {
                setLogoPreview(getImageUrl(provider.logoUrl));
            }

            if (provider.bannerUrl) {
                setBannerPreview(getImageUrl(provider.bannerUrl));
            }
        } else {
            form.resetFields();
            setLogoFile(null);
            setBannerFile(null);
            setLogoPreview(null);
            setBannerPreview(null);
        }
    }, [visible, provider, form]);

    const handleLogoChange = (info) => {
        const { file } = info;

        if (file.status === 'removed') {
            setLogoFile(null);
            setLogoPreview(null);
            return;
        }


        if (file.originFileObj || file) {
            const fileObj = file.originFileObj || file;
            setLogoFile(fileObj);


            const reader = new FileReader();
            reader.onload = (e) => {
                setLogoPreview(e.target.result);
            };
            reader.readAsDataURL(fileObj);
        }
    };

    const handleBannerChange = (info) => {
        const { file } = info;

        if (file.status === 'removed') {
            setBannerFile(null);
            setBannerPreview(null);
            return;
        }


        if (file.originFileObj || file) {
            const fileObj = file.originFileObj || file;
            setBannerFile(fileObj);


            const reader = new FileReader();
            reader.onload = (e) => {
                setBannerPreview(e.target.result);
            };
            reader.readAsDataURL(fileObj);
        }
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const values = await form.validateFields();


            await providerService.updateProvider(providerId, values, logoFile, bannerFile);

            message.success('Cập nhật thông tin nhà cung cấp thành công!');
            onSuccess();

        } catch (error) {

            message.error(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        Quản lý thông tin nhà cung cấp
                    </Title>
                </div>
            }
            open={visible}
            onCancel={onCancel}
            width={800}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Hủy
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                >
                    Cập nhật thông tin
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
                            label="Tên doanh nghiệp"
                            name="businessName"
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên doanh nghiệp' },
                                { min: 2, message: 'Tên doanh nghiệp phải có ít nhất 2 ký tự' }
                            ]}
                        >
                            <Input placeholder="Nhập tên doanh nghiệp" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Mô tả"
                            name="bio"
                        >
                            <TextArea
                                rows={3}
                                placeholder="Nhập mô tả về doanh nghiệp của bạn"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Địa chỉ"
                            name="address"
                        >
                            <Input placeholder="Nhập địa chỉ" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Số điện thoại"
                            name="phoneNumber"
                            rules={[
                                { pattern: /^[0-9+\-\s()]+$/, message: 'Số điện thoại không hợp lệ' }
                            ]}
                        >
                            <Input placeholder="Nhập số điện thoại" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            label="Website"
                            name="websiteUrl"
                            rules={[
                                { type: 'url', message: 'URL website không hợp lệ' }
                            ]}
                        >
                            <Input placeholder="https://example.com" />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Logo">
                            <div style={{ marginBottom: 8 }}>
                                {logoPreview && (
                                    <div style={{ marginBottom: 8, textAlign: 'center' }}>
                                        <Image
                                            src={logoPreview}
                                            alt="Logo preview"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                )}
                                <Upload
                                    beforeUpload={() => false}
                                    onChange={handleLogoChange}
                                    showUploadList={false}
                                    accept="image/*"
                                >
                                    <Button icon={<UploadOutlined />} block>
                                        {logoPreview ? 'Thay đổi logo' : 'Tải lên logo'}
                                    </Button>
                                </Upload>
                            </div>
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item label="Banner">
                            <div style={{ marginBottom: 8 }}>
                                {bannerPreview && (
                                    <div style={{ marginBottom: 8, textAlign: 'center' }}>
                                        <Image
                                            src={bannerPreview}
                                            alt="Banner preview"
                                            style={{
                                                width: '100%',
                                                height: '80px',
                                                borderRadius: '8px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </div>
                                )}
                                <Upload
                                    beforeUpload={() => false}
                                    onChange={handleBannerChange}
                                    showUploadList={false}
                                    accept="image/*"
                                >
                                    <Button icon={<PictureOutlined />} block>
                                        {bannerPreview ? 'Thay đổi banner' : 'Tải lên banner'}
                                    </Button>
                                </Upload>
                            </div>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ProviderModal;
