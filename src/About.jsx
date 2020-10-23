import React from "react";
import Store from "../src/Store.js";
import graphQLFetch from "./graphQLFetch.js";

export default class About extends React.Component {
  
  static async fetchData() {
    const data = await graphQLFetch("query{about}");
    return data;
  }
  constructor(props) {
    super(props);
    const apiAbout = Store.initialData ? Store.initialData.about : null;
    delete Store.initialData;
    this.state = { apiAbout };
  }
  async componentDidMount() {
    const { apiAbout } = this.state;
    if (apiAbout == null) {
      const data = await About.fetchData();
      this.setState({ apiAbout: data.about });
    }
  }
  render() {
    const style ={
    display:"flex",
    justifyContent:'center',
    marginLeft:30,
    marginRight:30
    }
    const { apiAbout } = this.state;
    return (
     <div>
      <div className="text-center mx-auto" style={style}>
        <h5>The Issue Tracker app is created by <a href="https://saurabh-jainwal.herokuapp.com">Saurabh Jainwal</a>.
        This app is just a trial version a much bigger app that I wish to develop in the future this version of the Issue Tracker is just for project purposes.
        The basic functionality of the system is close to github issues and stackoverflows issues system but its focused towards home and samll office use where only few people work.
        This provides a easy ui to browse through and simple commands helps to peroform tasks easily.
        The system uses a cloud based database MongoDB Atlas, and uses Heroku servers to be online on the web.
        Thanks for taking time and reading this out much appriciated.
         </h5>
      </div>
      <div className="text-center">
      <h6>{apiAbout}</h6>
      </div>
      </div>
    );
  }
}
