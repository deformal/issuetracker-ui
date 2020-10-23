import React from "react";
import Component from "react-dom";
import PropTypes from "prop-types";
import {
  Form,
  FormControl,
  FormGroup,
  ControlLabel,
  Button
} from "react-bootstrap";

export default class IssueAdd extends React.Component {
  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(e) {
    e.preventDefault();
    const formData = document.forms.issueAdd;
    const issue = {
      owner: formData.owner.value,
      title: formData.title.value,
      due: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10)
    };
    this.props.createIssue(issue);
    formData.owner.value = "";
    formData.title.value = "";
  }
  render() {
    return (
      <Form inline name="issueAdd" onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Owner:</ControlLabel>
          {"  "}
          <FormControl type="text" name="owner" />
        </FormGroup>
        {"  "}
        <FormGroup>
          <ControlLabel>Title:</ControlLabel>
          {"  "}
          <FormControl type="text" name="title" />
        </FormGroup>
        {"    "}
        <Button bsStyle="primary" type="submit">
          Add
        </Button>
      </Form>
    );
  }
}
