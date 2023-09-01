import { useEffect } from "react";
import { _Chat } from "./chat";

import { useState } from "react";
import { sendRequestsWithToken_as_JSON } from "../utils/fetch";

export function ChatLogs() {
  const [messages, setMessages] = useState([]);
  const [chatLogs, setChatLogs] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);


  useEffect(() => {
    sendRequestsWithToken_as_JSON("find-chatlogs", {})
      .then((response) => response.json())
      .then((result) => {
        console.log("result: ", result);
        setChatLogs(result);
      });
  }, [])

  return (
      <_Chat 
        isChatLogs={true}
      />
  )
}