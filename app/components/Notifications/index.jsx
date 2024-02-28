import { useState, useEffect } from "react";
import {
  Drawer,
  Button,
  Avatar,
  message,
  notification,
  Divider,
  Row,
  Col,
  Checkbox,
  Card
} from "antd";
import { BellOutlined } from "@ant-design/icons";
import { PushAPI, CONSTANTS as PUSH_CONSTANTS } from "@pushprotocol/restapi";
import { useAddress, useSigner } from "@thirdweb-dev/react";
import NotificationTab from "./NotificationTab";

const ARTICLE_AGGREGATOR_CHANNEL_ADDRESS =
  "0xc7203561EF179333005a9b81215092413aB86aE9";

export default function NotificationDrawer() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationPreferences, setNotificationPreferences] = useState({
    tech: false,
    business: false,
    science: false,
    politics: false,
    entertainment: false,
    other: false
  });
  const [pushSdk, setPushSdk] = useState(null);
  const [stream, setStream] = useState(null);

  const address = useAddress();
  const signer = useSigner();

  const handleNotificationPreferenceChange = (event) => {
    const { name, checked } = event.target;
    console.log("Notification preference change:", name, checked);
    setNotificationPreferences({ ...notificationPreferences, [name]: checked });
  };
  const initializePushSdk = async () => {
    try {
      const pushSdkInstance = await PushAPI.initialize(signer, {
        env: PUSH_CONSTANTS.ENV.STAGING,
        account: address
      });

      const streamInstance = await pushSdkInstance.initStream(
        [
          PUSH_CONSTANTS.STREAM.NOTIF,
          PUSH_CONSTANTS.STREAM.CONNECT,
          PUSH_CONSTANTS.STREAM.DISCONNECT
        ],
        { raw: true }
      );

      setPushSdk(pushSdkInstance);
      setStream(streamInstance);

      // connect to stream
      streamInstance.connect();

      streamInstance.on(PUSH_CONSTANTS.STREAM.CONNECT, handleStreamConnect);
      streamInstance.on(
        PUSH_CONSTANTS.STREAM.DISCONNECT,
        handleStreamDisconnect
      );
      streamInstance.on(PUSH_CONSTANTS.STREAM.NOTIF, handleStreamNotification);
    } catch (error) {
      console.error("Push SDK initialization error:", error);
      message.error("Failed to initialize push SDK");
    }
  };

  const handleStreamConnect = () => {
    console.log("Stream connected");
    setIsSocketConnected(true);
  };

  const handleStreamDisconnect = () => {
    console.log("Stream disconnected");
    setIsSocketConnected(false);
  };

  const handleStreamNotification = (feedItem) => {
    console.log("Received new notification:", feedItem);
    const { message, channel, timestamp } = feedItem;

    notification.info({
      message: message?.notification?.title,
      description: message?.notification?.body,
      duration: 6,
      icon: (
        <Avatar
          shape="circle"
          size="small"
          alt="notification icon"
          src={channel?.icon}
        />
      )
    });

    const data = {
      app: channel?.name,
      icon: channel?.icon,
      url: channel?.url,
      acta: message?.payload.cta,
      asub: message?.notification?.title,
      amsg: message?.notification?.body,
      aimg: message?.notification?.aimg,
      epoch: timestamp
    };

    const newNotification = {
      payload: { data }
    };

    console.log("New notification", newNotification);
    setNotifications((prevNotifications) => [
      newNotification,
      ...prevNotifications
    ]);
  };

  const toggleConnection = () => {
    isSocketConnected ? stream?.disconnect() : stream?.connect();
  };

  const getNotifications = async () => {
    try {
      const response = await pushSdk.notification.list("INBOX", {
        raw: true,
        limit: 20,
        page: 1,
        channels: [ARTICLE_AGGREGATOR_CHANNEL_ADDRESS]
      });
      console.log("Notifications response:", response);
      setNotifications(response);
    } catch (error) {
      console.error("Notification retrieval error:", error);
      message.error("Failed to get notifications");
    }
  };

  const handleOptInToChannel = async () => {
    try {
      const response = await pushSdk.notification.subscribe(
        `eip155:11155111:${ARTICLE_AGGREGATOR_CHANNEL_ADDRESS}`,
        {
          settings: [
            { enabled: notificationPreferences.tech },
            { enabled: notificationPreferences.business },
            { enabled: notificationPreferences.science },
            { enabled: notificationPreferences.politics },
            { enabled: notificationPreferences.entertainment },
            { enabled: notificationPreferences.other }
          ]
        }
      );
      console.log("Opt-in response:", response);
      message.success("Opted-in to channel to receive notifications");
    } catch (error) {
      console.error("Opt-in error:", error);
      message.error("Failed to opt-in to channel");
    }
  };

  useEffect(() => {
    if (address && signer) {
      initializePushSdk();
    }

    return () => {
      if (stream) {
        stream.disconnect();
        stream.removeAllListeners();
      }
    };
  }, [address, signer]);

  useEffect(() => {
    if (pushSdk) {
      getNotifications();
    }
  }, [pushSdk]);

  return (
    <div>
      <BellOutlined
        style={{
          fontSize: "23px",
          color: "white",
          marginRight: "10px"
        }}
        onClick={() => setDrawerVisible(!drawerVisible)}
      />
      <Drawer
        style={{
          color: "black"
        }}
        title="Push Notifications"
        placement="right"
        closeIcon={true}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        autoFocus
      >
        <h3>Push Socket</h3>
        <p>Connection Status: {isSocketConnected ? "🟢" : "🔴"}</p>
        <Button type="primary" shape="round" onClick={toggleConnection}>
          {isSocketConnected ? "Disconnect" : "Connect"}
        </Button>
        <Divider />
        {/* add notification preferences card with toggle for tech, business, politics, entertainment */}
        <Card
          title="Notification Preferences"
          actions={[
            <Button
              key={1}
              type="primary"
              shape="round"
              onClick={handleOptInToChannel}
            >
              Save
            </Button>
          ]}
        >
          <div style={{ width: "100%" }}>
            <Row>
              <Col span={11}>
                <Checkbox
                  value="tech"
                  name="tech"
                  onChange={handleNotificationPreferenceChange}
                  checked={notificationPreferences.tech}
                >
                  Tech
                </Checkbox>
              </Col>
              <Col span={11}>
                <Checkbox
                  name="business"
                  onChange={handleNotificationPreferenceChange}
                  checked={notificationPreferences.business}
                >
                  Business
                </Checkbox>
              </Col>
              <Col span={11}>
                <Checkbox
                  name="science"
                  onChange={handleNotificationPreferenceChange}
                  checked={notificationPreferences.science}
                >
                  Science
                </Checkbox>
              </Col>
              <Col span={11}>
                <Checkbox
                  name="politics"
                  onChange={handleNotificationPreferenceChange}
                  checked={notificationPreferences.politics}
                >
                  Politics
                </Checkbox>
              </Col>
              <Col span={11}>
                <Checkbox
                  name="entertainment"
                  onChange={handleNotificationPreferenceChange}
                  checked={notificationPreferences.entertainment}
                >
                  Entertainment
                </Checkbox>
              </Col>
              <Col span={11}>
                <Checkbox
                  name="other"
                  onChange={handleNotificationPreferenceChange}
                  checked={notificationPreferences.other}
                >
                  Other
                </Checkbox>
              </Col>
            </Row>
          </div>
        </Card>
        <Divider />
        <NotificationTab
          title="Article Aggregator"
          notifications={notifications}
        />
      </Drawer>
    </div>
  );
}
