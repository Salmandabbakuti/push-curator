"use client";
import { Divider, Layout } from "antd";
import { ConnectWallet, useAddress } from "@thirdweb-dev/react";
import NotificationDrawer from "./Notifications";
import "antd/dist/reset.css";

const { Header, Footer, Content } = Layout;

export default function SiteLayout({ children }) {
  const account = useAddress();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 99,
          padding: 0,
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <h3>Push Curator</h3>
        <div style={{ display: "flex", alignItems: "center" }}>
          {account && <NotificationDrawer />}
          <ConnectWallet
            theme={"light"} // light | dark
            switchToActiveChain={true}
            hideTestnetFaucet={false}
            modalSize={"compact"} // compact | wide
            termsOfServiceUrl="https://example.com/terms"
            privacyPolicyUrl="https://example.com/privacy"
          />
        </div>
      </Header>

      <Content
        style={{
          margin: "12px 8px",
          padding: 12,
          minHeight: "100%",
          color: "black",
          maxHeight: "100%"
        }}
      >
        {children}
      </Content>
      <Divider plain />
      <Footer style={{ textAlign: "center" }}>
        <a
          href="https://github.com/Salmandabbakuti"
          target="_blank"
          rel="noopener noreferrer"
        >
          ©{new Date().getFullYear()} Salman Dabbakuti. Powered by Push Protocol
        </a>
        <p style={{ fontSize: "12px" }}>v0.0.2</p>
      </Footer>
    </Layout>
  );
}
