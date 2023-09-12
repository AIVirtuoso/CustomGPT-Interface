import styles from "./analytics.module.scss";
import { getClientConfig } from "../config/client";
import { useMemo } from "react";
import { useMobileScreen } from "../utils";
import { useAppConfig } from "../store";
import { IconButton } from "./button";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import React, { useEffect, useState } from "react";
import { sendRequestsWithToken_as_JSON } from "../utils/fetch";

import MessageIcon from "../icons/message.svg";

const Analytics_card = (props: { text: string; value: any }) => {
  return (
    <>
      <div className={styles["chat-message-item"]}>
        <div style={{ marginRight: "auto", marginLeft: "auto" }}>
          <p style={{ fontSize: "25px" }}>{props.text}</p>
          <p style={{ fontSize: "40px" }}>{props.value}</p>
        </div>
        <MessageIcon style={{ marginRight: "auto", marginLeft: "auto" }} />
      </div>
    </>
  );
};

const Total_chat_sessions = () => {
  const [totalChatSessions, setTotalChatSessions] = useState();
  useEffect(() => {
    sendRequestsWithToken_as_JSON("total_chat_sessions", {
      body: JSON.stringify({
        botId: "64fe783870384d6dcbd0f8d4",
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("chat_seesion: ", totalChatSessions);
        setTotalChatSessions(result);
      });
  }, []);
  return (
    <Analytics_card text="Total Chat Sessions" value={totalChatSessions} />
  );
};

const Messages_per_Session = () => {
  const [messagesPerSession, setMessagesPerSession] = useState();
  useEffect(() => {
    sendRequestsWithToken_as_JSON("messages_per_session", {
      body: JSON.stringify({
        botId: "64fe783870384d6dcbd0f8d4",
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("chat_seesion: ", result);
        setMessagesPerSession(result.message_per_session);
      });
  }, []);
  return (
    <Analytics_card text="Messages per Session" value={messagesPerSession} />
  );
};

const Messages_for_specific_duration = () => {
  const [messagesPerSession, setMessagesPerSession] = useState();
  useEffect(() => {
    sendRequestsWithToken_as_JSON("messages_per_session", {
      body: JSON.stringify({
        botId: "64fe783870384d6dcbd0f8d4",
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("chat_seesion: ", result);
        setMessagesPerSession(result.message_per_session);
      });
  }, []);
  return (
    <Analytics_card text="Messages per Session" value={messagesPerSession} />
  );
}

export const Analytics = () => {
  const clientConfig = useMemo(() => getClientConfig(), []);
  const isMobileScreen = useMobileScreen();
  const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;
  const config = useAppConfig();

  return (
    <div className={styles.chat}>
      <div className="window-header" data-tauri-drag-region>
        <div className={`window-header-title ${styles["chat-body-title"]}`}>
          <div
            className={`window-header-main-title ${styles["chat-body-main-title"]}`}
          >
            Analytics
          </div>
          <div className="window-header-sub-title"></div>
        </div>
        {showMaxIcon && (
          <div className="window-action-button">
            <IconButton
              icon={config.tightBorder ? <MinIcon /> : <MaxIcon />}
              bordered
              onClick={() => {
                config.update(
                  (config) => (config.tightBorder = !config.tightBorder),
                );
              }}
            />
          </div>
        )}
      </div>
      <div className={styles["analytics-item"]}>
        <Total_chat_sessions />
        <Messages_per_Session />
      </div>
      <div className={styles["analytics-item"]}>
        <Messages_for_specific_duration />
      </div>
      {/* <Analytics_card></Analytics_card> */}
    </div>
  );
};
