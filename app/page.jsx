"use client";
import { useState } from "react";
import { useAddress, useSigner } from "@thirdweb-dev/react";
import { PushAPI, CONSTANTS as PUSH_CONSTANTS } from "@pushprotocol/restapi";
import { message, Button, Form, Select, Input } from "antd";
import styles from "./page.module.css";

const PUSH_CURATOR_CHANNEL_ADDRESS =
  "0xc7203561EF179333005a9b81215092413aB86aE9";

export default function Home() {
  const [notificationInput, setNotificationInput] = useState({
    title: "",
    body: "",
    category: 6,
    cta: ""
  });
  const address = useAddress();
  const signer = useSigner();
  console.log("Address:", address);
  console.log("Signer:", signer);

  const handleNotificationInputChange = (changedValues) => {
    console.log("Notification input change:", changedValues);
    setNotificationInput({ ...notificationInput, ...changedValues });
  };

  const sendNotification = async () => {
    if (!address || !signer)
      return message.error("Connect your wallet to send notifications");
    if (
      !notificationInput.title ||
      !notificationInput.body ||
      !notificationInput.category ||
      !notificationInput.cta
    )
      return message.error("Please fill all the fields");
    console.log("Sending notification:", notificationInput);
    try {
      const pushUser = await PushAPI.initialize(signer, {
        env: PUSH_CONSTANTS.ENV.STAGING
      });

      const sendNotifRes = await pushUser.channel.send(["*"], {
        notification: {
          title: notificationInput.title,
          body: notificationInput.body
        },
        payload: {
          category: notificationInput.category,
          cta: notificationInput.cta
        }
      });
      console.log("Send notification response:", sendNotifRes);
      message.success("Notification sent successfully");
    } catch (err) {
      console.error("Error sending notification:", err);
      message.error("Failed to send notification. Please try again.");
    }
  };

  return (
    <main className={styles.main}>
      {address === PUSH_CURATOR_CHANNEL_ADDRESS ? (
        <div>
          <Form
            layout="vertical"
            onValuesChange={handleNotificationInputChange}
            initialValues={notificationInput}
            onFinish={sendNotification}
          >
            <h4>Send New Personalized Notification</h4>
            <Form.Item name="title" label="Title">
              <Input required autoFocus value={notificationInput.title} />
            </Form.Item>
            <Form.Item name="body" label="Body">
              <Input.TextArea required value={notificationInput.body} />
            </Form.Item>
            <Form.Item name="category" label="Category" required>
              <Select defaultValue="Other">
                <Select.Option value={1}>Tech</Select.Option>
                <Select.Option value={2}>Business</Select.Option>
                <Select.Option value={3}>Science</Select.Option>
                <Select.Option value={4}>Politics</Select.Option>
                <Select.Option value={5}>Entertainment</Select.Option>
                <Select.Option value={6}>Other</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="cta" label="CTA">
              <Input value={notificationInput.cta} required />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Send Notification
            </Button>
          </Form>
        </div>
      ) : (
        <h2
          style={{
            textAlign: "center",
            marginTop: "40px"
          }}
        >
          Welcome to Push Curator! Connect wallet and choose your notification
          preferences to receive notifications about your favorite topics.
        </h2>
      )}
    </main>
  );
}
