import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import { CheckCircleIcon, XCircleIcon, TrashIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast'; // Import toast for feedback

const UserList = () => {
  const [users, setUsers] = useState([]);
  const { userInfo } = useUser();

  const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

  const fetchUsers = async () => {
      try {
        const { data } = await axios.get('/api/users', config);
        setUsers(data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load users");
      }
  };

  useEffect(() => {
    if(userInfo && userInfo.isAdmin) fetchUsers();
  }, [userInfo]);

  // --- DELETE HANDLER ---
  const deleteHandler = async (id) => {
      if (window.confirm('Are you sure you want to delete this user?')) {
          try {
              await axios.delete(`/api/users/${id}`, config);
              toast.success('User deleted successfully');
              fetchUsers(); // Refresh list
          } catch (err) {
              toast.error(err.response?.data?.message || 'Failed to delete user');
          }
      }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 text-sm text-gray-500">{user._id.substring(0, 10)}...</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500"><a href={`mailto:${user.email}`} className="hover:underline">{user.email}</a></td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.isAdmin ? <CheckCircleIcon className="h-5 w-5 text-green-500"/> : <XCircleIcon className="h-5 w-5 text-red-500"/>}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  {!user.isAdmin && ( // Prevent deleting yourself or other admins easily
                      <button
                        onClick={() => deleteHandler(user._id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default UserList;