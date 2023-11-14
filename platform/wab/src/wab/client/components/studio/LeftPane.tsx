// This is a skeleton starter React component generated by Plasmic.
// Feel free to edit as you see fit.
import { DevContainer } from "@/wab/client/components/dev";
import { CopilotPanel } from "@/wab/client/components/sidebar-tabs/CopilotPanel";
import { OutlineTab } from "@/wab/client/components/sidebar-tabs/outline-tab";
import { ResponsivenessPanel } from "@/wab/client/components/sidebar-tabs/ResponsivenessPanel";
import { VersionsTab } from "@/wab/client/components/sidebar-tabs/versions-tab";
import { FindReferencesModal } from "@/wab/client/components/sidebar/FindReferencesModal";
import { ImageAssetsPanel } from "@/wab/client/components/sidebar/image-asset-controls";
import LeftComponentsPanel from "@/wab/client/components/sidebar/LeftComponentsPanel";
import LeftGeneralTokensPanel from "@/wab/client/components/sidebar/LeftGeneralTokensPanel";
import LeftLintIssuesPanel from "@/wab/client/components/sidebar/LeftLintIssuesPanel";
import LeftProjectSettingsPanel from "@/wab/client/components/sidebar/LeftProjectSettingsPanel";
import LeftSplitsPanel from "@/wab/client/components/sidebar/LeftSplitsPanel";
import { MixinsPanel } from "@/wab/client/components/sidebar/MixinControls";
import { ProjectDependenciesPanel } from "@/wab/client/components/sidebar/ProjectDependencies";
import { SidebarModalProvider } from "@/wab/client/components/sidebar/SidebarModal";
import { DefaultStylesPanel } from "@/wab/client/components/sidebar/ThemesControls";
import { UserManagedFontsPanel } from "@/wab/client/components/sidebar/UserManagedFonts";
import { providesSidebarPopupSetting } from "@/wab/client/components/style-controls/StyleComponent";
import { Icon } from "@/wab/client/components/widgets/Icon";
import { ListStack } from "@/wab/client/components/widgets/ListStack";
import { useResizableHandle } from "@/wab/client/hooks/useResizableHandle";
import ComponentIcon from "@/wab/client/plasmic/plasmic_kit/PlasmicIcon__Component";
import PlasmicLeftPane from "@/wab/client/plasmic/plasmic_kit_left_pane/PlasmicLeftPane";
import { StudioCtx } from "@/wab/client/studio-ctx/StudioCtx";
import { cx, ensure, spawn, spawnWrapper } from "@/wab/common";
import { HighlightBlinker } from "@/wab/commons/components/HighlightBlinker";
import { Slot, SlotProvider } from "@/wab/commons/components/Slots";
import { useSignalListener } from "@/wab/commons/components/use-signal-listener";
import { XDraggable } from "@/wab/commons/components/XDraggable";
import { getComponentDisplayName } from "@/wab/components";
import { LeftTabKey } from "@/wab/shared/ui-config-utils";
import { extractComponentUsages } from "@/wab/sites";
import L from "lodash";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { useLocalStorage } from "react-use";

interface LeftPaneProps {
  studioCtx: StudioCtx;
  className?: string;
}

