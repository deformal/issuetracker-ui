import React from "react";
import Contents from "./Contents.jsx";
import { LinkContainer } from "react-router-bootstrap";
import SignInNavItem from "./SignInNavItem.jsx";
import UserContext from "./UserContext.js";
import graphQLFetch from "./graphQLFetch";
import store from "./Store.js";
import {
  Navbar,
  Nav,
  NavItem,
  NavDropdown,
  MenuItem,
  Glyphicon,
  Grid,
  Col,
} from "react-bootstrap";
import IssueAddNavItem from "./IssueAddNavItem.jsx";
import Search from "./Search.jsx";

function Header({ user, onUserChange }) {
  return (
    <Navbar inverse collapseOnSelect>
      <Navbar.Header>
        <Navbar.Brand>Issue Tracker</Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav>
          <LinkContainer exact to="/">
            <NavItem>Home</NavItem>
          </LinkContainer>
          <LinkContainer to="/issues">
            <NavItem>Issue List</NavItem>
          </LinkContainer>
          <LinkContainer to="/report">
            <NavItem>Report</NavItem>
          </LinkContainer>
        </Nav>
        <Col sm={5}>
          <Navbar.Form>
            <Search />
          </Navbar.Form>
        </Col>
        <Nav pullRight>
          <IssueAddNavItem user={user} onUserChange={onUserChange} />
          <SignInNavItem user={user} onUserChange={onUserChange} />
          <NavDropdown
            id="user-dropdown"
            title={<Glyphicon glyph="option-vertical" />}
            noCaret
          >
            <LinkContainer to="/about">
              <MenuItem>About</MenuItem>
            </LinkContainer>
          </NavDropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
function Footer() {
  return (
    <small>
      <hr />
      <p className="text-center">
        Developed and Designed by {"   "}
        <a href="http://saurabh-jainwal.herokuapp.com">
          Saurabh Jainwal
        </a>{" "}
      </p>
    </small>
  );
}

export default class Page extends React.Component {
  static async fetchData(cookie) {
    const query = `query{user{
      signedIn givenName
    }}`;
    const data = await graphQLFetch(query, null, null, cookie);
    console.log(data);
    return data;
  }
  constructor(props) {
    super(props);
    const user = store.userData ? store.userData.user : null;
    delete store.userData;
    this.state = { user };
    this.onUserChange = this.onUserChange.bind(this);
  }

  async componentDidMount() {
    try {
      const { user } = this.state;
      if (user === null) {
        const data = await Page.fetchData();
        this.setState({ user: data.user });
      }
    } catch (er) {
      console.log(er);
    }
  }
  onUserChange(user) {
    this.setState({ user });
  }
  render() {
    const { user } = this.state;
    if (user == null) return null;
    return (
      <div>
        <Header user={user} onUserChange={this.onUserChange} />
        <Grid fluid>
          <UserContext.Provider value={user}>
            <Contents />
          </UserContext.Provider>
        </Grid>

        <Footer />
      </div>
    );
  }
}
