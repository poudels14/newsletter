import { Layout } from 'antd';
import React from 'react';
import { css } from '@emotion/core';

const { Header } = Layout;

const DARK_INDIGO = '#4F4E79';
// const MEDIUM_INDIGO = '#595885';

// const Header = () => (
//   <div style={{ height: '50px', backgroundColor: DARK_INDIGO }}></div>
// );

// const SubHeader = () => (
//   <div style={{ height: '40px', backgroundColor: MEDIUM_INDIGO }}></div>
// );

export const NavigationHeader = () => {
  return (
    <Header
      className="nav-header"
      css={css(`
        background: linear-gradient(to right, rgba(54, 52, 105, 1), rgba(81, 76, 115, 0.9));
        padding: 0
      `)}
    />
    // <div style={{ width: '100%' }}>
    /* <Navbar style={{ backgroundColor: DARK_INDIGO, color: 'white', }}>
        <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Heading>Blueprint</Navbar.Heading>
            <Navbar.Divider />
            <Button className="bp3-minimal" icon="home" text="Home" style={{ color: 'white'}} />
            <Button className="bp3-minimal" icon="document" text="Files" />
        </Navbar.Group>
      </Navbar> */
    // <Header />
    /* <SubHeader /> */
    // </div>
  );
};
