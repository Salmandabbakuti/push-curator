"use client";
import { useAddress, useSigner } from "@thirdweb-dev/react";
import { PushAPI, CONSTANTS as PUSH_CONSTANTS } from "@pushprotocol/restapi";
import { message, Button } from "antd";
import styles from "./page.module.css";

const ARTICLE_AGGREGATOR_CHANNEL_ADDRESS =
  "0xc7203561EF179333005a9b81215092413aB86aE9";

export default function Home() {
  const address = useAddress();
  const signer = useSigner();
  console.log("Address:", address);

  const sendNotification = async () => {
    if (!address || signer)
      return message.error("Connect your wallet to send notifications");
    const pushUser = await PushAPI.initialize(signer, {
      env: PUSH_CONSTANTS.ENV.STAGING
    });

    const sendNotifRes = await pushUser.channel.send(["*"], {
      notification: { title: "test", body: "test" },
      payload: { category: 1 }
    });
    console.log("Send notification response:", sendNotifRes);
    message.success("Notification sent successfully");
  };

  return (
    <main className={styles.main}>
      {address === ARTICLE_AGGREGATOR_CHANNEL_ADDRESS ? (
        <form>
          <input type="text" placeholder="Notification Title" />
          <input type="text" placeholder="Notification Body" />
          <input type="text" placeholder="Notification Category" />
        </form>
      ) : (
        <p>
          Welcome to Article Aggregator! Connect wallet and Choose your
          notification preferences to receive notifications.
        </p>
      )}
    </main>
  );
}
