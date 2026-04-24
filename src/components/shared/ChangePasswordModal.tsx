import { Form, Input, Modal } from "antd";

export default function ChangePasswordModal({ changePasswordOpen, handleCloseChangePassword, handleSubmitChangePassword, changePasswordMutation, changePasswordForm } : {
  changePasswordOpen: boolean;
  handleCloseChangePassword: () => void;
  handleSubmitChangePassword: () => void;
  changePasswordMutation: { isPending: boolean };
  changePasswordForm: ReturnType<typeof Form.useForm>[0];
}) {
    return (
        <Modal
        title="Đổi mật khẩu"
        open={changePasswordOpen}
        onCancel={handleCloseChangePassword}
        onOk={handleSubmitChangePassword}
        okText="Cập nhật"
        cancelText="Hủy"
        width={420}
        destroyOnClose
        okButtonProps={{ loading: changePasswordMutation.isPending }}
        cancelButtonProps={{ disabled: changePasswordMutation.isPending }}
      >
        <Form form={changePasswordForm} layout="vertical">
          <Form.Item
            label="Mật khẩu hiện tại"
            name="oldPassword"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới" },
              { min: 8, message: "Mật khẩu mới tối thiểu 8 ký tự" },
            ]}
          >
            <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                },
              }),
            ]}
          >
            <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>
        </Form>
      </Modal>
    )
}