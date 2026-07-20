import SteelEngineChatUI
import SwiftUI

struct CommandPanel<Content: View>: View {
    var tint: Color?
    var isProminent = false
    var padding: CGFloat = 13
    @ViewBuilder var content: Content

    init(
        tint: Color? = nil,
        isProminent: Bool = false,
        padding: CGFloat = 13,
        @ViewBuilder content: () -> Content)
    {
        self.tint = tint
        self.isProminent = isProminent
        self.padding = padding
        self.content = content()
    }

    var body: some View {
        ProCard(
            tint: self.tint,
            isProminent: self.isProminent,
            padding: self.padding,
            radius: SteelEngineProMetric.cardRadius)
        {
            self.content
        }
    }
}

struct CommandControlBackground: View {
    var body: some View {
        SteelEngineProBackground()
    }
}

struct CommandSessionRow: View {
    let item: CommandCenterTab.WorkItem

    var body: some View {
        HStack(alignment: .center, spacing: 12) {
            Image(systemName: self.item.icon)
                .font(SteelEngineType.captionSemiBold)
                .foregroundStyle(self.item.color)
                .frame(width: 30, height: 30)
                .background {
                    RoundedRectangle(cornerRadius: SteelEngineRadius.sm, style: .continuous)
                        .fill(self.item.color.opacity(0.12))
                }
            VStack(alignment: .leading, spacing: 4) {
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    if self.item.isUnread {
                        Circle()
                            .fill(SteelEngineBrand.accent)
                            .frame(width: 7, height: 7)
                            .accessibilityHidden(true)
                    }
                    Text(verbatim: self.item.title)
                        .font(SteelEngineType.subheadSemiBold)
                        .lineLimit(1)
                        .minimumScaleFactor(0.82)
                    Spacer(minLength: 6)
                    if self.item.isPinned {
                        Image(systemName: "pin.fill")
                            .font(SteelEngineType.caption2Medium)
                            .foregroundStyle(SteelEngineBrand.accent)
                            .accessibilityHidden(true)
                    }
                    Text(verbatim: self.item.trailing)
                        .font(SteelEngineType.caption2Medium)
                        .foregroundStyle(.secondary)
                }
                HStack(spacing: 8) {
                    Text(verbatim: self.item.detail)
                        .font(SteelEngineType.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                    Spacer(minLength: 6)
                    if let progress = self.item.progress {
                        ProProgressBar(progress: progress, color: self.item.color)
                            .frame(width: 68)
                    }
                    Text(self.progressLabel)
                        .font(SteelEngineType.captionSemiBold)
                        .foregroundStyle(self.item.color)
                        .lineLimit(1)
                        .frame(width: 48, alignment: .trailing)
                }
            }
        }
        .padding(.horizontal, 4)
        .padding(.vertical, 6)
        .contentShape(Rectangle())
    }

    private var progressLabel: String {
        guard let progress = item.progress else {
            switch self.item.state {
            case "offline": return String(localized: "offline")
            case "off": return String(localized: "off")
            case "idle": return String(localized: "idle")
            case "open": return String(localized: "open")
            case "default": return String(localized: "default")
            case "recent": return String(localized: "recent")
            default: return self.item.state
            }
        }
        if self.item.state == "offline" || self.item.state == "off" || self.item.state == "idle" {
            return self.item.state
        }
        return "\(Int((progress * 100).rounded()))%"
    }
}

struct CommandSessionActions {
    let rename: (String?) -> Void
    let moveToGroup: (String?) -> Void
    let togglePinned: () -> Void
    let toggleUnread: () -> Void
    let fork: () -> Void
    let toggleArchived: () -> Void
    let delete: () -> Void
}

struct CommandSessionActionsModifier: ViewModifier {
    private enum Editor {
        case rename
        case newGroup
    }

    let session: SteelEngineChatSessionEntry
    let categories: [String]
    let isArchived: Bool
    let isEnabled: Bool
    let actions: CommandSessionActions

    @State private var editor: Editor?
    @State private var draftText = ""
    @State private var confirmsDelete = false

    func body(content: Content) -> some View {
        if self.isEnabled {
            self.managedContent(content)
        } else {
            content
        }
    }

