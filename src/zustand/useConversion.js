import { create } from "zustand";

const useConversation = create((set, get) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),

  messages: [],
  setMessages: (messagesOrUpdater) =>
    set({
      messages: (() => {
        const next =
          typeof messagesOrUpdater === "function"
            ? messagesOrUpdater(get().messages)
            : messagesOrUpdater;
        return Array.isArray(next) ? next : [];
      })(),
    }),

  // ── Mark messages seen with seen_at timestamp ─────────────
  setMessagesSeen: (conversation_id, seen_at) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        String(m.conversation_id) === String(conversation_id)
          ? { ...m, seen: 1, seen_at }
          : m,
      ),
    })),

  // ── Typing — keyed by String(conversationId) ──────────────
  typingUsers: {},
  setTyping: (conversationId, data) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [String(conversationId)]: data,
      },
    })),
  clearTyping: (conversationId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [String(conversationId)]: null,
      },
    })),
}));

export default useConversation;
