import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { api } from "../../../../api/spotifyApi";
import { Button } from "../../../../components/designSystem/button";
import { Card } from "../../../../components/designSystem/card";
import { colors, spacing } from "../../../../components/designSystem/designConstants.stylex";
import { Select } from "../../../../components/designSystem/select";
import { Text } from "../../../../components/designSystem/text";

export function ImportSpotifyDataCard() {
  const [files, setFiles] = useState<File[]>([]);
  const [importStatus, setImportStatus] = useState<
    "idle" | "warning" | "uploading" | "success" | "error"
  >("idle");
  const [importType, setImportType] = useState<"privacy" | "extended">("privacy");

  const handleImportTypeChange = (val: "privacy" | "extended") => {
    setImportType(val);
    setFiles([]);
    setImportStatus("idle");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);

      const allValid = selectedFiles.every((file) =>
        importType === "privacy"
          ? file.name.startsWith("StreamingHistory")
          : file.name.startsWith("Streaming_History_Audio") ||
            file.name.startsWith("Streaming_Audio_History"),
      );

      if (allValid) {
        setImportStatus("idle");
      } else {
        setImportStatus("warning");
      }
    }
  };

  const handleImport = async () => {
    if (files.length === 0) return;
    setImportStatus("uploading");
    try {
      if (importType === "extended") {
        await api.doImportFullPrivacy(files);
      } else {
        await api.doImportPrivacy(files);
      }
      setImportStatus("success");
      setFiles([]);
    } catch (error) {
      console.error(error);
      setImportStatus("error");
    }
  };

  return (
    <Card title="Import Spotify Data">
      <div {...stylex.props(styles.appearanceRow)}>
        <div {...stylex.props(styles.appearanceInfo)}>
          <Text as="span" size="medium" weight="regular" color="text">
            Import Method
          </Text>
          <Text as="span" size="small" color="textSecondary" align="left">
            Select the type of data you received from Spotify.
          </Text>
        </div>
        <div {...stylex.props(styles.dropdownWrapper)}>
          <Select
            options={[
              { label: "Privacy data", value: "privacy" },
              { label: "Extended streaming history", value: "extended" },
            ]}
            value={importType}
            onChange={(val) => handleImportTypeChange(val as "privacy" | "extended")}
            darken
          />
        </div>
      </div>

      <div {...stylex.props(styles.appearanceRow)}>
        <div {...stylex.props(styles.appearanceInfo)}>
          <Text as="span" size="medium" weight="regular" color="text">
            Upload your data
          </Text>
          <Text as="span" size="small" color="textSecondary" align="left">
            {importType === "privacy" ? (
              <>
                Import Account data (&quot;StreamingHistory&quot; files). Request them{" "}
                <a
                  href="https://www.spotify.com/us/account/privacy/"
                  target="_blank"
                  rel="noreferrer"
                  {...stylex.props(styles.link)}
                >
                  here
                </a>
                .
              </>
            ) : (
              <>
                Import Extended streaming history (&quot;Streaming_History_Audio&quot; files).
                Request them{" "}
                <a
                  href="https://www.spotify.com/us/account/privacy/"
                  target="_blank"
                  rel="noreferrer"
                  {...stylex.props(styles.link)}
                >
                  here
                </a>
                .
              </>
            )}
          </Text>
          {importStatus === "warning" && (
            <Text
              as="span"
              size="small"
              weight="semiBold"
              color="warning"
              align="left"
              xstyle={styles.warningText}
            >
              {importType === "privacy"
                ? 'Warning: Some files don\'t start with "StreamingHistory". They might not work.'
                : 'Warning: Some files don\'t start with "Streaming_History_Audio". They might not work.'}
            </Text>
          )}
          {importStatus === "success" && (
            <Text
              as="span"
              size="small"
              weight="semiBold"
              color="primary"
              align="left"
              xstyle={styles.warningText}
            >
              Import started successfully!
            </Text>
          )}
          {importStatus === "error" && (
            <Text
              as="span"
              size="small"
              weight="semiBold"
              color="error"
              align="left"
              xstyle={styles.warningText}
            >
              An error occurred while uploading. Please try again.
            </Text>
          )}
          {files.length > 0 && importStatus !== "success" && (
            <Text
              as="span"
              size="small"
              color="textSecondary"
              align="left"
              xstyle={styles.warningText}
            >
              {files.length} file(s) selected
            </Text>
          )}
        </div>
        <div {...stylex.props(styles.importActions)}>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="importDataInput"
            accept=".json"
          />
          <Button
            variant="secondary"
            onClick={() => document.getElementById("importDataInput")?.click()}
            darken
          >
            Select Files
          </Button>
          {files.length > 0 && (
            <Button onClick={handleImport} disabled={importStatus === "uploading"}>
              {importStatus === "uploading" ? "Uploading..." : "Import Data"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

const styles = stylex.create({
  appearanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${spacing.md} 0`,
  },
  appearanceInfo: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  dropdownWrapper: {
    width: "50%",
    maxWidth: "300px",
  },
  importActions: {
    display: "flex",
    gap: spacing.md,
    alignItems: "center",
  },
  link: {
    color: colors.primary,
    textDecoration: "none",
    ":hover": {
      textDecoration: "underline",
    },
  },
  warningText: {
    marginTop: spacing.xs,
  },
});
