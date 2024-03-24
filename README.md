# Push Curator

Push Curator is a project aimed at delivering personalized news notifications to users based on their interests. It utilizes push protocols and custom notification channels to allow users to subscribe to specific categories and receive relevant updates accordingly.

## Overview:

Push Curator provides the following main functionalities:

1. **Creating Channel Settings:** Channel admin can create notification channels with settings for different categories such as tech, business, education, politics, entertainment, etc.

2. **Subscribing to Channels:** Users can opt-in to channels and toggle their interests by selecting the categories they are interested in receiving notifications for.

3. **Sending Notifications:** Channel admin can send notifications to subscribed users based on their selected categories.

### Getting Started:

```sh
npm install

npm run dev
```

Open http://localhost:3000 with your browser to see the result.

### Demo
![Screen2](https://github.com/Salmandabbakuti/push-curator/assets/29351207/99aa77c9-51f5-4d9e-9ca1-6e54a22592e4)

![Screen1](https://github.com/Salmandabbakuti/push-curator/assets/29351207/67a00cb5-b4a8-42fd-aaef-9724a3b4bae4)

### How its been implemented:

### Initializing SDK

```ts
import { PushAPI, CONSTANTS } from "@pushprotocol/restapi";

const pushUser = await PushAPI.initialize(signer, {
  env: CONSTANTS.ENV.STAGING
});
```

### Creating Channel with Settings

```ts
const createChannelSettingRes = pushUser.channel.setting([
  {
    type: 1, // Boolean type
    default: 1,
    description: "Tech"
  },
  {
    type: 1, // Boolean type
    default: 1,
    description: "Business"
  }
]);
```

### Subscribing to Channel with Settings

```ts
const response = await userAlice.notification.subscribe(
  `eip155:11155111:${channelAddress}`,
  {
    settings: [
      // settings are dependent on channel
      { enabled: true }, // setting 1
      { enabled: false }, // setting 2
      { enabled: true } // setting 3
    ]
  }
);
```

### Sending Notification with category

```ts
await pushUser.channel.send(["*"], {
  notification: {
    title: "New Notification",
    body: "This is a new notification"
  },
  payload: {
    category: 1, // category id, setting index in this case(tech 1, business 2, education 3, etc.)
    cta: "https://example.com/cta"
  }
});
```
