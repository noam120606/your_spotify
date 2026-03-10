import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Text } from '../../../components/designSystem/text';
import { useAuthStore } from '../../../store/authStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { SegmentedControl } from '../../../components/segmentedControl';
import { Dropdown } from '../../../components/designSystem/dropdown';
import { Button } from '../../../components/designSystem/button';
import { Card } from '../../../components/designSystem/card';
import { SettingTabContent } from './settingTabContent';
import { api } from '../../../api/spotifyApi';
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from '../../../components/designSystem/designConstants.stylex';

export function AccountTab() {
  const { user, spotify } = useAuthStore();
  const { isDarkMode, setDarkMode } = useSettingsStore();

  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(isDarkMode ? 'dark' : 'light');

  const [files, setFiles] = useState<File[]>([]);
  const [importStatus, setImportStatus] = useState<'idle' | 'warning' | 'uploading' | 'success' | 'error'>('idle');
  const [importType, setImportType] = useState<'privacy' | 'extended'>('privacy');

  const handleImportTypeChange = (val: 'privacy' | 'extended') => {
    setImportType(val);
    setFiles([]);
    setImportStatus('idle');
  };
  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    if (mode === 'light') setDarkMode(false);
    if (mode === 'dark') setDarkMode(true);
    if (mode === 'system') {
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(isSystemDark);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);

      const allValid = selectedFiles.every(file =>
        importType === 'privacy'
          ? file.name.startsWith('StreamingHistory')
          : (file.name.startsWith('Streaming_History_Audio') || file.name.startsWith('Streaming_Audio_History'))
      );

      if (allValid) {
        setImportStatus('idle');
      } else {
        setImportStatus('warning');
      }
    }
  };

  const handleImport = async () => {
    if (files.length === 0) return;
    setImportStatus('uploading');
    try {
      if (importType === 'extended') {
        await api.doImportFullPrivacy(files);
      } else {
        await api.doImportPrivacy(files);
      }
      setImportStatus('success');
      setFiles([]);
    } catch (error) {
      console.error(error);
      setImportStatus('error');
    }
  };

  const accountInfo = [
    { label: 'Spotify Account Name', value: spotify?.display_name },
    { label: 'Spotify Email', value: spotify?.email },
    { label: 'Spotify Account ID', value: spotify?.id },
    { label: 'Internal Account ID', value: user?._id },
    { label: 'Product Type', value: spotify?.product },
  ];

  return (
    <SettingTabContent>
      {/* Profile Header */}
      <Card>
        <div {...stylex.props(styles.profileHeader)}>
          {spotify?.images?.[0]?.url ? (
            <img
              src={spotify.images[1]?.url || spotify.images[0].url}
              alt="Profile Avatar"
              {...stylex.props(styles.avatar)}
            />
          ) : (
            <div {...stylex.props(styles.avatarPlaceholder)}>
              {spotify?.display_name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}

          <div {...stylex.props(styles.profileInfo)}>
            <Text as="h2" size="xxlarge" weight="bold" color="text">
              {spotify?.display_name || 'Spotify User'}
            </Text>
            <div {...stylex.props(styles.badgeWrapper)}>
              <Text
                as="span"
                size="small"
                weight="bold"
                transform="uppercase"
                color={spotify?.product === 'premium' ? 'background' : 'textSecondary'}
                xstyle={[styles.productBadge, spotify?.product === 'premium' && styles.productBadgePremium]}
              >
                {spotify?.product ? spotify.product : 'UNKNOWN'}
              </Text>
            </div>
          </div>
        </div>
      </Card>

      {/* Account Details Single Card */}
      <Card title="Account Details">
        <div {...stylex.props(styles.detailsListContainer)}>
          {accountInfo.map((info, i) => (
            <div key={i} {...stylex.props(styles.detailRow, i !== accountInfo.length - 1 && styles.detailRowBorder)}>
              <Text as="span" size="small" weight="medium" transform="uppercase" color="textSecondary" xstyle={styles.infoLabel}>
                {info.label}
              </Text>
              <Text as="span" size="medium" weight="semiBold" color="text" align="right" xstyle={styles.infoValue}>
                {info.value || 'N/A'}
              </Text>
            </div>
          ))}
        </div>
      </Card>

      {/* Appearance Section */}
      <Card title="Appearance">
        <div {...stylex.props(styles.appearanceRow)}>
          <div {...stylex.props(styles.appearanceInfo)}>
            <Text as="span" size="medium" weight="regular" color="text">Theme Mode</Text>
            <Text as="span" size="small" color="textSecondary" align="left">
              Choose how YourSpotify looks to you
            </Text>
          </div>
          <div {...stylex.props(styles.themeControlWrapper)}>
            <SegmentedControl.Root
              selectedIndex={themeMode === 'light' ? 0 : themeMode === 'dark' ? 1 : 2}
              onIndexChange={(idx) => handleThemeChange(idx === 0 ? 'light' : idx === 1 ? 'dark' : 'system')}
              fullWidth
            >
              <SegmentedControl.Item index={0}>
                {({ selected }) => (
                  <Text as="span" size="small" weight="semiBold" color={selected ? 'background' : 'textSecondary'} xstyle={styles.themeSegmentText}>Light</Text>
                )}
              </SegmentedControl.Item>
              <SegmentedControl.Item index={1}>
                {({ selected }) => (
                  <Text as="span" size="small" weight="semiBold" color={selected ? 'background' : 'textSecondary'} xstyle={styles.themeSegmentText}>Dark</Text>
                )}
              </SegmentedControl.Item>
              <SegmentedControl.Item index={2}>
                {({ selected }) => (
                  <Text as="span" size="small" weight="semiBold" color={selected ? 'background' : 'textSecondary'} xstyle={styles.themeSegmentText}>System</Text>
                )}
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          </div>
        </div>
      </Card>

      {/* Import Data Section */}
      <Card title="Import Spotify Data">
        <div {...stylex.props(styles.appearanceRow)}>
          <div {...stylex.props(styles.appearanceInfo)}>
            <Text as="span" size="medium" weight="regular" color="text">Import Method</Text>
            <Text as="span" size="small" color="textSecondary" align="left">
              Select the type of data you received from Spotify.
            </Text>
          </div>
          <div {...stylex.props(styles.dropdownWrapper)}>
            <Dropdown
              options={[
                { label: 'Privacy data', value: 'privacy' },
                { label: 'Extended streaming history', value: 'extended' },
              ]}
              value={importType}
              onChange={(val) => handleImportTypeChange(val as 'privacy' | 'extended')}
              darken
            />
          </div>
        </div>

        <div {...stylex.props(styles.appearanceRow)}>
          <div {...stylex.props(styles.appearanceInfo)}>
            <Text as="span" size="medium" weight="regular" color="text">Upload your data</Text>
            <Text as="span" size="small" color="textSecondary" align="left">
              {importType === 'privacy' ? (
                <>Import Account data (&quot;StreamingHistory&quot; files). Request them <a href="https://www.spotify.com/us/account/privacy/" target="_blank" rel="noreferrer" {...stylex.props(styles.link)}>here</a>.</>
              ) : (
                <>Import Extended streaming history (&quot;Streaming_History_Audio&quot; files). Request them <a href="https://www.spotify.com/us/account/privacy/" target="_blank" rel="noreferrer" {...stylex.props(styles.link)}>here</a>.</>
              )}
            </Text>
            {importStatus === 'warning' && (
              <Text as="span" size="small" weight="semiBold" color="warning" align="left" xstyle={styles.warningText}>
                {importType === 'privacy'
                  ? 'Warning: Some files don\'t start with "StreamingHistory". They might not work.'
                  : 'Warning: Some files don\'t start with "Streaming_History_Audio". They might not work.'}
              </Text>
            )}
            {importStatus === 'success' && (
              <Text as="span" size="small" weight="semiBold" color="primary" align="left" xstyle={styles.warningText}>
                Import started successfully!
              </Text>
            )}
            {importStatus === 'error' && (
              <Text as="span" size="small" weight="semiBold" color="error" align="left" xstyle={styles.warningText}>
                An error occurred while uploading. Please try again.
              </Text>
            )}
            {files.length > 0 && importStatus !== 'success' && (
              <Text as="span" size="small" color="textSecondary" align="left" xstyle={styles.warningText}>
                {files.length} file(s) selected
              </Text>
            )}
          </div>
          <div {...stylex.props(styles.importActions)}>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="importDataInput"
              accept=".json"
            />
            <Button variant="secondary" onClick={() => document.getElementById('importDataInput')?.click()} darken>
              Select Files
            </Button>
            {files.length > 0 && (
              <Button onClick={handleImport} disabled={importStatus === 'uploading'}>
                {importStatus === 'uploading' ? 'Uploading...' : 'Import Data'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </SettingTabContent>
  );
}

const styles = stylex.create({
  accountSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    maxWidth: '800px',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xl,
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: borderRadius.full,
    objectFit: 'cover',
    boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
  },
  avatarPlaceholder: {
    width: '100px',
    height: '100px',
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceDarker,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: fontSize.xxlarge,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  badgeWrapper: {
    display: 'flex',
  },
  productBadge: {
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
    backgroundColor: colors.surfaceDarker,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    display: 'inline-flex',
    alignItems: 'center',
  },
  productBadgePremium: {
    backgroundColor: colors.primary,
    color: '#000000',
  },
  detailsListContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.md} 0`,
  },
  detailRowBorder: {
    borderBottom: `1px solid ${colors.border}`,
  },
  appearanceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.md} 0`,
  },
  appearanceInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  themeControlWrapper: {
    width: '300px',
  },
  dropdownWrapper: {
    width: '50%',
    maxWidth: '300px',
  },
  themeSegmentText: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semiBold,
    zIndex: 2,
  },
  infoLabel: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: fontSize.medium,
    color: colors.text,
    fontWeight: fontWeight.semiBold,
    wordBreak: 'break-all',
    textAlign: 'right',
    maxWidth: '60%',
  },
  importActions: {
    display: 'flex',
    gap: spacing.md,
    alignItems: 'center',
  },
  link: {
    color: colors.primary,
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    },
  },
  warningText: {
    marginTop: spacing.xs,
  },
});
