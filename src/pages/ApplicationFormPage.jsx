import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Upload, Row, Col, Typography, Space } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { providerApplicationService } from '../services/providerApplicationService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ApplicationFormPage = () => {
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [form] = Form.useForm();
    const navigate = useNavigate();


    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };


    const handleRemoveFile = () => {
        setFileList([]);
    };


    const isFormValid = () => {
        const businessName = form.getFieldValue('businessName');
        return businessName && fileList.length > 0;
    };


    const handleSubmit = async (values) => {
        if (!isFormValid()) {
            message.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('businessName', values.businessName);

            if (values.bio) {
                formData.append('bio', values.bio);
            }
            if (values.address) {
                formData.append('address', values.address);
            }
            if (values.phoneNumber) {
                formData.append('phoneNumber', values.phoneNumber);
            }
            if (values.websiteUrl) {
                formData.append('websiteUrl', values.websiteUrl);
            }


            if (fileList.length > 0) {
                formData.append('businessLicenseFile', fileList[0].originFileObj);
            }

            const response = await providerApplicationService.submitApplication(formData);

            if (response.success) {
                message.success('Gửi đơn thành công! Chúng tôi sẽ sớm xem xét đơn của bạn.');
                navigate('/my-applications');
            } else {
                message.error(response.message || 'Gửi đơn thất bại!');
            }
        } catch (error) {

            const errorMessage = error.message || error.response?.data?.message || 'Gửi đơn thất bại!';
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '20px'
        }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <Card
                    style={{
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        borderRadius: '12px'
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                            Đăng ký trở thành Đối tác Cung cấp Dịch vụ
                        </Title>
                        <Text type="secondary" style={{ fontSize: '16px' }}>
                            Hãy điền đầy đủ thông tin để chúng tôi có thể xem xét đơn đăng ký của bạn
                        </Text>
                    </div>

                    <Form
                        form={form}
                        name="providerApplication"
                        onFinish={handleSubmit}
                        layout="vertical"
                        size="large"
                    >

                        <Form.Item
                            name="businessName"
                            label={
                                <span>
                                    Tên doanh nghiệp <span style={{ color: 'red' }}>*</span>
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên doanh nghiệp!' },
                                { min: 2, message: 'Tên doanh nghiệp phải có ít nhất 2 ký tự!' }
                            ]}
                        >
                            <Input placeholder="Nhập tên doanh nghiệp của bạn" />
                        </Form.Item>
                        <Text type="secondary" style={{ marginTop: '-16px', marginBottom: '24px', display: 'block' }}>
                            Đây là tên sẽ hiển thị công khai với khách hàng của bạn
                        </Text>


                        <Form.Item
                            name="bio"
                            label="Giới thiệu ngắn"
                        >
                            <TextArea
                                rows={4}
                                placeholder="Hãy chia sẻ về điểm mạnh, kinh nghiệm hoặc sứ mệnh kinh doanh của bạn"
                                maxLength={500}
                                showCount
                            />
                        </Form.Item>


                        <Title level={4} style={{ color: '#1e3a8a', marginBottom: '16px' }}>
                            Thông tin liên hệ
                        </Title>
                        <Text type="secondary" style={{ marginBottom: '16px', display: 'block' }}>
                            Các thông tin này không bắt buộc, bạn có thể bổ sung sau
                        </Text>

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
                                    name="websiteUrl"
                                    label="Website"
                                >
                                    <Input placeholder="https://example.com" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="address"
                            label="Địa chỉ"
                        >
                            <Input placeholder="Nhập địa chỉ doanh nghiệp" />
                        </Form.Item>


                        <Form.Item
                            label={
                                <span>
                                    Tải lên ảnh chụp Giấy phép kinh doanh <span style={{ color: 'red' }}>*</span>
                                </span>
                            }
                            required
                        >
                            <Upload
                                fileList={fileList}
                                onChange={handleFileChange}
                                onRemove={handleRemoveFile}
                                beforeUpload={() => false}
                                accept="image/*"
                                maxCount={1}
                                listType="picture-card"
                            >
                                {fileList.length >= 1 ? null : (
                                    <div>
                                        <UploadOutlined style={{ fontSize: '24px', color: '#1e3a8a' }} />
                                        <div style={{ marginTop: 8, color: '#1e3a8a' }}>
                                            Tải lên ảnh
                                        </div>
                                    </div>
                                )}
                            </Upload>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary">
                                    Định dạng: JPG, PNG, GIF • Kích thước tối đa: 10MB
                                </Text>
                            </div>
                        </Form.Item>


                        <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                disabled={!isFormValid()}
                                block
                                size="large"
                                style={{
                                    background: isFormValid()
                                        ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                                        : '#d1d5db',
                                    border: 'none',
                                    height: '48px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                            >
                                {loading ? 'Đang gửi đơn...' : 'Gửi đơn đăng ký'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default ApplicationFormPage;