    private func managedContent(_ content: Content) -> some View {
        content
            .contextMenu {
                if self.isArchived {
                    self.actionButton("Unarchive", systemImage: "archivebox") {
                        self.actions.toggleArchived()
                    }
                    self.deleteButton
                } else {
                    self.actionButton(
                        self.session.pinned == true
                            ? SteelEngineTextValue.localized("Unpin")
                            : SteelEngineTextValue.localized("Pin"),
                        systemImage: self.session.pinned == true ? "pin.slash" : "pin")
                    {
                        self.actions.togglePinned()
                    }
                    self.actionButton(
                        self.session.unread == true
                            ? SteelEngineTextValue.localized("Mark as Read")
                            : SteelEngineTextValue.localized("Mark as Unread"),
                        systemImage: self.session.unread == true ? "envelope.open" : "envelope.badge")
                    {
                        self.actions.toggleUnread()
                    }
                    self.actionButton("Rename…", systemImage: "pencil") {
                        self.beginRename()
                    }
                    self.actionButton("Fork", systemImage: "arrow.triangle.branch") {
                        self.actions.fork()
                    }
                    self.groupMenu
                    self.actionButton("Archive", systemImage: "archivebox") {
                        self.actions.toggleArchived()
                    }
                    self.deleteButton
                }
            }
            .alert(self.editorTitle, isPresented: self.editorBinding) {
                TextField(self.editorPlaceholder, text: self.$draftText)
                    .font(SteelEngineType.body)
                Button {
                    self.commitEditor()
                } label: {
                    Text(self.editor == .rename
                        ? LocalizedStringKey("Save")
                        : LocalizedStringKey("Create"))
                        .font(SteelEngineType.subheadSemiBold)
                }
                Button(role: .cancel) {
                    self.editor = nil
                } label: {
                    Text("Cancel")
                        .font(SteelEngineType.subheadSemiBold)
                }
            }
            .confirmationDialog(
                "Delete Session?",
                isPresented: self.$confirmsDelete,
                titleVisibility: .visible)
            {
                Button(role: .destructive) {
                    self.actions.delete()
                } label: {
                    Text("Delete Session")
                        .font(SteelEngineType.subheadSemiBold)
                }
                Button(role: .cancel) {} label: {
                    Text("Cancel")
                        .font(SteelEngineType.subheadSemiBold)
                }
            } message: {
                Text("This permanently deletes the session and its transcript.")
                    .font(SteelEngineType.caption)
            }
    }

    private var groupMenu: some View {
        Menu {
            ForEach(self.categories, id: \.self) { category in
                self.actionButton(.verbatim(category), systemImage: "folder") {
                    self.actions.moveToGroup(category)
                }
            }
            self.actionButton("New Group…", systemImage: "folder.badge.plus") {
                self.draftText = ""
                self.editor = .newGroup
            }
            if self.normalized(self.session.category) != nil {
                self.actionButton("Remove from Group", systemImage: "folder.badge.minus") {
                    self.actions.moveToGroup(nil)
                }
            }
        } label: {
            Label("Move to Group", systemImage: "folder")
                .font(SteelEngineType.subhead)
        }
    }

    private var deleteButton: some View {
        Button(role: .destructive) {
            self.confirmsDelete = true
        } label: {
            Label("Delete…", systemImage: "trash")
                .font(SteelEngineType.subhead)
        }
    }

    private var editorBinding: Binding<Bool> {
        Binding(
            get: { self.editor != nil },
            set: { if !$0 { self.editor = nil } })
    }

    private var editorTitle: String {
        self.editor == .newGroup
            ? String(localized: "New Group")
            : String(localized: "Rename Session")
    }

    private var editorPlaceholder: String {
        self.editor == .newGroup
            ? String(localized: "Group name")
            : String(localized: "Session name")
    }

    private func actionButton(
        _ title: SteelEngineTextValue,
        systemImage: String,
        action: @escaping () -> Void) -> some View
    {
        Button(action: action) {
            Label {
                title.text
                    .font(SteelEngineType.subhead)
            } icon: {
                Image(systemName: systemImage)
            }
        }
    }

    private func beginRename() {
        self.draftText = self.normalized(self.session.label)
            ?? self.normalized(self.session.displayName)
            ?? ""
        self.editor = .rename
    }

    private func commitEditor() {
        let value = self.normalized(self.draftText)
        switch self.editor {
        case .rename:
            self.actions.rename(value)
        case .newGroup:
            if let value {
                // Web parity: only prompt-created groups join the stored list,
                // so they survive as empty sections after members leave.
                SessionGroupStore.remember(value)
                self.actions.moveToGroup(value)
            }
        case nil:
            break
        }
        self.editor = nil
    }

    private func normalized(_ value: String?) -> String? {
        guard let value else { return nil }
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}

extension View {
    func commandSessionActions(
        session: SteelEngineChatSessionEntry,
        categories: [String],
        isArchived: Bool = false,
        isEnabled: Bool = true,
        actions: CommandSessionActions) -> some View
    {
        self.modifier(CommandSessionActionsModifier(
            session: session,
            categories: categories,
            isArchived: isArchived,
            isEnabled: isEnabled,
            actions: actions))
    }
}

struct CommandViewMoreRow: View {
    var body: some View {
        Label("View More", systemImage: "chevron.right")
            .font(SteelEngineType.subheadBold)
            .foregroundStyle(SteelEngineBrand.accent)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .contentShape(Rectangle())
    }
}

struct CommandEmptyStateRow: View {
    let icon: String
    let title: SteelEngineTextValue
    let detail: SteelEngineTextValue

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: self.icon)
                .font(SteelEngineType.captionBold)
                .foregroundStyle(SteelEngineBrand.ok)
                .frame(width: 30, height: 30)
                .background {
                    RoundedRectangle(cornerRadius: SteelEngineRadius.xs, style: .continuous)
                        .fill(SteelEngineBrand.ok.opacity(0.10))
                }
            VStack(alignment: .leading, spacing: 2) {
                self.title.text
                    .font(SteelEngineType.subheadSemiBold)
                    .lineLimit(1)
                self.detail.text
                    .font(SteelEngineType.caption2Medium)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 4)
        .padding(.vertical, 6)
    }
}
