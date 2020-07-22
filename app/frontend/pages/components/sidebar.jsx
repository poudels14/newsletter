import 'antd/dist/antd.css';

import { Layout, Menu } from 'antd';
import { PieChartOutlined, UserOutlined } from '@ant-design/icons';

import PropTypes from 'prop-types';
import React from 'react';
import { css } from '@emotion/core';

const { SubMenu } = Menu;

const Sidebar = (props) => {
  return (
    <Layout.Sider {...props} css={css({ background: 'white' })}>
      {/* <Menu defaultSelectedKeys={['1']} mode="inline">
        <Menu.Item key="1" icon={<PieChartOutlined />}>
          Option 1
        </Menu.Item>
        <SubMenu key="sub1" icon={<UserOutlined />} title="User">
          <Menu.Item key="3">Tom</Menu.Item>
          <Menu.Item key="4">Bill</Menu.Item>
          <Menu.Item key="5">Alex</Menu.Item>
        </SubMenu>
      </Menu> */}
    </Layout.Sider>
  );
};
Sidebar.propTypes = {
  width: PropTypes.string,
};

export { Sidebar };
