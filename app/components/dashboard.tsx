import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";

import BrainIcon from "../icons/brain.svg";
import CancelIcon from "../icons/cancel.svg";
import ConfirmIcon from "../icons/confirm.svg";
import MaxIcon from "../icons/max.svg";
import MinIcon from "../icons/min.svg";
import ResetIcon from "../icons/reload.svg";
import DeleteIcon from "../icons/delete.svg";
import ChatbotIcon from "../icons/bot.svg"
import AddBotIcon from "../icons/add-bot.svg";
import {
  useChatStore,
  useAppConfig,
  ChatMessage,
} from "../store";

import { createMessage } from "../store";

import {
  useMobileScreen,
} from "../utils";

import Locale from "../locales";

import { IconButton } from "./button";
import styles from "./dashboard.module.scss";
import mask_styles from "./mask.module.scss"

import {
  ListItem,
  Modal,
} from "./ui-lib";

import { useNavigate, Link } from "react-router-dom";
import {
  Path,
} from "../constant";
import { MaskConfig } from "./mask";
import { useMaskStore } from "../store/mask";
import { getClientConfig } from "../config/client";
import { sendRequestsWithToken, sendRequestsWithToken_as_JSON } from "../utils/fetch";




export function SessionConfigModel(props: {
  onClose: () => void;
  setBotName: any;
  handleAddNewBot: () => {}
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const maskStore = useMaskStore();
  const navigate = useNavigate();

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Context.Edit}
        onClose={() => props.onClose()}
        actions={[
          <IconButton
            key="reset"
            icon={<CancelIcon />}
            bordered
            text="Cancel"
            onClick={props.onClose}
          />,
          <IconButton
            key="copy"
            icon={<ConfirmIcon />}
            bordered
            text="Confirm"
            onClick={props.handleAddNewBot}
          />,
        ]}
      >
        <MaskConfig
          mask={session.mask}
          updateMask={(updater) => {
            const mask = { ...session.mask };
            updater(mask);
            chatStore.updateCurrentSession((session) => (session.mask = mask));
          }}
          shouldSyncFromGlobal
          extraListItems={
            session.mask.modelConfig.sendMemory ? (
              <ListItem
                title={`${Locale.Memory.Title} (${session.lastSummarizeIndex} of ${session.messages.length})`}
                subTitle={session.memoryPrompt || Locale.Memory.EmptyContent}
              ></ListItem>
            ) : (
              <></>
            )
          }
          setBotName={props.setBotName}
        ></MaskConfig>
      </Modal>
    </div>
  );
}

function PromptToast(props: {
  showToast?: boolean;
  showModal?: boolean;
  setShowModal: (_: boolean) => void;
  setBotName: any;
  handleAddNewBot: any;
}) {
  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const context = session.mask.context;

  return (
    <div className={styles["prompt-toast"]} key="prompt-toast">
      {props.showToast && (
        <div
          className={styles["prompt-toast-inner"] + " clickable"}
          role="button"
          onClick={() => props.setShowModal(true)}
        >
          <BrainIcon />
          <span className={styles["prompt-toast-content"]}>
            {Locale.Context.Toast(context.length)}
          </span>
        </div>
      )}
      {props.showModal && (
        <SessionConfigModel
          onClose={() => props.setShowModal(false)} 
          setBotName = {props.setBotName}
          handleAddNewBot={props.handleAddNewBot}
        />
      )}
    </div>
  );
}



