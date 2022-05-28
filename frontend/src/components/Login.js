import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Form, Input } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import LoginBg from "../assets/images/login-bg.png";


function Login(props) {
  const { handleLoggedIn } = props;

  const onFinish = (values) => {
    handleLoggedIn({"Token": "XXXXXXXXXXXX"});
    // const { username, password } = values;
    // const opt = {
    //   method: "POST",
    //   url: `${BASE_URL}/signin`,
    //   data: {
    //     username: username,
    //     password: password
    //   },
    //   headers: { "Content-Type": "application/json" }
    // };
    // axios(opt)
    //   .then((res) => {
    //     if (res.status === 200) {
    //       console.log(res.data);
    //       const { data } = res;
    //       handleLoggedIn(data);
    //       message.success("Login succeed!");
    //     }
    //   })
    //   .catch((err) => {
    //     console.log("login failed: ", err.message);
    //     message.error("Login failed!");
    //   });
  };

  return (
    <div className="login-container">
      <div className="login-left" style={{ backgroundImage: 'url(' + LoginBg +')'}}></div>
      <div className="login-right">
        <Form name="normal_login" className="login-form" onFinish={onFinish}>
          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: "Please enter your username!"
              }
            ]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please enter your password!"
              }
            ]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              Log in
            </Button>
            Or <Link to="/register">register now!</Link>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Login;
