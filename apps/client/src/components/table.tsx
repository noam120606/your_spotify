import * as stylex from "@stylexjs/stylex";
import { ReactNode } from "react";

import { colors, spacing, borderRadius } from "./designSystem/designConstants.stylex";
import { Text } from "./designSystem/text";
import { InfiniteScroll } from "./infiniteScroll";

export interface TableColumn<T> {
  id: string;
  header: ReactNode;
  renderCell: (item: T, index: number) => ReactNode;
  flex?: number;
  width?: number | string;
  minWidth?: number | string;
  align?: "left" | "center" | "right";
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  noPadding?: boolean;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (item: T, index: number) => string;
  infiniteScroll?: {
    hasMore: boolean;
    next: () => void;
    loader: ReactNode;
  };
}

export function Table<T>({ data, columns, keyExtractor, infiniteScroll }: TableProps<T>) {
  const renderCell = (col: TableColumn<T>, content: ReactNode) => {
    const stylexProps = stylex.props(
      styles.colBase,
      !col.noPadding && styles.paddingRight,
      col.align === "center" && styles.alignCenter,
      col.align === "right" && styles.alignRight,
      col.hideOnMobile && styles.hideOnMobile,
      col.hideOnTablet && styles.hideOnTablet,
    );

    return (
      <div
        key={col.id}
        {...stylexProps}
        style={{
          ...stylexProps.style,
          flex: col.flex,
          width: col.width,
          minWidth: col.minWidth,
          flexShrink: col.width !== undefined ? 0 : undefined,
        }}
      >
        {content}
      </div>
    );
  };

  const listContent = (
    <div {...stylex.props(styles.list)}>
      {data.map((item, index) => (
        <div key={keyExtractor(item, index)} {...stylex.props(styles.row)}>
          {columns.map((col) => renderCell(col, col.renderCell(item, index)))}
        </div>
      ))}
    </div>
  );

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.tableHeader)}>
        {columns.map((col) =>
          renderCell(
            col,
            typeof col.header === "string" ? (
              <Text color="textSecondary" size="small">
                {col.header}
              </Text>
            ) : (
              col.header
            ),
          ),
        )}
      </div>

      {infiniteScroll ? (
        <InfiniteScroll
          hasMore={infiniteScroll.hasMore}
          next={infiniteScroll.next}
          loader={infiniteScroll.loader}
        >
          {listContent}
        </InfiniteScroll>
      ) : (
        listContent
      )}
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  list: {
    display: "flex",
    flexDirection: "column",
  },
  tableHeader: {
    display: "flex",
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
    paddingRight: spacing.sm,
    paddingLeft: spacing.sm,
  },
  row: {
    display: "flex",
    alignItems: "center",
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    transition: "background-color 0.2s ease",
    ":hover": {
      backgroundColor: colors.surfaceDarker,
    },
  },
  colBase: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  paddingRight: {
    paddingRight: spacing.md,
  },
  alignCenter: {
    alignItems: "center",
    textAlign: "center",
  },
  alignRight: {
    alignItems: "flex-end",
    textAlign: "right",
  },
  hideOnMobile: {
    display: {
      default: "flex",
      "@media (max-width: 768px)": "none",
    },
  },
  hideOnTablet: {
    display: {
      default: "flex",
      "@media (max-width: 1024px)": "none",
    },
  },
});
