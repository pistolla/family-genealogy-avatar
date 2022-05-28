import React from "react";
// import { BrowserRouter, Redirect, Route, Switch } from "react-router";
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import GenerateAvatar from "./GenerateAvatar";
import Home from "./Home";
import Login from "./Login";
import Register from "./Register";

function Main(props) {
  const { isLoggedIn, handleLoggedIn } = props;

  const showLogin = () => {
    return isLoggedIn ? (
      <Redirect to="/home" />
    ) : (
      <Login handleLoggedIn={handleLoggedIn} />
    );
  };

  const showHome = () => {
    return isLoggedIn ? <Home /> : <Redirect to="/login" />;
  };
  const showGenerator = () => {
    return isLoggedIn ? <GenerateAvatar /> : <Redirect to="/login" />;
  }
  return (
    <div className="main">
      <BrowserRouter>
        <Switch>
          <Route path="/" exact render={showLogin} />
          <Route path="/login" render={showLogin} />
          <Route path="/register" component={Register} />
          <Route path="/home" render={showHome} />
          <Route path="/mint" render={showGenerator} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}



export default Main;
