import { InboxOutlined } from "@ant-design/icons";
import { Form, Input, Upload } from "antd";
import "cropperjs/dist/cropper.css";
import React, { forwardRef, useState } from "react";
import Cropper from "react-cropper";

export const PostForm = forwardRef((props, formRef) => {
  const [image, setImage] = useState("");
  const [cropper, setCropper] = useState();
  const [uploaded, setUploaded] = useState(false);
  
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 }
  };
  const normFile = (e) => {
    console.log("Upload event:", e);
    setUploaded(true);
    setImage(URL.createObjectURL(e.fileList[0].originFileObj))

    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onCrop = (e) => {
    e.preventDefault();
    if (cropper !== 'undefined') {
      formRef.uploadPost[0].originFileObj = cropper.getCroppedCanvas().toDataURL()
    }
  }

  const reUpload = (e) => {
    e.preventDefault();
    setUploaded(false);
  }

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
          {uploaded ?
            <Cropper
              src={image}
              style={{ height: 400, width: "100%" }}
              initialAspectRatio={16 / 9}
              guides={false}
              ref={props.cropperRef}
              dragMode={'move'}
              checkOrientation={true}
              onInitialized={(instance) => setCropper(instance)}
            /> :
            <Upload.Dragger name="files" beforeUpload={() => false}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
            </Upload.Dragger>
          }
        </Form.Item>
      </Form.Item>
      <Form.Item>
        {uploaded ? <button style={{ float: 'right' }} onClick={onCrop}>crop</button> : image != "" ? <button style={{ float: 'right' }} onClick={reUpload}>change Image</button> : ""}
      </Form.Item>
    </Form>
  );
});