function ChatbotTable() {
  
  const [sessions, selectSession, selectedIndex] = useChatStore(
    (state) => [
      state.sessions,
      state.selectSession,
      state.currentSessionIndex,
    ],
  );
  const config = useAppConfig();
  const isMobileScreen = useMobileScreen();
  const chatStore = useChatStore();
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [botName, setBotName] = useState("");
  const [data, setData] = useState<any>([]);

  const clientConfig = useMemo(() => getClientConfig(), []);

  const showMaxIcon = !isMobileScreen && !clientConfig?.isApp;

  const handleAddNewBot = () => {
    // chatStore.newSession();
    
    console.log("sessionLength: ", sessions.length);
    for(let i = 0; i < sessions.length; i ++){
      const session = sessions[i];
      console.log("message: ", session.messages);
      console.log("selectedIndex: ", selectedIndex);
      console.log("selectedmessage: ", sessions[selectedIndex].messages);
    }
    sendRequestsWithToken_as_JSON ("add-new-chatbot", {
      body: JSON.stringify({
        name: botName,
      }),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        const newBot = {
          name: botName,
          _id: result,
          pages: [],
          files: [],
        }
        setData([...data, newBot])
      });
    setShowPromptModal(false);
  }

  const handleonClickRemoveButton = useCallback(
    (botId: string, index: any) => {
      console.log(botId, index);
      if (window.confirm("Are you sure want to delete?")) {
        const formdata = new FormData();
        formdata.append("id", botId);
        sendRequestsWithToken("remove-chatbot",{
          body: formdata,
        })
          .then(response => response.json())
          .then(result => {
            setData(data.slice(0, index).concat(data.slice(index + 1)));
            // setCurrentIndex(-1);
          })
      }
    },
    [data]
  );

  useEffect(() => {
    console.log("s_len: ", chatStore.sessions.length);
    console.log("selected: ", chatStore.currentSessionIndex);
    sendRequestsWithToken("find-all-chatbots", {})
      .then((response) => response.json())
      .then((result) => {
          console.log("data: ", typeof(result))
          setData(result);
        }
      );
}, []);


  return (
    <>
      <div className="window-header" data-tauri-drag-region >
        <div className={`window-header-title ${styles["chat-body-title"]}`}>
          <div
            className={`window-header-main-title ${styles["chat-body-main-title"]}`}
          >
            Your Chatbots
          </div>
          <div className="window-header-sub-title">
            {data.length} chatbots
          </div>
        </div>
        <div className="window-actions">
          <div className="window-action-button">
            <IconButton
              icon={<AddBotIcon />}
              bordered
              text="Add New Bot"
              onClick={() => setShowPromptModal(true)}
            />
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

        {/* ----------- Settings Modal Begin------------------- */}

        <PromptToast
          showModal={showPromptModal}
          setShowModal={setShowPromptModal}
          setBotName={setBotName}
          handleAddNewBot = {handleAddNewBot}
        />

        {/* ----------- Settings Modal End ------------------- */}

      </div>

      <div className={styles["chat-body"]}>
        {data.length === 0 && (
          <div style={{textAlign: "center"}}>
            <h1>You don't have any bot created</h1>
            <h2 >Please <span onClick={() => setShowPromptModal(true)} style={{color: "red", textDecoration: "underline"}}>create</span> your own chatbot</h2>
          </div>
        )}
        <div className={mask_styles["mask-page"]}>
          <div className={mask_styles["mask-page-body"]}>
            <div>
              {data.map((bot: any, index: any) => (
                <div className={mask_styles["mask-item"]} >
                  <div className={mask_styles["mask-header"]}>
                    <div className={mask_styles["mask-icon"] + " no-dark"}>
                      <ChatbotIcon />
                    </div>
                      
                    <div className={mask_styles["mask-title"]}>
                      <Link
                        to={`/chat/${bot._id}/ ${uuidv4().toString()}`}
                        onClick={() => {chatStore.resetSession()}}
                      >
                        <div className={mask_styles["mask-name"]} style={{fontSize: "17px", fontWeight: "normal"}}>{bot.name}</div>
                      </Link>
                    </div>
                  </div>
                  <div className={mask_styles["mask-header"]}>                    
                    <div className={mask_styles["mask-title"]}>
                      <div className={mask_styles["mask-name"]} style={{fontSize: "17px", fontWeight: "normal"}}>Description (Comming soon)</div>
                    </div>
                  </div>
                  <div className={mask_styles["mask-actions"]}>
                      <IconButton
                        icon={<DeleteIcon />}
                        text={Locale.Mask.Item.Delete}
                        onClick={() => handleonClickRemoveButton(bot._id, index)}
                      />
                  </div>
                </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


export function Dashboard() {
  return <ChatbotTable ></ChatbotTable>
}
