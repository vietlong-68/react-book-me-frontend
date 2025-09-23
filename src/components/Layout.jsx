import React from 'react';
import { Layout } from 'antd';
import Header from './Header';

const { Content } = Layout;

const AppLayout = ({ children }) => {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header />
            <Content
                style={{
                    padding: '24px',
                    background: '#f5f5f5',
                }}
            >
                {children}
            </Content>
        </Layout>
    );
};

export default AppLayout;
