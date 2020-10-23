import React from "react";
import IssueFilter from "./IssueFilter.jsx";
import { Panel, Pagination, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import store from "./Store.js";
import IssueTable from "./IssueTable.jsx";
import graphQLFetch from "./graphQLFetch.js";
import IssueDetail from "./IssueDetail.jsx";
import URLSearchParams from "url-search-params"; //the url search parameter are installed in here and are passed to other components
import withToast from "./withToast.jsx";
const SECTION_SIZE = 5;

function PageLink({ params, page, activePage, children }) {
  params.set("page", page);
  if (page === 0) return React.cloneElement(children, { disabled: true });
  return (
    <LinkContainer
      isActive={() => page === activePage}
      to={{ search: `?${params.toString()}` }}
    >
      {children}
    </LinkContainer>
  );
}

class IssueList extends React.Component {
  static async fetchData(match, search, showError) {
    const params = new URLSearchParams(search);
    const vars = { hasSelection: false, selectedId: 0 };
    if (params.get("status")) vars.status = params.get("status");
    const effortMin = parseInt(params.get("effortMin"), 10);
    if (!Number.isNaN(effortMin)) vars.effortMin = effortMin;
    const effortMax = parseInt(params.get("effortMax"), 10);
    if (!Number.isNaN(effortMax)) vars.effortMax = effortMax;
    let page = parseInt(params.get("page"), 10);
    if (Number.isNaN(page)) page = 1;
    vars.page = page;

    const {
      params: { id },
    } = match;
    const idInt = parseInt(id, 10);
    if (!Number.isNaN(idInt)) {
      vars.hasSelection = true;
      vars.selectedId = idInt;
    }
    const query = `query List(
      $status : StatusType
      $effortMin: Int
      $effortMax : Int
      $hasSelection : Boolean!
      $selectedId : Int!
      $page : Int!
    ){
      List(
        status : $status
        effortMin : $effortMin
        effortMax : $effortMax
        page: $page
      )
      { 
        issues
        {id title status owner created effort due}
        pages
      }    
         
            issue(id : $selectedId) @include (if : $hasSelection){id description }
    }`;

    const data = await graphQLFetch(query, vars, showError, null);
    return data;
  }
  constructor() {
    super();
    const initialData = store.initialData || { List: {} };
    const {
      List: { issues, pages },
      issue: selectedIssue,
    } = initialData;
    delete store.initialData;
    this.state = {
      issues,
      selectedIssue,
      loading: true,
      pages,
    };

    this.closeIssue = this.closeIssue.bind(this);
    this.deleteIssue = this.deleteIssue.bind(this);
  }

  componentDidMount() {
    const { issues } = this.state;
    if (issues == null) {
      this.loadData();
      console.log("the componenet is loaded");
    } else {
      console.log("no issues");
    }
  }

  componentDidUpdate(prevProps) {
    try {
      const {
        location: { search: prevSearch },
        match: {
          params: { id: prevId },
        },
      } = prevProps;
      const {
        location: { search },
        match: {
          params: { id },
        },
      } = this.props;
      if (prevSearch !== search || prevId !== id) {
        this.loadData();
        console.log(`component did update is working fine `);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async loadData() {
    try {
      const {
        location: { search },
        match,
        showError,
      } = this.props;
      const data = await IssueList.fetchData(match, search, showError);
      if (data) {
        this.setState({
          issues: data.List.issues,
          selectedIssue: data.issue,
          pages: data.List.pages,
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async closeIssue(index) {
    const { showSuccess, showError } = this.props;
    const query = `mutation issueClose($id:Int!){
    issueUpdate(id:$id,changes:{status:Closed}){
      id title status owner effort created due description
    }
  }`;
    const { issues } = this.state;
    const data = await graphQLFetch(query, { id: issues[index].id }, showError);
    if (data) {
      this.setState((prevState) => {
        const newList = [...prevState.issues];
        newList[index] = data.issueUpdate;
        return { issues: newList };
      });
    } else {
      this.loadData();
    }
  }

  async deleteIssue(index) {
    const { showSuccess, showError } = this.props;
    const query = `mutation issueDelete($id:Int!){
    issueDelete(id:$id)
  }`;
    const { issues } = this.state;
    const {
      location: { pathname, search },
      history,
    } = this.props;
    const { id } = issues[index];
    const data = await graphQLFetch(query, { id }, showError);
    if (data && data.issueDelete) {
      this.setState((prevState) => {
        const newList = [...prevState.issues];
        if (pathname === `/issues/${id}`) {
          history.push({ pathname: "/issues", search });
        }
        newList.splice(index, 1);
        return { issues: newList };
      });
      const undoMessage = (
        <span>
          {`Deleted issue${id} successfully.`}
          <Button bsStyle="link" onClick={() => this.restoreIssue(id)}>
            UNDO
          </Button>
        </span>
      );
      showSuccess(undoMessage);
    } else {
      this.loadData();
    }
  }

  async restoreIssue(id) {
    const query = `mutation issueRestore($id:Int!){
      issueRestore(id:$id)
    }`;
    const { showSuccess, showError } = this.props;
    const data = await graphQLFetch(query, { id }, showError);
    if (data) {
      showSuccess(`issue${id} restored  successfully`);
      this.loadData();
    }
  }

  render() {
    const { issues, pages, selectedIssue } = this.state;
    const {
      location: { search },
    } = this.props;
    if (issues == null) return null;
    const style = {
      margin: 30,
    };

    const hasFilter = location.search !== "";
    const params = new URLSearchParams(search);
    let page = parseInt(params.get("page"), 10);
    if (Number.isNaN(page)) page = 1;
    const startPage = Math.floor((page - 1) / SECTION_SIZE) * SECTION_SIZE + 1;
    const endPage = startPage + SECTION_SIZE - 1;
    const prevSection = startPage === 1 ? 0 : startPage - SECTION_SIZE;
    const nextSection = endPage >= pages ? 0 : startPage + SECTION_SIZE;

    const items = [];
    for (let i = startPage; i <= Math.min(endPage, pages); i++) {
      params.set("page", i);
      items.push(
        <PageLink key={i} params={params} activePage={page} page={i}>
          <Pagination.Item>{i}</Pagination.Item>
        </PageLink>
      );
    }
    return (
      <div id="all">
        <Panel defaultExpanded={hasFilter}>
          <Panel.Heading>
            <Panel.Title toggle>Filter</Panel.Title>
          </Panel.Heading>
          <Panel.Body collapsible>
            <IssueFilter urlBase="/issues" />
          </Panel.Body>
        </Panel>

        <hr />
        <IssueTable
          issues={this.state.issues}
          closeIssue={this.closeIssue}
          stat={this.state.Status}
          deleteIssue={this.deleteIssue}
        />
        <hr />
        <IssueDetail issue={selectedIssue} />
        <Pagination>
          <PageLink params={params} page={prevSection}>
            <Pagination.Item>{"<"}</Pagination.Item>
          </PageLink>
          {items}
          <PageLink params={params} page={nextSection}>
            <Pagination.Item>{">"}</Pagination.Item>
          </PageLink>
        </Pagination>
      </div>
    );
  }
}

const IssueListWithToast = withToast(IssueList);
IssueListWithToast.fetchData = IssueList.fetchData;
export default IssueListWithToast;
