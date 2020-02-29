import React, { useState } from 'react';
import {
  Collapse,
  Navbar as StrapNavbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavbarText
} from 'reactstrap';

export const Navbar = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);

  return (
      <div>
        <StrapNavbar color="light" light expand="md">
          <NavbarBrand href="/">Japanese concept recognizer</NavbarBrand>
        </StrapNavbar>
      </div>
  );
}
