import React, { useState, useEffect } from 'react';
import { Store as StoreIcon, Star, Users, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Alert from '../components/Alert';
import api from '../services/api';

const RatingStarsReadOnly = ({ rating }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

const OwnerPasswordModal = ({ onClose, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put('/owner/password', { newPassword });
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="8-16 chars, uppercase + special char"
              required
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <p className="text-gray-500 text-sm mt-1">
              Must be 8-16 characters with uppercase and special character
            </p>
          </div>
          <div className="flex gap-2">
            <Button type="submit" fullWidth loading={loading}>
              Update Password
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Main Owner Dashboard
const OwnerDashboard = () => {
  const [storeData, setStoreData] = useState({
    store: null,
    avgRating: 0,
    ratings: []
  });
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      const response = await api.get('/owner/my-store/ratings');
      setStoreData(response.data.data);
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChanged = () => {
    setShowPasswordModal(false);
    setAlert({ type: 'success', message: 'Password updated successfully!' });
    setTimeout(() => setAlert(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar title="Store Owner Dashboard" />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your store data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Store Owner Dashboard" />
      
      {/* Action Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-end">
          <Button variant="secondary" onClick={() => setShowPasswordModal(true)}>
            Change Password
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {alert && (
          <div className="mb-6">
            <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
          </div>
        )}

        {/* Store Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <StoreIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500">Your Store</h3>
                <p className="text-xl font-bold text-gray-800 mt-1">
                  {storeData.store ? storeData.store.name : 'No Store Assigned'}
                </p>
                {storeData.store && (
                  <p className="text-sm text-gray-600 mt-1">{storeData.store.address}</p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
                <div className="flex items-center gap-3 mt-2">
                  <p className="text-3xl font-bold text-gray-800">
                    {storeData.avgRating || 'N/A'}
                  </p>
                  {storeData.avgRating > 0 && (
                    <RatingStarsReadOnly rating={Math.round(storeData.avgRating)} />
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Ratings</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {storeData.ratings.length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">5-Star Ratings</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {storeData.ratings.filter(r => r.rating === 5).length}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Recent Activity</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {storeData.ratings.filter(r => {
                    const ratingDate = new Date(r.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return ratingDate > weekAgo;
                  }).length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Ratings Table */}
        <Card>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Customer Ratings</h3>
          
          {storeData.ratings.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No ratings yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Ratings from customers will appear here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {storeData.ratings.map((rating) => (
                    <tr key={rating.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium">{rating.user_name}</td>
                      <td className="py-3 px-4 text-gray-600">{rating.user_email}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <RatingStarsReadOnly rating={rating.rating} />
                          <span className="font-semibold text-gray-700">{rating.rating}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(rating.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {showPasswordModal && (
        <OwnerPasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={handlePasswordChanged}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;