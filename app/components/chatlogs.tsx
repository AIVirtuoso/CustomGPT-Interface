import { useEffect } from "react";
import { _Chat } from "./chat";

import { useState } from "react";
import { sendRequestsWithToken_as_JSON } from "../utils/fetch";
import moment from "moment";
import { useChatStore } from "../store";

export function ChatLogs() {
  const [messages, setMessages] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const chatStore = useChatStore();

  useEffect(() => {
    chatStore.clearSessions();
    sendRequestsWithToken_as_JSON("find-chatlogs", {})
      .then((response) => response.json())
      .then((result) => {
        console.log("result: ", result);
        // console.log(moment(new Date(result[0].createdDate)).format("MM/DD HH:mm"));
        setChatLogs(result);
      });
  }, []);

  return <_Chat isChatLogs={true} chatLogs={chatLogs} />;
}
