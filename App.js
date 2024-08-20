import { StatusBar } from "expo-status-bar";
import { Alert, Button, Platform, StyleSheet, Text, View } from "react-native";

import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");
  var pushToken = null;
  useEffect(() => {
    async function configurePushNotifications() {
      //check notification permission on app start up
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;
      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required ",
          "you will not receive push unless you allow the permission"
        );
        return;
      }

      pushToken = Notifications.getExpoPushTokenAsync({
        projectId: "983f6fbb-c334-4c4f-a58f-ce71ac649a22",
      });
      console.log("pushtoken  " + (await pushToken).data);

      setExpoPushToken((await pushToken).data);

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
        });
      }
    }
    configurePushNotifications();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (notification) => {
        console.log("notification received");
        console.log(notification);

        //const place = notification.notification.request.content.data.place;
        // console.log(place);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  function sendPushNotificationHandler() {
    //send a notification to the device bu using the expo REST API
    console.log("sending push to id" + expoPushToken);
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        title: "Standup Meeting Confirmed",
        body: "This is a reminder that our weekly is scheduled for tomorrow, 25, at 08:00. We will be meeting at Google meet, and our agenda includes:",
      }),
    });
  }

  return (
    <View style={styles.container}>
      <Button
        title=" Send Push Notification"
        onPress={sendPushNotificationHandler}
      ></Button>

      <Text>Sending a test push niotification by using the expo token</Text>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
