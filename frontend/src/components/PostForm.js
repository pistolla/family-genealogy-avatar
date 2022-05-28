import { InboxOutlined } from "@ant-design/icons";
import { Form, Input, Upload } from "antd";
import React, { forwardRef } from "react";

export const PostForm = forwardRef((props, formRef) => {
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 }
  };
  const normFile = (e) => {
    console.log("Upload event:", e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  

  return (
    <Form name="validate_other" {...formItemLayout} ref={formRef}>
      <Form.Item
        name="description"
        label="Head Name"
        rules={[
          {
            required: true,
            message: "Enter the Patriach or Matriach full name!"
          }
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="* Head Photo">
        <Form.Item
          name="uploadPost"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          noStyle
          rules={[
            {
              required: true,
              message: "Please select the Patriach or Matriach passport photo!"
            }
          ]}
        >
          <Upload.Dragger name="files" beforeUpload={() => false}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
          </Upload.Dragger>
        </Form.Item>
      </Form.Item>
    </Form>
  );
});
