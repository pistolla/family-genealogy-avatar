import { Button, Modal } from "antd";
import React, { Component } from "react";
import { PostForm } from "./PostForm";


class CreatePostButton extends Component {
  
  state = {
    visible: false,
    confirmLoading: false
  };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = () => {
    this.setState({
      confirmLoading: true
    });

    // persist data
    this.postForm
      .validateFields()
      .then((form) => {
        console.log('ValidaTefileds()')
        const { description, uploadPost } = form;
        const { type, originFileObj } = uploadPost[0];
        const postType = type.match(/^(image)/g)[0];
        if (postType) {
          let files = JSON.parse(localStorage.getItem("files"))
          console.log(files)
          if (!files) {
            files = []
          }
          if ('caches' in window) {
            console.log('caches')
            let uniqueId = new Date().getTime().toString(36) + new Date().getUTCMilliseconds();
            let url = 'http://localhost:3000'
            console.log(uniqueId)
            this.getBase64(originFileObj, (result) => {
              console.log(result)
              
              files.push({
                id: uniqueId,
                name: description,
                description: description,
                file: result,
                status: "CREATED"
              });
              localStorage.setItem('files', JSON.stringify(files));
              console.log('stored files')
              this.setState({ confirmLoading: false });
              this.handleCancel();
              window.location = "/mint"
            });

          } else {
            this.setState({ confirmLoading: false });
          }
        }
      }).catch((err) => {
        console.log("err ir validate form -> ", err);
      });
  };

  // storeFile = async (url, uniqueId, data) => {
  //   var cache = await caches.open(uniqueId)
  //   cache.put(url, data);
  //   return data;
  // }

  getBase64 = (file, cb) => {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      cb(reader.result)
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

  handleCancel = () => {
    console.log("Clicked cancel button");
    this.setState({
      visible: false
    });
  };

  render() {
    const { visible, confirmLoading } = this.state;
    return (
      <div>
        <Button type="primary" onClick={this.showModal} >
          {this.props.type == "head" ? "Add Family Head" : "Add Family Member"}
        </Button>
        <Modal
          title={this.props.type == "head" ? "Add Family Head" : "Add Family Member"}
          visible={visible}
          onOk={this.handleOk}
          okText="Generate Avatar"
          confirmLoading={confirmLoading}
          onCancel={this.handleCancel}
        >
          <PostForm ref={(refInstance) => (this.postForm = refInstance)} />
        </Modal>
      </div>
    );
  }
}

export default CreatePostButton;
