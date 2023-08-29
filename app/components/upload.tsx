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

export function UploadPage() {
  const navigate = useNavigate();

  const [files, setFiles] = useState<string[]>([]);
  const [file, setFile] = useState<File | undefined>(undefined);





  function readFromFile() {
    return new Promise<File>((res, rej) => { // Change the generic type to File
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "application/pdf";
  
      fileInput.onchange = (event: any) => {
        const file = event.target.files[0];
        res(file); // Resolve with the file itself
      };
  
      fileInput.onerror = (e) => rej(e);
      fileInput.click();
    });
  }

  const importFromFile = () => {
    readFromFile()
      .then((result) => {
        setFile(result);
      });
  };

  const handleonClickAddFileButton = useCallback(async () => {
    if(file){
      const formdata = new FormData();
      formdata.append("file", file);
      formdata.append("bot_id", "35345293082374230523572");
      try{
        sendRequestsWithToken('add-training-file', {
          body: formdata,
        })
          .then(response => response.json())
          .then(result => {
            console.log("filename: ", file.name);
            setFiles([...files, file.name]);
          })
          .catch((err) => {
            alert("Failed for reason!");
          })
      } catch(error){
        console.error('File upload faild!');
      }
    }
  }, [file, files])

  const handleonClickRemoveButton = useCallback((index: any) => {
    
    console.log(files[index]);
    if (window.confirm("Are you sure want to delete?")) {
      const formdata = new FormData();
      formdata.append("filename", files[index]);
      formdata.append("id", "35345293082374230523572");
      sendRequestsWithToken("clear-database-by-metadata", {
        body: formdata,
      })
        .then(response => response.json())
        .then((result) => {
          setFiles(files.slice(0, index).concat(files.slice(index + 1)))
        })
        .catch(err => {
          alert("Error");
        })
    }
  }, [files])

  return (
    <ErrorBoundary>
      <div className={styles["mask-page"]}>
        <div className="window-header">
          <div className="window-header-title">
            <div className="window-header-main-title">
              {/* {Locale.Mask.Page.Title} */}
              File Upload
            </div>
            <div className="window-header-submai-title">
              {/* {Locale.Mask.Page.SubTitle(allMasks.length)} */}
              {files.length} uploaded files
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
              placeholder={"Please choose your file"}
              value={file?.name}
              readOnly
            />
            <div className="window-action-button">
              <IconButton
                icon={<UploadIcon />}
                bordered
                onClick={() => importFromFile()}
              />
            </div>


            <IconButton
              className={styles["mask-create"]}
              icon={<AddIcon />}
              // text={Locale.Mask.Page.Create}
              text="Add File"
              bordered
              onClick={handleonClickAddFileButton}
            />
          </div>

          <div>
            {files.map((file, index) => (
              <div className={styles["mask-item"]} key={file}>
                <div className={styles["mask-header"]}>
                  <div className="user-avatar">
                    <img src="https://cdn.staticfile.org/emoji-datasource-apple/14.0.0/img/apple/64/1f5bc-fe0f.png" alt="framed picture" className="__EmojiPicker__ epr-emoji-img" loading="eager" style={{fontSize: "18px", height: "18px", width: "18px"}} />
                  </div>
                  <div className={styles["mask-title"]}>
                    <div className={styles["mask-name"]}>{file}</div>
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

    </ErrorBoundary>
  );
}