const LeftPane = observer(function LeftPane(props: LeftPaneProps) {
  const { studioCtx } = props;
  const dbCtx = studioCtx.dbCtx();
  // const [hover, setHover] = React.useState(false);

  const wrapTab = (
    tabKey: LeftTabKey,
    panel: React.ReactNode,
    unmount = false
  ) => {
    return (
      (!unmount || studioCtx.leftTabKey === tabKey) && (
        <div
          className="flex-col flex-fill overflow-hidden"
          style={tabKey === studioCtx.leftTabKey ? {} : { display: "none" }}
        >
          {panel}
        </div>
      )
    );
  };

  const leftPaneRef = React.useRef<HTMLDivElement>(null);

  const { onDragStart, onDrag, onDragStop } = useResizableHandle({
    panelRef: leftPaneRef,
    onChange: React.useCallback(
      (newWidth: number) => {
        spawn(
          studioCtx.changeUnsafe(() => {
            studioCtx.leftPaneWidth = newWidth;
          })
        );
      },
      [studioCtx]
    ),
  });

  const [dismissVersionsCTA, setDismissVersionsCTA] = useLocalStorage(
    `${studioCtx.siteInfo.id}-dismissVersionsCTA`,
    false
  );

  // revision number of latest published version
  const [latestPublishedRevNum, setLatestPublishedRevNum] = useState<number>();
  const latestPublishedVersion = L.head(studioCtx.releases);

  // Check if we need to fetch latest data
  React.useEffect(() => {
    spawn(
      (async () => {
        const { rev: latestPublishedRev } = await studioCtx.getLatestVersion(
          latestPublishedVersion?.revisionId,
          latestPublishedVersion?.branchId ?? undefined
        );
        setLatestPublishedRevNum(latestPublishedRev?.revision);
      })()
    );
  }, [studioCtx, latestPublishedVersion]);

  const useVersionsCTA =
    !dismissVersionsCTA &&
    studioCtx.releases.length > 0 &&
    !!latestPublishedRevNum &&
    ensure(latestPublishedRevNum, "Should have latestPublishedRevNum") <
      dbCtx.revisionNum;

  const isLoggedIn = studioCtx.appCtx.selfInfo != null;

  const [highlightPane, setHighlightPane] = useState(false);

  useSignalListener(studioCtx.leftPanelHighlightingRequested, () => {
    setHighlightPane(true);
    setTimeout(() => setHighlightPane(false), 2000);
  });

  return providesSidebarPopupSetting({ left: true })(
    <SidebarModalProvider containerSelector={".canvas-editor__left-pane"}>
      <SlotProvider>
        <DevContainer
          className={cx({
            flex: true,
            // monochrome: !hover,
            "canvas-editor__left-pane-container": true,
          })}
          style={{
            position: "relative",
          }}
          showControls={studioCtx.showDevControls}
          // onMouseEnter={() => setHover(true)}
          // onMouseLeave={() => setHover(false)}
        >
          {studioCtx.showAddDrawer() && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "#F9F9F8",
                zIndex: 9,
              }}
            />
          )}
          <PlasmicLeftPane
            leftTabStrip={{ props: { useVersionsCTA } }}
            type={studioCtx.leftTabKey}
            paneContainer={{
              props: {
                className: "canvas-editor__left-pane auto-pointer-events",
                style: !studioCtx.leftTabKey
                  ? {
                      display: "none",
                    }
                  : {
                      width: studioCtx.leftPaneWidth,
                    },
              },

              wrapChildren: (children) => (
                <>
                  <ListStack>{children}</ListStack>
                  <XDraggable
                    onStart={onDragStart}
                    onStop={onDragStop}
                    onDrag={onDrag}
                    minPx={0}
                  >
                    <div className="left-pane-resizer auto-pointer-events" />
                  </XDraggable>
                </>
              ),
            }}
            paneContent={{
              props: {
                ref: leftPaneRef,
                children: (
                  <>
                    {wrapTab("responsiveness", <ResponsivenessPanel />)}
                    {wrapTab("outline", <OutlineTab />)}
                    {studioCtx.appCtx.appConfig.copilotTab &&
                      wrapTab("copilot", <CopilotPanel />)}
                    {wrapTab("tokens", <LeftGeneralTokensPanel />)}
                    {wrapTab("mixins", <MixinsPanel />)}
                    {wrapTab("components", <LeftComponentsPanel />)}
                    {wrapTab("themes", <DefaultStylesPanel />)}
                    {wrapTab("images", <ImageAssetsPanel />)}
                    {wrapTab("fonts", <UserManagedFontsPanel />)}

                    {isLoggedIn &&
                      wrapTab("imports", <ProjectDependenciesPanel />)}
                    {isLoggedIn &&
                      wrapTab(
                        "versions",
                        <VersionsTab
                          useVersionsCTA={useVersionsCTA}
                          dismissVersionsCTA={() => setDismissVersionsCTA(true)}
                        />
                      )}
                    {wrapTab("settings", <LeftProjectSettingsPanel />)}
                    {wrapTab("splits", <LeftSplitsPanel />)}
                    {wrapTab("lint", <LeftLintIssuesPanel />, true)}
                    {highlightPane && <HighlightBlinker />}
                  </>
                ),
              },
            }}
          />
        </DevContainer>
        {studioCtx.findReferencesComponent && (
          <FindReferencesModal
            studioCtx={studioCtx}
            displayName={getComponentDisplayName(
              studioCtx.findReferencesComponent
            )}
            icon={
              <Icon
                icon={ComponentIcon}
                className="component-fg custom-svg-icon--lg monochrome-exempt"
              />
            }
            usageSummary={extractComponentUsages(
              studioCtx.site,
              studioCtx.findReferencesComponent
            )}
            onClose={spawnWrapper(async () => {
              await studioCtx.changeUnsafe(
                () => (studioCtx.findReferencesComponent = undefined)
              );
            })}
          />
        )}
        <Slot />
      </SlotProvider>
    </SidebarModalProvider>
  );
});

export default LeftPane as React.FunctionComponent<LeftPaneProps>;