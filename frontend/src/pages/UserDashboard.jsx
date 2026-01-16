import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RatingStars = ({ rating, onRate, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 transition-all cursor-pointer ${
            star <= (hover || rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          } ${readOnly ? 'cursor-default' : 'hover:scale-110'}`}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onRate && onRate(star)}
        />
      ))}
    </div>
  );
};

const StoreCard = ({ store, onRatingSubmit }) => {
  const [userRating, setUserRating] = useState(store.user_rating || 0);
  const [submitting, setSubmitting] = useState(false);

  const handleRate = async (rating) => {
    setSubmitting(true);
    try {
      await api.post('/user/ratings', {
        storeId: store.id,
        rating
      });
      setUserRating(rating);
      onRatingSubmit();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card hover className="h-full flex flex-col">
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{store.name}</h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{store.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 flex-shrink-0" />
            <span>{store.email}</span>
          </div>
        </div>

        <div className="mb-4 pb-4 border-b">
          <p className="text-sm font-medium text-gray-700 mb-2">Overall Rating</p>
          <div className="flex items-center gap-3">
            <RatingStars rating={parseFloat(store.avg_rating) || 0} readOnly />
            <span className="text-lg font-semibold text-gray-800">
              {store.avg_rating || 'N/A'}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <p className="text-sm font-medium text-gray-700 mb-2">
          {userRating ? 'Your Rating' : 'Rate this store'}
        </p>
        <div className="flex items-center gap-2">
          <RatingStars rating={userRating} onRate={handleRate} readOnly={submitting} />
          {submitting && (
            <span className="text-sm text-gray-500">Saving...</span>
          )}
          {userRating > 0 && !submitting && (
            <span className="text-sm text-green-600">✓ Rated</span>
          )}
        </div>
      </div>
    </Card>
  );
};

// Change Password Modal
const ChangePasswordModal = ({ onClose, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put('/user/password', { newPassword });
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
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={error}
            placeholder="8-16 chars, uppercase + special char"
            helperText="Must be 8-16 characters with uppercase and special character"
            required
          />
          <div className="flex gap-2 mt-6">
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

// Main User Dashboard
const UserDashboard = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchStores();
  }, [searchTerm]);

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/user/stores?${params}`);
      setStores(response.data.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChanged = () => {
    setShowPasswordModal(false);
    setAlert({ type: 'success', message: 'Password updated successfully!' });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar title="Browse Stores" />
      
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

        {/* Search */}
        <Card className="mb-6">
          <Input
            placeholder="Search stores by name or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </Card>

        {/* Stores Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading stores...</p>
          </div>
        ) : stores.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No stores found</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onRatingSubmit={fetchStores}
              />
            ))}
          </div>
        )}
      </div>

      {showPasswordModal && (
        <ChangePasswordModal
          onClose={() => setShowPasswordModal(false)}
          onSuccess={handlePasswordChanged}
        />
      )}
    </div>
  );
};

export default UserDashboard;