import { initializeApp } from "firebase/app";
import { getMessaging , getToken} from "firebase/messaging";


const firebaseConfig = {
  apiKey: "AIzaSyAiJHDxxRHQ908Giz98Cj-smsZA7afcZqs",
  authDomain: "expiry-expert.firebaseapp.com",
  projectId: "expiry-expert",
  storageBucket: "expiry-expert.appspot.com",
  messagingSenderId: "238047407921",
  appId: "1:238047407921:web:d0ac6a979708fb32464a10",
  measurementId: "G-Y52115VP3Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const generateToken = async () => {
  
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
    const token=await getToken(messaging, {
      vapidKey:
      "BI0zo9B0496L0zk-JMxtryrDbI0VkNHEZ1A9dYJ-KUnOArMKPHjlpfHJiq22npcLPcaeYr0q6xmlDsV_9tz23cE",
    });
console.log(token);
   
        console.log("Permission granted");
        // Proceed with setting up notifications
    } else {
        console.log("Permission not granted");
    }

};

