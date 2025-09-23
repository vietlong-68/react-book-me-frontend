import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Upload, Row, Col, Typography, Space, Spin } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { providerApplicationService } from '../services/providerApplicationService';

const { Title, Text } = Typography;
const { TextArea } = Input;

const EditApplicationPage = () => {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { applicationId } = useParams();


    const fetchApplication = async () => {
        setLoading(true);
        try {
            const response = await providerApplicationService.getApplicationById(applicationId);
            if (response.success) {
                const application = response.data;
                form.setFieldsValue({
                    businessName: application.businessName,
                    bio: application.bio,
                    address: application.address,
                    phoneNumber: application.phoneNumber,
                    websiteUrl: application.websiteUrl
                });
            } else {
                message.error(response.message || 'Không thể tải thông tin đơn đăng ký!');
                navigate('/my-applications');
            }
        } catch (error) {

            const errorMessage = error.message || error.response?.data?.message || 'Không thể tải thông tin đơn đăng ký!';
            message.error(errorMessage);
            navigate('/my-applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (applicationId) {
            fetchApplication();
        }
    }, [applicationId]);


    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };


    const handleRemoveFile = () => {
        setFileList([]);
    };


    const isFormValid = () => {
        const businessName = form.getFieldValue('businessName');
        return businessName;
    };


    const handleSubmit = async (values) => {
        if (!isFormValid()) {
            message.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        setSubmitting(true);
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

            const response = await providerApplicationService.updateApplication(applicationId, formData);

            if (response.success) {
                message.success('Cập nhật đơn đăng ký thành công!');
                navigate('/my-applications');
            } else {
                message.error(response.message || 'Cập nhật đơn đăng ký thất bại!');
            }
        } catch (error) {

            const errorMessage = error.message || error.response?.data?.message || 'Cập nhật đơn đăng ký thất bại!';
            message.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px'
            }}>
                <Spin size="large" />
            </div>
        );
    }

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
                    <div style={{ marginBottom: '24px' }}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/my-applications')}
                            style={{ marginBottom: '16px' }}
                        >
                            Quay lại
                        </Button>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={2} style={{ color: '#1e3a8a', marginBottom: '8px' }}>
                                Chỉnh sửa đơn đăng ký
                            </Title>
                            <Text type="secondary" style={{ fontSize: '16px' }}>
                                Cập nhật thông tin đơn đăng ký của bạn
                            </Text>
                        </div>
                    </div>

                    <Form
                        form={form}
                        name="editApplication"
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
                            label="Tải lên ảnh chụp Giấy phép kinh doanh mới (tùy chọn)"
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
                                            Tải lên ảnh mới
                                        </div>
                                    </div>
                                )}
                            </Upload>
                            <div style={{ marginTop: '8px' }}>
                                <Text type="secondary">
                                    Định dạng: JPG, PNG, GIF • Kích thước tối đa: 10MB
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    Nếu không chọn ảnh mới, hệ thống sẽ giữ nguyên ảnh cũ
                                </Text>
                            </div>
                        </Form.Item>


                        <Form.Item style={{ marginTop: '32px', marginBottom: 0 }}>
                            <Space style={{ width: '100%', justifyContent: 'center' }}>
                                <Button
                                    onClick={() => navigate('/my-applications')}
                                    size="large"
                                    style={{ minWidth: '120px' }}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={submitting}
                                    disabled={!isFormValid()}
                                    size="large"
                                    style={{
                                        background: isFormValid()
                                            ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
                                            : '#d1d5db',
                                        border: 'none',
                                        minWidth: '120px',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}
                                >
                                    {submitting ? 'Đang cập nhật...' : 'Cập nhật'}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default EditApplicationPage;
