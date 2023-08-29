import { IconButton } from "./button";
import { ErrorBoundary } from "./error";

import styles from "./mask.module.scss";

import UploadIcon from "../icons/upload.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import DeleteIcon from "../icons/delete.svg";

import Locale from "../locales";
import { useNavigate } from "react-router-dom";

import { useCallback, useEffect, useState } from "react";
import { sendRequestsWithToken } from "../utils/fetch";
import {
  List,
  ListItem,
  Modal,
  Selector,
  showConfirm,
  showPrompt,
  showToast,
} from "./ui-lib";
import CopyIcon from "../icons/copy.svg";

const URLContentModal = ( props: { onClose: () => void, content: string } ) => {
  return (
    <div className="modal-mask">
      <Modal
        // title={Locale.Context.Edit}
        title="Content"
        onClose={() => props.onClose()}
      >
        <div style={{height: "750px", maxHeight: "750px"}}>
          {props.content}
        </div>
      </Modal>
    </div>
  );
}


export function UrlPage() {
  const navigate = useNavigate();
  const [linkVal, setLinkVal] = useState("");
  const [pages, setPages] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState('');
  const handleonClickAddUrlButton = useCallback(() => {
    const formdata = new FormData();
    formdata.append("id", "35345293082374230523572");
    formdata.append("url", linkVal);
    sendRequestsWithToken ("add-page", {
      body: formdata,
    })
      .then((response) => response.json())
      .then((result) => {
        setPages([...pages, linkVal]);
        setLinkVal("");
      });
  }, [linkVal, pages]);

  const handleonClickRemoveButton = useCallback((index: any) => {
    
    console.log(pages[index]);
    if (window.confirm("Are you sure want to delete?")) {
      const formdata = new FormData();
      formdata.append("filename", pages[index]);
      formdata.append("id", "35345293082374230523572");
      sendRequestsWithToken("clear-database-by-metadata", {
        body: formdata,
      })
        .then(response => response.json())
        .then((result) => {
          setPages(pages.slice(0, index).concat(pages.slice(index + 1)))
        })
        .catch(err => {
          alert("Error");
        })
    }
  }, [pages])

  const fetchContent = useCallback((url: any) => {
    setShowModal(true)
    console.log(url);
    setContent("Loading...");
    const formdata = new FormData();
    formdata.append("link", url);
    sendRequestsWithToken("extract-content", {
      body: formdata,
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        setContent(result);
      });
  }, []);
  
  return (
    <ErrorBoundary>
      <div className={styles["mask-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">
              {/* {Locale.Mask.Page.Title} */}
              URL Scraping
            </div>
            <div className="window-header-submai-title">
              {/* {Locale.Mask.Page.SubTitle(allMasks.length)} */}
              {pages.length} Urls
            </div>
          </div>

          <div className="window-actions">
            <div className="window-action-button">
              <IconButton
                icon={<CloseIcon />}
                bordered
                onClick={() => navigate(-1)}
              />
            </div>
          </div>
        </div>

        <div className={styles["mask-page-body"]}>
          <div className={styles["mask-filter"]}>
          <input
              type="text"
              className={styles["search-bar"]}
              // placeholder={Locale.Mask.Page.Search}
              placeholder={"Input links here..."}
              value={linkVal}
              onChange={(ev) => setLinkVal(ev.target.value)}
            />


            <IconButton
              className={styles["mask-create"]}
              icon={<AddIcon />}
              // text={Locale.Mask.Page.Create}
              text="Add URL"
              bordered
              onClick={handleonClickAddUrlButton}
            />
          </div>

          <div>
            {pages.map((page, index) => (
              <div className={styles["mask-item"]} key={page}>
                <div className={styles["mask-header"]}>
                  <div className="user-avatar">
                    <img src="https://cdn.staticfile.org/emoji-datasource-apple/14.0.0/img/apple/64/1f5bc-fe0f.png" alt="framed picture" className="__EmojiPicker__ epr-emoji-img" loading="eager" style={{fontSize: "18px", height: "18px", width: "18px"}} />
                  </div>
                  <div className={styles["mask-title"]}>
                    <div className={styles["mask-name"]} onClick={() => fetchContent(page)} >{page}</div>
                  </div>
                </div>
                <div className={styles["mask-actions"]}>
                    <IconButton
                      icon={<DeleteIcon />}
                      text={Locale.Mask.Item.Delete}
                      onClick={() => handleonClickRemoveButton(index)}
                    />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showModal && (
        <URLContentModal onClose={() => setShowModal(false)} content={content} />
      )}
    </ErrorBoundary>
  );
}
