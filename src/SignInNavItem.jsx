import React from "react";
import { NavItem, Modal, Button, NavDropdown, MenuItem } from "react-bootstrap";
import withToast from "./withToast.jsx";

class SignInNavItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showing: false,
      disabled: true,
      user: { signedIn: false, givenName: "" },
    };
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }

  showModal() {
    this.setState({ showing: true });
  }
  hideModal() {
    this.setState({ showing: false });
  }

  async componentDidMount() {
    const clientId = window.ENV.GOOGLE_CLIENT_ID;
    if (!clientId) return;
    window.gapi.load("auth2", () => {
      if (!window.gapi.auth2.getAuthInstance()) {
        window.gapi.auth2.init({ client_id: clientId }).then(() => {
          this.setState({ disabled: false });
        });
      }
    });
    await this.loadData();
  }

  async loadData() {
    const apiEndpoint = window.ENV.UI_AUTH_ENDPOINT;
    const response = await fetch(`${apiEndpoint}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Same-Site": "None" },
    });
    const body = await response.text();
    const result = JSON.parse(body);
    const { signedIn, givenName } = result;
    this.setState({ user: { signedIn, givenName } });
  }

  async signIn() {
    this.hideModal();
    const { showError } = this.props;
    let googleToken;
    try {
      const auth2 = window.gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn();
      googleToken = googleUser.getAuthResponse().id_token;
    } catch (error) {
      showError(`Error authenticating with Google:${error.error}`);
    }
    try {
      const apiEndpoint = window.ENV.UI_AUTH_ENDPOINT;
      const response = await fetch(`${apiEndpoint}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ google_token: googleToken }),
      });
      const body = await response.text();
      const result = JSON.parse(body);
      console.log({ result });
      const { signedIn, givenName } = result;
      const { onUserChange } = this.props;
      onUserChange({ signedIn, givenName });
    } catch (error) {
      showError(`Error signing into the app: ${error}`);
    }
  }

  async signOut() {
    this.hideModal();
    const apiEndpoint = window.ENV.UI_AUTH_ENDPOINT;
    const { showError } = this.props;
    try {
      await fetch(`${apiEndpoint}/signout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const auth2 = window.gapi.auth2.getAuthInstance();
      await auth2.signOut();
      const { onUserChange } = this.props;
      onUserChange({ signedIn: false, givenName: "" });
    } catch (er) {
      showError(`error signing out ${er}`);
    }
  }

  showModal() {
    const clientId = window.ENV.GOOGLE_CLIENT_ID;
    const { showError } = this.props;
    if (!clientId) {
      showError("Missing environment variable GOOGLE_CLIENT_ID");
      return;
    }
    this.setState({ showing: true });
  }

  render() {
    const { user } = this.props;
    const { showing, disabled } = this.state;
    if (user.signedIn) {
      return (
        <NavDropdown title={user.givenName} id="user">
          <MenuItem onClick={this.signOut}>Sign out</MenuItem>
        </NavDropdown>
      );
    } else {
      return (
        <>
          <NavItem onClick={this.showModal}>Sign in</NavItem>
          <Modal show={showing} onHide={this.hideModal} bsSize="sm">
            <Modal.Header closeButton>
              <Modal.Title>Sign</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Button
                block
                bsStyle="primary"
                onClick={this.signIn}
                disabled={disabled}
              >
                <img
                  src="https://developers.google.com/identity/images/btn_google_signin_light_normal_web.png"
                  alt="Sign In"
                />
              </Button>
            </Modal.Body>
            <Modal.Footer>
              <Button bsStyle="link" onClick={this.hideModal}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      );
    }
  }
}
export default withToast(SignInNavItem);
