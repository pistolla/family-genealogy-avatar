import { InboxOutlined } from "@ant-design/icons";
import { Form, Input, Upload } from "antd";
import React, { forwardRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

export const PostForm = forwardRef((props, formRef) => {
  const [image, setImage] = useState("");
  const [cropper, setCropper] = useState();
  const [uploaded, setUploaded] = useState(false)
  const onChange = (e) => {
    e.preventDefault();
    let files;
    if (e.dataTransfer) {
      files = e.dataTransfer.files;
    } else if (e.target) {
      files = e.target.files;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
    };
    reader.readAsDataURL(files[0]);
  };

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

  const onCrop = () => {
    if (cropper !== 'undefined') {
      formRef.uploadPost[0].originFileObj = cropper.getCroppedCanvas().toDataURL()
    }
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
              src={formRef.uploadPost[0].originFileObj}
              style={{ height: 400, width: "100%" }}
              initialAspectRatio={16 / 9}
              guides={false}
              crop={onCrop}
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
    </Form>
  );
});
