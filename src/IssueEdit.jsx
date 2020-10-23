import React from "react";
import graphQLFetch from "./graphQLFetch";
import { Link } from "react-router-dom";
import NumInput from "./NumInput.jsx";
import DateInput from "./DateInput.jsx";
import TextInput from "./TextInput.jsx";
import Toast from "./Toast.jsx";
import Store from "./Store.js";
import withToast from "./withToast.jsx";
import UserContext from "./UserContext.js";

import {
  Button,
  Badge,
  Col,
  Panel,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  ButtonToolbar,
  Alert,
  ButtonGroup,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
class IssueEdit extends React.Component {
  static async fetchData(match, search, showError) {
    const query = `query issue($id:Int!){
      issue(id:$id){
        id title status owner
        effort created due description
      }
    }`;
    const {
      params: { id },
    } = match;
    const x = Number(id);
    const result = await graphQLFetch(query, { id: x }, showError);
    return result;
  }
  constructor() {
    super();
    const issue = Store.initialData ? Store.initialData.issue : null;
    delete Store.initialData;
    this.state = {
      issue,
      invalidFields: {},
      showingValidation: false,
    };
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onValidityChange = this.onValidityChange.bind(this);
    this.showValidation = this.showValidation.bind(this);
    this.dismissValidation = this.dismissValidation.bind(this);
  }

  componentDidMount() {
    const { issue } = this.state;
    if (issue == null) this.loadData();
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { id: prevId },
      },
    } = prevProps;
    const {
      match: {
        params: { id },
      },
    } = this.props;
    if (id !== prevId) {
      this.loadData();
    }
  }
  onChange(event, naturalValue) {
    const { name, value: textValue } = event.target;
    const value = naturalValue === undefined ? textValue : naturalValue;
    this.setState((prevState) => ({
      issue: { ...prevState.issue, [name]: value },
    }));
  }

  onValidityChange(event, valid) {
    const { name } = event.target;
    this.setState((prevState) => {
      const invalidFields = { ...prevState.invalidFields, [name]: !valid };
      if (valid) delete invalidFields[name];
      return { invalidFields };
    });
  }

  async handleSubmit(e) {
    e.preventDefault();
    this.showValidation();
    const { issue, invalidFields } = this.state;
    const { showSuccess, showError } = this.props;
    if (Object.keys(invalidFields).length !== 0) return;
    const query = `mutation issueUpdate(
   $id:Int!
   $changes:IssueUpdateInputs!
    )
    {
      issueUpdate(
        id:$id
        changes:$changes
      ){
        id title status owner effort
        created due description
      }
    }`;
    const { id, created, ...changes } = issue;
    const data = await graphQLFetch(query, { changes, id }, showError);
    if (data) {
      this.setState({ issue: data.issueUpdate });
      showSuccess("Issue updated successfully");
    }
  }

  async loadData() {
    const query = `query issue($id:Int!){
   issue(id:$id){
     id title status owner effort created due description
   }
  }`;
    const { match, showError } = this.props;
    const data = await IssueEdit.fetchData(match, null, showError);
    this.setState({ issue: data ? data.issue : {}, invalidFields: {} });
  }
  showValidation() {
    this.setState({ showingValidation: true });
  }
  dismissValidation() {
    this.setState({ showingValidation: false });
  }

  render() {
    const { issue } = this.state;
    if (issue == null) return null;
    const {
      issue: { id },
    } = this.state;
    const {
      match: {
        params: { id: propsId },
      },
    } = this.props;
    let x = propsId;
    if (id == null) {
      if (propsId !== null) {
        return (
          <div>
            <h3>{`Issue with ID ${propsId} not found.`}</h3>
          </div>
        );
      }

      return null;
    }

    const { invalidFields, showingValidation } = this.state;
    let validationMessage;
    console.log(invalidFields);
    if (Object.keys(invalidFields).length !== 0 && showingValidation) {
      validationMessage = (
        <Alert bsStyle="danger" onDismiss={this.dismissValidation}>
          Please correct invalid fiels before submitting.
        </Alert>
      );
    }
    const {
      issue: { title, status },
    } = this.state;
    const {
      issue: { owner, effort, description },
    } = this.state;
    const {
      issue: { created, due },
    } = this.state;

    const user = this.context;

    return (
      <Panel>
        <Panel.Heading>
          <Panel.Title>{`Editing issue: ${id}`}</Panel.Title>
        </Panel.Heading>
        <Panel.Body>
          <Form horizontal onSubmit={this.handleSubmit}>
            <FormGroup>
              <Col sm={3} lg={2} componentClass={ControlLabel}>
                Created
              </Col>
              <Col sm={9}>
                <FormControl.Static>
                  {created.toDateString()}
                </FormControl.Static>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} lg={2} componentClass={ControlLabel}>
                Status
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass="select"
                  name="status"
                  value={status}
                  onChange={this.onChange}
                >
                  <option value="New">New</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Fixed">Fixed</option>
                  <option value="Closed">Closed</option>
                </FormControl>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} lg={2} componentClass={ControlLabel}>
                Owner
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  name="owner"
                  value={owner}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} lg={2} componentClass={ControlLabel}>
                Effort
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={NumInput}
                  name="effort"
                  value={effort}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>

            <FormGroup validationState={invalidFields.due ? "error" : null}>
              <Col sm={3} lg={2} componentClass={ControlLabel}>
                Due
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={DateInput}
                  onValidityChange={this.onValidityChange}
                  name="due"
                  value={due}
                  onChange={this.onChange}
                  key={id}
                />
                <FormControl.Feedback />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} lg={2} componentClass={ControlLabel}>
                Title
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  name="title"
                  value={title}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} lg={2} componentClass={ControlLabel}>
                Description
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass={TextInput}
                  tag="textarea"
                  name="description"
                  rows={8}
                  cols={50}
                  value={description}
                  onChange={this.onChange}
                  key={id}
                />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col smOffset={2} sm={6} componentClass={ControlLabel}>
                <ButtonToolbar>
                  <ButtonGroup>
                    <Button
                      bsStyle="primary"
                      type="submit"
                      disabled={!user.signedIn}
                    >
                      Submit
                    </Button>
                    <LinkContainer to="/issues">
                      <Button bsStyle="link">Back</Button>
                    </LinkContainer>
                  </ButtonGroup>
                </ButtonToolbar>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col smOffset={2} sm={9}>
                {validationMessage}
              </Col>
            </FormGroup>
          </Form>
        </Panel.Body>
        <Panel.Footer>
          <Link to={`/edit/${id - 1}`}>
            <Badge> Previous </Badge>
          </Link>
          {"  | "}
          <Link to={`/edit/${id + 1}`}>
            <Badge> Next </Badge>
          </Link>
        </Panel.Footer>
      </Panel>
    );
    return null;
  }
}
IssueEdit.contextType = UserContext;
const IssueEditWithToast = withToast(IssueEdit);
IssueEditWithToast.fetchData = IssueEdit.fetchData;
export default IssueEditWithToast;
