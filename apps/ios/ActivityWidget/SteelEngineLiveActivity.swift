import ActivityKit
import SwiftUI
import WidgetKit

struct SteelEngineLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: SteelEngineActivityAttributes.self) { context in
            self.lockScreenView(context: context)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    self.statusDot(state: context.state)
                }
                DynamicIslandExpandedRegion(.center) {
                    self.statusText(state: context.state)
                        .font(SteelEngineActivityType.subheadSemiBold)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    self.trailingView(state: context.state)
                }
            } compactLeading: {
                self.statusDot(state: context.state)
            } compactTrailing: {
                self.compactStatusIcon(state: context.state)
            } minimal: {
                self.statusDot(state: context.state)
            }
        }
    }

    private func lockScreenView(context: ActivityViewContext<SteelEngineActivityAttributes>) -> some View {
        HStack(spacing: 10) {
            self.statusIcon(state: context.state)
                .frame(width: 30, height: 30)
                .background(.thinMaterial, in: Circle())
            VStack(alignment: .leading, spacing: 2) {
                Text("SteelEngine")
                    .font(SteelEngineActivityType.subheadBold)
                    .lineLimit(1)
                self.statusText(state: context.state)
                    .font(SteelEngineActivityType.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            Spacer()
            self.trailingView(state: context.state)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
    }

    private func trailingView(state: SteelEngineActivityAttributes.ContentState) -> some View {
        self.statusIcon(state: state)
            .font(SteelEngineActivityType.symbol(size: 16, weight: .semibold))
            .frame(width: 28, height: 28)
    }

    private func statusDot(state: SteelEngineActivityAttributes.ContentState) -> some View {
        Circle()
            .fill(self.dotColor(state: state))
            .frame(width: 6, height: 6)
    }

    private func compactStatusIcon(state: SteelEngineActivityAttributes.ContentState) -> some View {
        self.statusIcon(state: state)
            .font(SteelEngineActivityType.symbol(size: 12, weight: .semibold))
            .frame(width: 18, height: 18)
    }

    @ViewBuilder
    private func statusIcon(state: SteelEngineActivityAttributes.ContentState) -> some View {
        switch state.status {
        case .connecting, .reconnecting:
            Image(systemName: "arrow.triangle.2.circlepath")
                .foregroundStyle(SteelEngineActivityStyle.info)
        case .disconnected:
            Image(systemName: "wifi.slash")
                .foregroundStyle(SteelEngineActivityStyle.danger)
        case .idle:
            Image(systemName: "checkmark")
                .foregroundStyle(SteelEngineActivityStyle.ok)
        case .approvalNeeded, .actionRequired, .attention:
            Image(systemName: "exclamationmark.triangle.fill")
                .foregroundStyle(SteelEngineActivityStyle.warn)
        }
    }

    private func statusText(state: SteelEngineActivityAttributes.ContentState) -> Text {
        if let detail = state.verbatimDetail {
            return Text(verbatim: detail)
        }
        return switch state.status {
        case .connecting: Text("Connecting...")
        case .reconnecting: Text("Reconnecting...")
        case .approvalNeeded: Text("Approval needed")
        case .actionRequired, .attention: Text("Action required")
        case .idle: Text("Connected")
        case .disconnected: Text("Disconnected")
        }
    }

    private func dotColor(state: SteelEngineActivityAttributes.ContentState) -> Color {
        switch state.status {
        case .connecting, .reconnecting:
            SteelEngineActivityStyle.info
        case .disconnected:
            SteelEngineActivityStyle.danger
        case .idle:
            SteelEngineActivityStyle.ok
        case .approvalNeeded, .actionRequired, .attention:
            SteelEngineActivityStyle.warn
        }
    }
}

private enum SteelEngineActivityStyle {
    static let info = Color(red: 0, green: 122 / 255.0, blue: 1)
    static let danger = Color(red: 185 / 255.0, green: 28 / 255.0, blue: 28 / 255.0)
    static let ok = Color(red: 34 / 255.0, green: 197 / 255.0, blue: 94 / 255.0)
    static let warn = Color(red: 245 / 255.0, green: 158 / 255.0, blue: 11 / 255.0)
}
