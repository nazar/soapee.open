import React, { useState } from 'react';
import { Link, NavLink, useHistory } from 'react-router-dom';
import { Container, Icon, Menu, Dropdown, Header } from 'semantic-ui-react';

import client from 'client';

import useAuthenticated from 'hooks/useAuthenticated';
import useCurrentUser from 'hooks/useCurrentUser';
import useMedia, { mobile } from 'hooks/useMedia';

import { clearAuthToken } from 'services/token';
import { resetAuthenticated } from 'services/auth';

import Avatar from 'components/shared/Avatar';

import Notifications from '../Notifications';

import './navBar.styl';


export default function NavBar() {
  const isMobile = useMedia(mobile);

  return (
    <div className="navbar">
      <Container>
        {isMobile && <NavBarMobile />}
        {!(isMobile) && <NavBarDesktop />}
      </Container>
    </div>
  );
}


const NavBarDesktop = () => (
  <Menu inverted borderless color="black">
    <Menu.Item>
      <Link to="/">
        <Header inverted>Soapee</Header>
      </Link>
    </Menu.Item>

    <LeftMenuItems />
    <Menu.Menu position="right">
      <RightMenuItems />
    </Menu.Menu>
  </Menu>
);

function NavBarMobile() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Menu inverted borderless color="black">
        <Menu.Item>
          <Link to="/">
            <Header inverted>Soapee</Header>
          </Link>
        </Menu.Item>

        <Menu.Menu position="right">
          <Menu.Item onClick={toggleMenu}>
            <Icon name="bars" />
          </Menu.Item>
        </Menu.Menu>
      </Menu>

      {visible && (
        <Menu inverted className="mobile-dropdown" color="grey" vertical fluid>
          <LeftMenuItems />
          <RightMenuItems />
        </Menu>
      )}
    </>
  );

  //

  function toggleMenu() {
    setVisible(prev => !(prev));
  }
}

const LeftMenuItems = () => (
  <>
    <Menu.Item as={NavLink} name="Home" exact to="/" />
    <Menu.Item as={NavLink} name="Calculator" to="/calculator" />
    <Menu.Item as={NavLink} name="Recipes" to="/recipes" />
    <Menu.Item as={NavLink} name="Oils" to="/oils" />
    <Menu.Item as={NavLink} name="Feed" to="/feed" />
    <Menu.Item as={NavLink} name="Forums" to="/forums/home" />
  </>
);

const RightMenuItems = () => {
  const auth = useAuthenticated();

  if (auth) {
    return <UserMenu />;
  } else {
    return <Menu.Item as={NavLink} name="Login" to="/auth/login" data-cy="navlink-login" />;
  }
};

function UserMenu() {
  const currentUser = useCurrentUser();
  const history = useHistory();

  return (currentUser && (
    <div className="user-menu" data-cy="user-menu">
      <Menu secondary>
        <Menu.Item>
          <Notifications />
        </Menu.Item>

        <Menu.Item className="user-menu-main-item">
          <Dropdown floating trigger={<Avatar user={currentUser} size="micro" data-cy="user-menu-item" />}>
            <Dropdown.Menu>
              <Menu.Item as={NavLink} name="Profile" to="/settings" />
              <Dropdown.Divider />
              <Menu.Item as="a" name="Logout" onClick={logout} data-cy="logout" />
            </Dropdown.Menu>
          </Dropdown>
        </Menu.Item>
      </Menu>
    </div>
  )) || null;

  //

  function logout() {
    clearAuthToken();
    resetAuthenticated();
    history.replace('/');
    return client.resetStore();
  }
}
