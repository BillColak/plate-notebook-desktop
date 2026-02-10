
import { useDropLine } from "@platejs/dnd";
import { BlockSelectionPlugin } from "@platejs/selection/react";
import { getPluginByType, isType, KEYS } from "platejs";
import {
  MemoizedChildren,
  type PlateElementProps,
  type RenderNodeWrapper,
} from "platejs/react";
import * as React from "react";

import { cn } from "@/lib/utils";

const UNDRAGGABLE_KEYS = [KEYS.column, KEYS.tr, KEYS.td];

export const BlockDraggable: RenderNodeWrapper = (props) => {
  const { editor, element, path } = props;

  const enabled = React.useMemo(() => {
    if (editor.dom.readOnly) {
      return false;
    }

    if (path.length === 1 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      return true;
    }
    if (path.length === 3 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: {
          type: editor.getType(KEYS.column),
        },
      });

      if (block) {
        return true;
      }
    }
    if (path.length === 4 && !isType(editor, element, UNDRAGGABLE_KEYS)) {
      const block = editor.api.some({
        at: path,
        match: {
          type: editor.getType(KEYS.table),
        },
      });

      if (block) {
        return true;
      }
    }

    return false;
  }, [editor, element, path]);

  if (!enabled) {
    return;
  }

  return function DraggableWrapper(props) {
    return <Draggable {...props} />;
  };
};

function Draggable(props: PlateElementProps) {
  const { children, editor, element } = props;

  return (
    <div
      className={cn(
        "relative",
        getPluginByType(editor, element.type)?.node.isContainer
          ? "group/container"
          : "group"
      )}
    >
      <div
        className="slate-blockWrapper flow-root"
        onContextMenu={(event) =>
          editor
            .getApi(BlockSelectionPlugin)
            .blockSelection.addOnContextMenu({ element, event })
        }
      >
        <MemoizedChildren>{children}</MemoizedChildren>
        <DropLine />
      </div>
    </div>
  );
}

const DropLine = React.memo(function DropLine({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { dropLine } = useDropLine();

  if (!dropLine) {
    return null;
  }

  return (
    <div
      {...props}
      className={cn(
        "slate-dropLine",
        "absolute inset-x-0 h-0.5 opacity-100 transition-opacity",
        "bg-brand/50",
        dropLine === "top" && "-top-px",
        dropLine === "bottom" && "-bottom-px",
        className
      )}
    />
  );
});

DropLine.displayName = "DropLine";
