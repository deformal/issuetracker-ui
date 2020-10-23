import React from "react";
import { Link } from "react-router-dom";
import { withRouter } from "react-router-dom";
import URLSearchParams from "url-search-params";
import {
  Button,
  ButtonToolbar,
  FormGroup,
  FormControl,
  ControlLabel,
  InputGroup,
  Row,
  Col,
} from "react-bootstrap";

class IssueFilter extends React.Component {
  constructor({ location: { search } }) {
    super();
    const params = new URLSearchParams(search);
    this.state = {
      status: params.get("status") || "",
      effortMin: params.get("effortMin") || "",
      effortMax: params.get("effortMax") || "",
      changed: false,
    };
    this.onChangeStatus = this.onChangeStatus.bind(this);
    this.onChangeEffortMin = this.onChangeEffortMin.bind(this);
    this.onChangeEffortMax = this.onChangeEffortMax.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
    this.showOtiginalFilter = this.showOriginalFilter.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {
      location: { search: prevSearch },
    } = prevProps;
    const {
      location: { search },
    } = this.props;
    if (prevSearch !== search) {
      this.showOtiginalFilter();
    }
  }

  onChangeStatus(e) {
    this.setState({ status: e.target.value, changed: true });
  }
  onChangeEffortMin(e) {
    const effortString = e.target.value;
    if (effortString.match(/^\d*$/)) {
      this.setState({ effortMin: e.trget.value, changed: true });
    }
  }
  onChangeEffortMax(e) {
    const effortString = e.target.value;
    if (effortString.match(/^\d*$/)) {
      this.setState({ effortMax: e.target.value, changed: true });
    }
  }

  showOriginalFilter() {
    const {
      location: { search },
    } = this.props;
    const params = new URLSearchParams(search);
    this.setState({
      status: params.get("status") || "",
      effortMin: params.get("effortMin") || "",
      effortMax: params.get("effrotMax") || "",
      changed: false,
    });
  }
  applyFilter() {
    const { status, effortMax, effortMin } = this.state;
    const { history, urlBase } = this.props;
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (effortMin) params.set("effortMin", effortMin);
    if (effortMax) params.set("effortMax", effortMax);
    const search = params.toString() ? `?${params.toString()}` : "";
    history.push({ pathname: urlBase, search });
  }

  render() {
    const {
      location: { search },
    } = this.props; //the value of the location parameter i.e search will be accessed here in search.
    const params = new URLSearchParams(search); //now search is passed here.
    const { status, changed } = this.state;
    const { effortMin, effortMax } = this.state;
    return (
      <Row className="selection">
        <Col xs={6} sm={4} md={3} lg={2}>
          <FormGroup>
            <ControlLabel>Status:</ControlLabel>
            <FormControl
              componentClass="select"
              value={status}
              onChange={this.onChangeStatus}
            >
              <option value="">All</option>
              <option value="New">New</option>
              <option value="Fixed">Fixed</option>
              <option value="Closed">Closed</option>
              <option value="Assigned">Assigned</option>
            </FormControl>
          </FormGroup>
        </Col>
        <Col xs={6} sm={4} md={3} lg={2}>
          <FormGroup>
            <ControlLabel>Effort Between</ControlLabel>
            <InputGroup>
              <FormControl
                value={effortMin}
                onChange={this.onChangeEffortMin}
              />
              <InputGroup.Addon>-</InputGroup.Addon>
              <FormControl
                value={effortMax}
                onChange={this.onChangeEffortMax}
              />
            </InputGroup>
          </FormGroup>
        </Col>
        <Col xs={6} sm={4} md={3} lg={2}>
          <FormGroup>
            <ControlLabel>&nbsp;</ControlLabel>

            <ButtonToolbar>
              <Button
                bsStyle="primary"
                type="button"
                onClick={this.applyFilter}
              >
                Apply
              </Button>
              {"    "}
              <Button
                bsStyle="primary"
                type="button"
                onClick={this.showOtiginalFilter}
                disabled={!changed}
              >
                Reset
              </Button>
            </ButtonToolbar>
          </FormGroup>
        </Col>
      </Row>
    );
  }
}
export default withRouter(IssueFilter);
