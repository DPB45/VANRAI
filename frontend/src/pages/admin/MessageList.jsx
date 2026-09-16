import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { TrashIcon, EnvelopeIcon, EnvelopeOpenIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const MessageList = () => {
  const { userInfo } = useUser();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/messages', config);
      setMessages(data);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  // Clicking a row expands it to show the full message, and marks it read
  // (only if it wasn't already) - the same "open to read" gesture as a
  // real inbox, rather than requiring a separate button for the common case.
  const handleRowClick = async (msg) => {
    setExpandedId((prev) => (prev === msg._id ? null : msg._id));

    if (!msg.isRead) {
      try {
        const { data } = await axios.put(`/api/messages/${msg._id}/read`, { isRead: true }, config);
        setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
      } catch (error) {
        // Non-critical - the row already opened, so just log it rather
        // than interrupting the admin with a toast for a read-status blip.
        console.error('Failed to mark message as read', error);
      }
    }
  };

  // Explicit toggle button, so an admin can mark something back to unread
  // (e.g. "I need to follow up on this later") without deleting it.
  const toggleReadHandler = async (e, msg) => {
    e.stopPropagation(); // don't also trigger the row's expand/collapse
    try {
      const { data } = await axios.put(`/api/messages/${msg._id}/read`, { isRead: !msg.isRead }, config);
      setMessages((prev) => prev.map((m) => (m._id === data._id ? data : m)));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update message');
    }
  };

  const deleteHandler = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await axios.delete(`/api/messages/${id}`, config);
      toast.success('Message deleted');
      setMessages((prev) => prev.filter((m) => m._id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Contact Messages</h1>
        {unreadCount > 0 && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No messages yet. Submissions from the Contact Us form will show up here.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {messages.map((msg) => (
                <React.Fragment key={msg._id}>
                  <tr
                    onClick={() => handleRowClick(msg)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${!msg.isRead ? 'bg-red-50/40' : ''}`}
                  >
                    <td className="pl-6 py-4">
                      <span
                        title={msg.isRead ? 'Read' : 'Unread'}
                        className={`inline-block w-2.5 h-2.5 rounded-full ${!msg.isRead ? 'bg-red-500' : 'bg-transparent'}`}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className={`text-gray-900 ${!msg.isRead ? 'font-semibold' : 'font-medium'}`}>{msg.name}</p>
                      <a
                        href={`mailto:${msg.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-500 hover:underline"
                      >
                        {msg.email}
                      </a>
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-700 max-w-xs truncate ${!msg.isRead ? 'font-semibold' : ''}`}>
                      {msg.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <button
                        onClick={(e) => toggleReadHandler(e, msg)}
                        title={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                        className="text-gray-500 hover:text-gray-800 p-2 rounded hover:bg-gray-100 transition-colors"
                      >
                        {msg.isRead ? <EnvelopeOpenIcon className="h-5 w-5" /> : <EnvelopeIcon className="h-5 w-5" />}
                      </button>
                      <button
                        onClick={(e) => deleteHandler(e, msg._id)}
                        title="Delete"
                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>

                  {expandedId === msg._id && (
                    <tr className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="text-sm text-gray-700 space-y-2">
                          {msg.phone && (
                            <p>
                              <span className="font-semibold">Phone: </span>
                              <a href={`tel:${msg.phone}`} className="hover:underline">{msg.phone}</a>
                            </p>
                          )}
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MessageList;